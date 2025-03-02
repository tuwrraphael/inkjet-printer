
import { InspectImage, State, StateChanges } from "../../state/State";
import { Store } from "../../state/Store";

import template from "./ImageList.html";
import "./ImageList.scss";
import { ArrayToElementRenderer } from "../../utils/ArrayToElementRenderer";
import { ImageListEntry, ImaggeListEntryTagName } from "../ImageListEntry/ImageListEntry";
import { abortableEventListener } from "../../utils/abortableEventListener";
import { ImageSelected } from "../../state/actions/ImageSelected";

export interface ImageListData {
    image: InspectImage;
    isSelected: boolean;
}

export class ImageList extends HTMLElement {

    private rendered = false;
    private store: Store;
    private abortController: AbortController;
    private imageListRenderer: ArrayToElementRenderer<InspectImage, ImageListEntry, string>;
    private selectedElement: ImageListEntry;
    constructor() {
        super();
        this.store = Store.getInstance();
    }

    connectedCallback() {
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
            this.imageListRenderer = new ArrayToElementRenderer<InspectImage, ImageListEntry, string>(this.querySelector(".image-list__container"), (x) => x.file.name, (x) => {
                let el: ImageListEntry = document.createElement(ImaggeListEntryTagName) as ImageListEntry;
                return el;
            });
        }
        this.abortController = new AbortController();
        this.store.subscribe((state, stageChanges) => this.update(state, stageChanges), this.abortController.signal);
        abortableEventListener(this, "imageselected", ev => {
            this.store.postAction(new ImageSelected(ev.detail));
        }, this.abortController.signal);
        this.update(this.store.state, null);
    }
    update(state: State, stageChanges: StateChanges): void {
        let keysOfInterest = ["inspect"];
        if (state && (null == stageChanges || stageChanges.some((change) => keysOfInterest.includes(change)))) {
            this.imageListRenderer.update(state.inspect.images, (element, data) => {
                element.setData({
                    image: data,
                    isSelected: state.inspect.selectedImageFileName && state.inspect.selectedImageFileName === data.file.name
                });
            });
            let selectedElement = this.querySelector(`${ImaggeListEntryTagName}.image-list-entry--selected`);
            if (selectedElement && selectedElement !== this.selectedElement) {
                this.selectedElement = selectedElement as ImageListEntry;
                this.selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
            }
        }

    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const ImageListTagName = "image-list";
customElements.define(ImageListTagName, ImageList);
