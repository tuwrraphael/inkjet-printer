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
import "../CameraView/CameraView";
import { ToggleCameraView } from "../../state/actions/ToggleCameraView";
import { CameraViewTagName } from "../CameraView/CameraView";

export class AppComponent extends HTMLElement {

    private rendered = false;
    private store: Store;
    abortController: AbortController;
    router: AppRouter;
    private saveBtn: HTMLButtonElement;
    private fileStatus: HTMLSpanElement;
    private cameraViewContainer: HTMLDivElement;
    private cameraViewBtn: HTMLButtonElement;
    private cameraViewElement: HTMLElement;
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
            this.cameraViewBtn = this.querySelector("#toggle-camera-view");
            this.cameraViewContainer = this.querySelector("#camera-view-container");
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
        abortableEventListener(this.cameraViewBtn, "click", async (ev) => {
            ev.preventDefault();
            this.store.postAction(new ToggleCameraView());
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
        if (s && c.includes("currentRoute")) {
            console.log("Current route: " + s.currentRoute);
            this.querySelectorAll("a").forEach((e: HTMLAnchorElement) => {
                e.classList.remove("current");
                if (e.getAttribute("href") === s.currentRoute) {
                    e.classList.add("current");
                    e.setAttribute("aria-current", "page");
                } else {
                    e.removeAttribute("aria-current");
                }
            });
        }
        if (s && c.includes("cameraView")) {
            if (s.cameraView.visible && this.cameraViewElement == null) {
                this.cameraViewElement = document.createElement(CameraViewTagName);
                this.cameraViewContainer.appendChild(this.cameraViewElement);
                this.cameraViewContainer.style.display = "";
            } else if (!s.cameraView.visible && this.cameraViewElement != null) {
                this.cameraViewElement.remove();
                this.cameraViewElement = null;
                this.cameraViewContainer.style.display = "none";
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

