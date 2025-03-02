import { NozzleBlockStatusChanged } from "../../state/actions/NozzleBlockStatusChanged";
import { InspectImage, InspectImageType, State, StateChanges } from "../../state/State";
import { Store } from "../../state/Store";
import { abortableEventListener } from "../../utils/abortableEventListener";
import template from "./NozzleTestElement.html";
import "./NozzleTestElement.scss";

export class NozzleTestElement extends HTMLElement {
    private rendered = false;
    private _nozzle: number | undefined;
    private nozzleId: HTMLSpanElement;
    private label: HTMLLabelElement;
    private blocked: HTMLInputElement;
    private store: Store;
    private abortController: AbortController;
    private isBlocked: boolean;
    private blockedText: HTMLSpanElement;
    private canvas: HTMLCanvasElement;
    private selectedImage: InspectImage;
    private isEnlarged: boolean;
    private imgFilename: HTMLSpanElement;

    constructor() {
        super();
        this.store = Store.getInstance();
    }

    connectedCallback() {
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
            this.nozzleId = this.querySelector(".nozzle-id");
            this.label = this.querySelector("label");
            this.blocked = this.querySelector("[name=blocked]");
            this.blockedText = this.querySelector(".blocked-text");
            this.canvas = this.querySelector("canvas");
            this.imgFilename = this.querySelector(".img-filename");

            this.update();
        }
        this.abortController = new AbortController();
        this.store.subscribe((s, c) => this.updateStore(s, c), this.abortController.signal);
        abortableEventListener(this.blocked, "change", (ev) => {
            this.store.postAction(new NozzleBlockStatusChanged([
                { nozzleId: this.nozzle, blocked: this.blocked.checked }
            ]));
        }, this.abortController.signal);
        abortableEventListener(this.canvas, "click", (ev) => {
            this.isEnlarged = !this.isEnlarged;
            this.canvas.classList.toggle("enlarged", this.isEnlarged);
            this.renderImage();
        }, this.abortController.signal);
        this.updateStore(this.store.state, null);
    }
    updateStore(s: State, c: StateChanges): void {
        if (s && (null == c || c.some((change) => ["printState"].includes(change)))) {
            this.isBlocked = s.printState.printerParams.blockedNozzles.find(n => n === this.nozzle) !== undefined;
            this.update();
        }
        if (s && (null == c || c.some((change) => ["inspect"].includes(change)))) {
            let nozzleImages = s.inspect.images.filter(x => x.metadata.type == InspectImageType.NozzleTest && new RegExp(`nozzletest_-?\\d+_${this.nozzle}[_.]`).test(x.file.name))
                .sort((a, b) => +b.metadata.timestamp - +a.metadata.timestamp);
            let selectedImage = nozzleImages.length > 0 ? nozzleImages[0] : null;
            let selectedImageChanged = selectedImage !== this.selectedImage;
            this.selectedImage = selectedImage;
            if (selectedImageChanged) {
                this.renderImage();
            }

            this.update();
        }
    }

    private renderImage() {

        let ctx = this.canvas.getContext("2d");
        this.selectedImage?.file.getFile().then(imageFile => {
            if (imageFile) {
                let opts: ImageBitmapOptions = this.isEnlarged ? {} : { resizeWidth: 160, resizeQuality: "low" };
                createImageBitmap(imageFile, opts).then((imageBitmap) => {
                    requestAnimationFrame(async () => {
                        this.canvas.width = imageBitmap.width;
                        this.canvas.height = imageBitmap.height;
                        ctx.drawImage(imageBitmap, 0, 0);
                    });
                });
            } else {
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        });
    }

    get nozzle(): number | undefined {
        return this._nozzle;
    }

    set nozzle(value: number | undefined) {
        this._nozzle = value;
    }

    static get observedAttributes() {
        return ["nozzle"];
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === "nozzle") {
            this.nozzle = parseInt(newValue);
        }
        this.update();
    }

    update() {
        if (!this.rendered) {
            return;
        }
        this.nozzleId.innerText = this.nozzle.toString();
        this.label.htmlFor = `blocked-${this.nozzle}`;
        this.blocked.id = `blocked-${this.nozzle}`;
        this.blocked.checked = this.isBlocked;
        this.blockedText.innerText = this.isBlocked ? "Blocked" : "Blocked";
        this.label.classList.toggle("blocked-display--blocked", this.isBlocked);
        this.imgFilename.innerText = this.selectedImage?.file.name || "";
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const NozzleTestElementTagName = "nozzle-test-element";
customElements.define(NozzleTestElementTagName, NozzleTestElement);
