import { Model, ModelParams, State, StateChanges } from "../../state/State";
import { Store } from "../../state/Store";
import { ModelSelected } from "../../state/actions/ModelSelected";
import { ArrayToElementRenderer } from "../../utils/ArrayToElementRenderer";
import { abortableEventListener } from "../../utils/abortableEventListener";
import { ModelListEntry, ModelListEntryTagName } from "../ModelListEntry/ModelListEntry";
import template from "./ModelList.html";
import "./ModelList.scss";

export interface ModelListData {
    model: Model;
    modelParams: ModelParams;
    isSelected: boolean;
}

export class ModelList extends HTMLElement {

    private rendered = false;
    private container: HTMLDivElement;
    private renderer: ArrayToElementRenderer<ModelListData, ModelListEntry, string>;
    private abortController: AbortController;
    private store: Store;
    private selectedElement: ModelListEntry;
    constructor() {
        super();
        this.store = Store.getInstance();
    }

    connectedCallback() {
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
            this.container = this.querySelector(".model-list__container");
            this.renderer = new ArrayToElementRenderer<ModelListData, ModelListEntry, string>(this.container, m => m.model.id, (m) => {
                let el: ModelListEntry = document.createElement(ModelListEntryTagName) as ModelListEntry;
                return el;
            });
        }
        this.abortController = new AbortController();
        this.store.subscribe((s, c) => this.update(s, c), this.abortController.signal);
        abortableEventListener(this.container, "modelselected", ev => {
            this.store.postAction(new ModelSelected(ev.detail));
        }, this.abortController.signal);
        this.update(this.store.state, null);
    }

    private async update(s: State, c: StateChanges) {
        let keysOfInterest: (keyof State)[] = ["models", "printState", "printBedViewState"];
        if (s && (null == c || keysOfInterest.some(k => c.includes(k)))) {
            this.renderer.update(s.models.map(m => {
                return {
                    model: m,
                    modelParams: s.printState.modelParams[m.id],
                    isSelected: s.printBedViewState.selectedModelId === m.id
                };
            }), (e, m) => {
                e.setData(m);
            });
            let selectedElement = this.container.querySelector(`${ModelListEntryTagName}.model-list-entry--selected`);
            if (selectedElement && selectedElement !== this.selectedElement) {
                this.selectedElement = selectedElement as ModelListEntry;
                this.selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
            }
        }
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const ModelListTagName = "model-list";
customElements.define(ModelListTagName, ModelList);
