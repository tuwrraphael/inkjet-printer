import { PrintBedViewStateChanged } from "../../state/actions/PrintBedViewStateChanged";
import { State, StateChanges } from "../../state/State";
import { Store } from "../../state/Store";
import { abortableEventListener } from "../../utils/abortableEventListener";
import { ArrayToElementRenderer } from "../../utils/ArrayToElementRenderer";
import template from "./PrintBedViewStateControl.html";
import "./PrintBedViewStateControl.scss";

export class PrintBedViewStateControl extends HTMLElement {

    private rendered = false;
    private modelGroup: HTMLSelectElement;
    private modelGroupOptionsRenderer: ArrayToElementRenderer<string, HTMLOptionElement, string>;
    private store: Store;
    abortController: AbortController;
    private viewMode: HTMLSelectElement;
    private trackIncrement: HTMLInputElement;
    constructor() {
        super();
        this.store = Store.getInstance();
    }

    connectedCallback() {
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
            this.modelGroup = this.querySelector("#model-group");
            this.viewMode = this.querySelector("#view-mode");
            this.trackIncrement = this.querySelector("#track-increment");
            this.modelGroupOptionsRenderer = new ArrayToElementRenderer<string, HTMLOptionElement, string>(this.modelGroup, k => k, (e) => {
                let o = document.createElement("option");
                return o;
            });
        }
        this.abortController = new AbortController();
        this.store.subscribe((s, c) => this.update(s, c), this.abortController.signal);
        abortableEventListener(this.querySelector("form"), "input", ev => {
            let formData = new FormData(this.querySelector("form"));
            let viewMode = formData.get("view-mode");
            if (viewMode == "rasterization") {
                this.store.postAction(new PrintBedViewStateChanged({
                    viewMode: {
                        mode: "rasterization",
                        modelGroup: formData.get("model-group") as string || null,
                        trackIncrement: parseInt(formData.get("track-increment") as string || "0")
                    },
                }));
            } else if (viewMode == "layerPlan") {
                this.store.postAction(new PrintBedViewStateChanged({
                    viewMode: {
                        mode: "layerPlan",
                    }
                }));
            } else if (viewMode == "printingTrack") {
                this.store.postAction(new PrintBedViewStateChanged({
                    viewMode: {
                        mode: "printingTrack",
                        moveAxisPosition: 0
                    }
                }));
            }
        }, this.abortController.signal);
    }

    private async update(s: State, c: StateChanges) {
        let keysOfInterest: (keyof State)[] = ["printState", "models"];
        if (s && (null == c || keysOfInterest.some(k => c.includes(k)))) {
            let modelGroups = s.models.map(m => s.printState.modelParams[m.id]).map(m => m.modelGroupId);
            this.modelGroupOptionsRenderer.update(modelGroups, (e, m) => {
                e.value = m == null ? "" : m;
                e.innerText = m == null ? "No Group" : m;
            });

            if (s.printBedViewState.viewMode.mode == "rasterization") {
                this.modelGroup.value = s.printBedViewState.viewMode.modelGroup == null ? "" : s.printBedViewState.viewMode.modelGroup;
                this.trackIncrement.value = s.printBedViewState.viewMode.trackIncrement.toString();
            } else {
                let firstOption = this.modelGroup.querySelector("option");
                this.modelGroup.value = firstOption ? firstOption.value : "";
                this.trackIncrement.value = "";
            }

            this.viewMode.value = s.printBedViewState.viewMode.mode;
        }
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const PrintBedViewStateControlTagName = "print-bed-view-state-control";
customElements.define(PrintBedViewStateControlTagName, PrintBedViewStateControl);
