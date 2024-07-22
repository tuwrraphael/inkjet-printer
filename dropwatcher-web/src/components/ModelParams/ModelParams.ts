import { ModelGroupPrintingParams } from "../../slicer/ModelGroupPrintingParams";
import { PrintingParams } from "../../slicer/PrintingParams";
import { Model, ModelParams, State, StateChanges } from "../../state/State";
import { Store } from "../../state/Store";
import { ModelGroupParamsChanged, ModelParamsChanged } from "../../state/actions/ModelParamsChanged";
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
    private modelGroupForm: HTMLFormElement;
    // private skipNozzles: HTMLInputElement;
    private modelLayers: HTMLSpanElement;
    private modelGroup: HTMLInputElement;
    private updateFormDebouncedTimeout: NodeJS.Timeout;
    private modelGroupParamsForm: HTMLFormElement;
    private dryingTime: HTMLInputElement;
    private fireEveryTicks: HTMLSelectElement;
    private voltage: HTMLInputElement;
    private skipNozzles: HTMLInputElement;
    private offsetEveryOtherLayerByTicks: HTMLInputElement;
    private offsetEveryOtherLayerByNozzles: HTMLInputElement;
    // private iterativeOffset: HTMLSelectElement;
    // private iterativeOffsetOptionsRenderer: ArrayToElementRenderer<{ offset: number; }, HTMLOptionElement, number>;
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
            this.modelGroupForm = this.querySelector("#model-group-form");
            this.modelGroup = this.querySelector("#model-group");
            this.modelGroupParamsForm = this.querySelector("#model-group-params-form");
            this.dryingTime = this.querySelector("#drying-time");
            this.fireEveryTicks = this.querySelector("#fire-every-ticks");
            this.voltage = this.querySelector("#voltage");
            this.skipNozzles = this.querySelector("#skip-nozzles");
            this.offsetEveryOtherLayerByTicks = this.querySelector("#offset-every-other-layer-by-ticks");
            this.offsetEveryOtherLayerByNozzles = this.querySelector("#offset-every-other-layer-by-nozzles");
        }
        this.abortController = new AbortController();
        this.store.subscribe((s, c) => this.update(s, c), this.abortController.signal);

        abortableEventListener(this.modelGroupForm, "submit", ev => {
            ev.preventDefault();
            this.updateForm();
        }, this.abortController.signal);
        abortableEventListener(this.modelGroupParamsForm, "submit", ev => {
            ev.preventDefault();
            this.updateModelGroupParams();
        }, this.abortController.signal);
        this.update(this.store.state, null);
        this.setVisibility();
    }
    private updateModelGroupParams() {
        if (this.modelGroupParamsForm.checkValidity()) {
            let formData = new FormData(this.modelGroupParamsForm);
            let modelGroupParams: ModelGroupPrintingParams = {};
            if (formData.has("drying-time")) {
                modelGroupParams.dryingTimeSeconds = parseFloat(formData.get("drying-time") as string);
            }
            if (formData.has("fire-every-ticks")) {
                modelGroupParams.fireEveryTicks = parseInt(formData.get("fire-every-ticks") as string);
            }
            if (formData.has("voltage")) {
                modelGroupParams.waveform = { voltage: parseFloat(formData.get("voltage") as string) };
            }
            if (formData.has("skip-nozzles")) {
                modelGroupParams.skipNozzles = parseInt(formData.get("skip-nozzles") as string);
            }
            modelGroupParams.offsetLayers = {
                printAxis: {
                    everyOtherLayerByTicks: null,
                },
                moveAxis: {
                    everyOtherLayerByNozzles: null,
                }
            };
            if (formData.has("offset-every-other-layer-by-ticks")) {
                modelGroupParams.offsetLayers.printAxis.everyOtherLayerByTicks = parseInt(formData.get("offset-every-other-layer-by-ticks") as string);
            }
            if (formData.has("offset-every-other-layer-by-nozzles")) {
                modelGroupParams.offsetLayers.moveAxis.everyOtherLayerByNozzles = parseInt(formData.get("offset-every-other-layer-by-nozzles") as string);
            }
            this.store.postAction(new ModelGroupParamsChanged(this.modelParams.modelGroupId, modelGroupParams));
        } else {
            this.modelGroupParamsForm.reportValidity();
        }
    }

    private updateForm() {
        if (this.modelGroupForm.checkValidity()) {
            let formData = new FormData(this.modelGroupForm);
            this.store.postAction(new ModelParamsChanged(this.model.id, {
                modelGroupId: formData.get("model-group") as string || null,
            }));
        } else {
            this.modelGroupForm.reportValidity();
        }
    }

    private setInput(input: HTMLInputElement | HTMLSelectElement,
        valueSelector: (v: ModelGroupPrintingParams) => any,
        modelGroupParams: ModelGroupPrintingParams, printingParams: PrintingParams) {
        let value = valueSelector(modelGroupParams);
        if (value != null) {
            input.value = value.toString();
            input.classList.add("model-params__input--specified");
        } else {
            let val = valueSelector(printingParams);
            input.value = val != null ? val.toString() : "";
            input.classList.remove("model-params__input--specified");
        }
    }

    private setVisibility() {
        this.noModelSelected.style.display = this.model ? "none" : "";
        this.modelParamsContainer.style.display = this.model ? "" : "none";
    }

    private async update(s: State, c: StateChanges) {
        let keysOfInterest: (keyof State)[] = ["models", "printState", "printBedViewState"];
        if (s && (null == c || keysOfInterest.some(k => c.includes(k)))) {
            this.model = s.printBedViewState.selectedModelId != null ? s.models.find(m => m.id === s.printBedViewState.selectedModelId) : null;
            if (!this.model) {
                return;
            }
            this.modelParams = s.printState.modelParams[this.model.id];
            if (this.model) {
                this.modelName.textContent = this.model.fileName;
                // this.skipNozzles.value = (this.modelParams.skipNozzles || 0).toString();
                this.modelLayers.textContent = this.model.layers.length.toString();
                // this.iterativeOffset.value = (this.modelParams.iterativeOffset || 0).toString();
                this.modelGroup.value = this.modelParams.modelGroupId || "";
            }
            let currentModelGroup = this.modelParams.modelGroupId;
            let modelGroupParams = s.printState.modelGroupPrintingParams[currentModelGroup];

            let printingParams = s.printState.printingParams;

            this.setInput(this.dryingTime, (params) => params?.dryingTimeSeconds, modelGroupParams, printingParams);
            this.setInput(this.fireEveryTicks, (params) => params?.fireEveryTicks, modelGroupParams, printingParams);
            this.setInput(this.voltage, (params) => params?.waveform?.voltage, modelGroupParams, printingParams);
            this.setInput(this.skipNozzles, (params) => params?.skipNozzles, modelGroupParams, printingParams);
            this.setInput(this.offsetEveryOtherLayerByTicks, (params) => params?.offsetLayers?.printAxis?.everyOtherLayerByTicks, modelGroupParams, printingParams);
            this.setInput(this.offsetEveryOtherLayerByNozzles, (params) => params?.offsetLayers?.moveAxis?.everyOtherLayerByNozzles, modelGroupParams, printingParams);

            this.setVisibility();
        }

        // let max = s.printState.printingParams.fireEveryTicks - 1;
        // if (max == 0) {
        //     this.iterativeOffset.value = "0";
        //     this.iterativeOffset.disabled = true;
        // } else {
        //     this.iterativeOffset.disabled = false;
        // }
        // let possibleOffsets = [0, ...Array.from({ length: max }, (_, i) => i + 1)];
        // this.iterativeOffsetOptionsRenderer.update(possibleOffsets.map(o => ({ offset: o })), (e, k) => {
        //     e.value = k.offset.toString();
        //     e.textContent = k.offset == 0 ? "off" : k.offset == 1 ? "1 tick" : k.offset + " ticks";
        // });
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const ModelParamsTagName = "model-params";
customElements.define(ModelParamsTagName, ModelParamsComponent);
