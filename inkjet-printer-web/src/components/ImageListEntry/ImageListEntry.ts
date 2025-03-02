import { InspectImage } from "../../state/State";
import { abortableEventListener } from "../../utils/abortableEventListener";
import { ImageListData } from "../ImageList/ImageList";
import template from "./ImageListEntry.html";
import "./ImageListEntry.scss";

export class ImageListEntry extends HTMLElement {

    private rendered = false;
    private data: ImageListData;
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
            this.dispatchEvent(new CustomEvent("imageselected", { detail: this.data.image.file.name, bubbles: true }));
        }, this.abortController.signal);
        this.update();
    }

    setData(m: ImageListData) {
        this.data = m;
        this.update();
    }

    private update() {
        if (!this.rendered) {
            return;
        }
        if (this.data) {
            this.name.textContent = this.data.image.file.name;
            this.classList.toggle("image-list-entry--selected", this.data.isSelected);
            this.setAttribute("aria-selected", this.data.isSelected ? "true" : "false");
        }
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const ImaggeListEntryTagName = "image-list-entry";
customElements.define(ImaggeListEntryTagName, ImageListEntry);
