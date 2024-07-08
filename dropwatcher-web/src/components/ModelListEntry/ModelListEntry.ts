import { abortableEventListener } from "../../utils/abortableEventListener";
import { ModelListData } from "../ModelList/ModelList";
import template from "./ModelListEntry.html";
import "./ModelListEntry.scss";

export class ModelListEntry extends HTMLElement {

    private rendered = false;
    private data: ModelListData;
    private name: HTMLSpanElement;
    abortController: AbortController;
    constructor() {
        super();
    }

    connectedCallback() {
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
            this.name = this.querySelector(`[data-ref="name"]`);
        }
        this.abortController = new AbortController();
        abortableEventListener(this, "click", ev => {
            this.dispatchEvent(new CustomEvent("modelselected", { detail: this.data.model.id, bubbles: true}));
        }, this.abortController.signal);
        this.update();
    }

    setData(m: ModelListData) {
        this.data = m;
        this.update();
    }

    private update() {
        if (!this.rendered) {
            return;
        }
        if (this.data) {
            this.name.textContent = this.data.model.fileName;
            this.classList.toggle("model-list-entry--selected", this.data.isSelected);
            this.setAttribute("aria-selected", this.data.isSelected ? "true" : "false");
        }
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const ModelListEntryTagName = "model-list-entry";
customElements.define(ModelListEntryTagName, ModelListEntry);
