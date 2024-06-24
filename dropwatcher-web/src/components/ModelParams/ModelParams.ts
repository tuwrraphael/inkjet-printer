import { Model, ModelParams, State, StateChanges } from "../../state/State";
import { Store } from "../../state/Store";
import { ModelParamsChanged } from "../../state/actions/ModelParamsChanged";
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
    private skipNozzles : HTMLInputElement;
    private modelLayers : HTMLSpanElement;
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
        }
        this.abortController = new AbortController();
        this.store.subscribe((s, c) => this.update(s, c), this.abortController.signal);

        abortableEventListener(this.form, "input", ev => {
            if (this.form.checkValidity()) {
                let formData = new FormData(this.form);
                this.store.postAction(new ModelParamsChanged(this.model.id, {
                    skipNozzles: parseInt(formData.get("skip-nozzles") as string),
                }));
            } else {
                this.form.reportValidity();
            }
        }, this.abortController.signal);
        this.update(this.store.state, null);
    }

    private async update(s: State, c: StateChanges) {
        let keysOfInterest: (keyof State)[] = ["models", "printState", "selectedModelId"];
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
        }
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const ModelParamsTagName = "model-params";
customElements.define(ModelParamsTagName, ModelParamsComponent);
