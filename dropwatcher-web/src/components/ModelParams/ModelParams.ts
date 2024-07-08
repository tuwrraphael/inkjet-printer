import { Model, ModelParams, State, StateChanges } from "../../state/State";
import { Store } from "../../state/Store";
import { ModelParamsChanged } from "../../state/actions/ModelParamsChanged";
import { ArrayToElementRenderer } from "../../utils/ArrayToElementRenderer";
import { abortableEventListener } from "../../utils/abortableEventListener";
import template from "./ModelParams.html";
import "./ModelParams.scss";

export class ModelParamsComponent extends HTMLElement {

    private rendered = false;
    private store: Store;
    private abortController: AbortController;
    private model: Model;
    private modelParams: ModelParams;
    private noModelSelected: HTMLDivElement;
    private modelParamsContainer: HTMLDivElement;
    private modelName: HTMLSpanElement;
    private form: HTMLFormElement;
    private skipNozzles: HTMLInputElement;
    private modelLayers: HTMLSpanElement;
    private iterativeOffset: HTMLSelectElement;
    private iterativeOffsetOptionsRenderer: ArrayToElementRenderer<{ offset: number; }, HTMLOptionElement, number>;
    constructor() {
        super();
        this.store = Store.getInstance();
    }

    connectedCallback() {
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
            this.noModelSelected = this.querySelector("#no-model-selected");
            this.modelParamsContainer = this.querySelector("#model-params");
            this.modelName = this.querySelector("#model-name");
            this.modelLayers = this.querySelector("#model-layers");
            this.form = this.querySelector("form");
            this.skipNozzles = this.querySelector("#skip-nozzles");
            this.iterativeOffset = this.querySelector("#iterative-offset");
            this.iterativeOffsetOptionsRenderer = new ArrayToElementRenderer<{ offset: number }, HTMLOptionElement, number>(this.iterativeOffset, k => k.offset, (e) => {
                let o = document.createElement("option");
                return o;
            });
        }
        this.abortController = new AbortController();
        this.store.subscribe((s, c) => this.update(s, c), this.abortController.signal);

        abortableEventListener(this.form, "input", ev => {
            if (this.form.checkValidity()) {
                let formData = new FormData(this.form);
                this.store.postAction(new ModelParamsChanged(this.model.id, {
                    skipNozzles: parseInt(formData.get("skip-nozzles") as string),
                    iterativeOffset: parseInt(formData.get("iterative-offset") as string)
                }));
            } else {
                this.form.reportValidity();
            }
        }, this.abortController.signal);
        this.update(this.store.state, null);
    }

    private async update(s: State, c: StateChanges) {
        let keysOfInterest: (keyof State)[] = ["models", "printState", "selectedModelId"];
        if (null == s) {
            return;
        }
        if (s && (null == c || keysOfInterest.some(k => c.includes(k)))) {
            this.model = s.selectedModelId != null ? s.models.find(m => m.id === s.selectedModelId) : null;
            if (!this.model) {
                return;
            }
            this.modelParams = s.printState.modelParams[this.model.id];
        }
        this.noModelSelected.style.display = this.model ? "none" : "";
        this.modelParamsContainer.style.display = this.model ? "" : "none";
        if (this.model) {
            this.modelName.textContent = this.model.fileName;
            this.skipNozzles.value = (this.modelParams.skipNozzles || 0).toString();
            this.modelLayers.textContent = this.model.layers.length.toString();
            this.iterativeOffset.value = (this.modelParams.iterativeOffset || 0).toString();
        }
        let max = s.printState.printingParams.fireEveryTicks - 1;
        if (max == 0) {
            this.iterativeOffset.value = "0";
            this.iterativeOffset.disabled = true;
        } else {
            this.iterativeOffset.disabled = false;
        }
        let possibleOffsets = [0, ...Array.from({ length: max }, (_, i) => i + 1)];
        this.iterativeOffsetOptionsRenderer.update(possibleOffsets.map(o => ({ offset: o })), (e, k) => {
            e.value = k.offset.toString();
            e.textContent = k.offset == 0 ? "off" : k.offset == 1 ? "1 tick" : k.offset + " ticks";
        });
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const ModelParamsTagName = "model-params";
customElements.define(ModelParamsTagName, ModelParamsComponent);
