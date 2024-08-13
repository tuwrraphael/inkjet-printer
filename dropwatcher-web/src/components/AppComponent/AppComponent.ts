import { State, StateChanges } from "../../state/State";
import { Store } from "../../state/Store";
import template from "./AppComponent.html";
import "./AppComponent.scss";
import "../PrinterStatus/PrinterStatus";
import { AppRouter } from "../../app-router";
import { abortableEventListener } from "../../utils/abortableEventListener";
import { OpenFile } from "../../state/actions/OpenFile";
import { SaveToFile } from "../../state/actions/SaveToFile";
import { SaveToCurrentFile } from "../../state/actions/SaveToCurrentFile";
import { OutputFolderChanged } from "../../state/actions/OutputFolderChanged";

export class AppComponent extends HTMLElement {

    private rendered = false;
    private store: Store;
    abortController: AbortController;
    router: AppRouter;
    private saveBtn: HTMLButtonElement;
    private fileStatus: HTMLSpanElement;
    constructor() {
        super();
        this.store = Store.getInstance();
    }
    connectedCallback() {
        this.abortController = new AbortController();
        this.store.subscribe((s, c) => this.update(s, c), this.abortController.signal);

        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
            this.querySelectorAll("a").forEach((e: HTMLAnchorElement) => {
                e.addEventListener("click", ev => {
                    ev.preventDefault();
                    this.router.router.navigate(e.getAttribute("href"), null);
                });
            });
            this.saveBtn = this.querySelector("#save");
            this.fileStatus = this.querySelector("#file-status");
        }
        this.update(this.store.state, <StateChanges>Object.keys(this.store.state || {}));
        this.router = AppRouter.getInstance();
        this.router.router.run();

        const types: FilePickerAcceptType[] = [{
            description: "Inkjet Print File",
            accept: {
                "application/json": [".json"]
            }
        }];


        abortableEventListener(this.querySelector("#open-file"), "click", async (event) => {
            event.preventDefault();
            try {
                const [fileHandle] = await window.showOpenFilePicker({
                    types: types
                });
                this.store.postAction(new OpenFile(fileHandle));
            } catch (e) {
                console.error(e);
                return;
            }
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#save-as"), "click", async (event) => {
            event.preventDefault();
            try {
                const fileHandle = await window.showSaveFilePicker({
                    types: types
                });
                this.store.postAction(new SaveToFile(fileHandle));
            } catch (e) {
                console.error(e);
                return;
            }
        }, this.abortController.signal);
        abortableEventListener(this.saveBtn, "click", async (event) => {
            event.preventDefault();
            await this.saveToCurrentFile();
        }, this.abortController.signal);
        abortableEventListener(document, "keydown", async (event) => {
            if (event.ctrlKey && event.key === "s") {
                event.preventDefault();
                await this.saveToCurrentFile();
            }
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#select-output-folder"), "click", async (ev) => {
            ev.preventDefault();
            try {
                let outputFolder = await window.showDirectoryPicker({
                    mode: "readwrite",
                    startIn: "documents"
                });
                this.store.postAction(new OutputFolderChanged(outputFolder));

            } catch (e) {
                console.error(e);
            }
        }, this.abortController.signal);

    }


    private async saveToCurrentFile() {
        if (!this.store.state.currentFileState.currentFile) {
            return;
        }
        let fileHandle = this.store.state.currentFileState.currentFile;
        if ((await fileHandle.queryPermission({ mode: "readwrite" })) === 'granted') {
            this.store.postAction(new SaveToCurrentFile());
        } else {
            try {
                let permissionState = await fileHandle.requestPermission({ mode: "readwrite" });
                if (permissionState !== 'granted') {
                    return;
                }
                this.store.postAction(new SaveToCurrentFile());
            }
            catch (e) {
                console.error(e);
                return;
            }
        }
    }

    update(s: State, c: StateChanges): void {
        // // if (c.includes("testprop")) {
        // let el = document.createElement("div");
        // el.innerText = "State: " + JSON.stringify(s);
        // this.appendChild(el);
        // // }
        if (s && c.includes("currentFileState")) {
            this.saveBtn.disabled = !s.currentFileState;
            if (s.currentFileState) {
                this.fileStatus.innerText = `${s.currentFileState.currentFile.name}`;
                if (s.currentFileState.saving) {
                    this.fileStatus.innerText += " (saving)";
                }
                else if (s.currentFileState.lastSaved) {
                    let lastSaved = new Intl.DateTimeFormat([], { timeStyle: 'medium' }).format(s.currentFileState.lastSaved);
                    this.fileStatus.innerText += ` (last saved ${lastSaved})`;
                }
            }
        }
    }

    disconnectedCallback() {
        this.abortController.abort();
        this.router.router.destroy();
        AppRouter.instance = null;
    }
}
export const AppComponentTagName = "app-component";
customElements.define(AppComponentTagName, AppComponent);

