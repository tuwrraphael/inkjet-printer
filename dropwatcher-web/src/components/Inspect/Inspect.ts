import template from "./Inspect.html";
import "./Inspect.scss";
import "../MovementControlPanel/MovementControlPanel";
import "../ImageList/ImageList";
import { Store } from "../../state/Store";
import { InspectImage, State, StateChanges } from "../../state/State";
import { DropDetector } from "../../vision/DropDetector";

export class Inspect extends HTMLElement {

    private rendered = false;
    private store: Store;
    private abortController: AbortController;
    private canvas: HTMLCanvasElement;
    private selectedImage: InspectImage;
    constructor() {
        super();
        this.store = Store.getInstance();
    }

    connectedCallback() {
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
            this.canvas = this.querySelector(`canvas`);
        }
        this.abortController = new AbortController();
        this.store.subscribe((state, stageChanges) => this.update(state, stageChanges), this.abortController.signal);
        // abortableEventListener(this.canvas, "click", ev => {
        //     this.detectDrops();
        // }, this.abortController.signal);
        this.update(this.store.state, null);
    }

    private update(state: State, stageChanges: StateChanges) {
        let keysOfInterest = ["inspect"];
        if (state && (null == stageChanges || stageChanges.some((change) => keysOfInterest.includes(change)))) {

            let selectedImage = state.inspect.images.find(x => x.file.name === state.inspect.selectedImageFileName);
            let selectedImageChanged = selectedImage !== this.selectedImage;
            this.selectedImage = selectedImage;
            if (selectedImageChanged) {
                this.renderImage();
            }
        }
    }

    private renderImage() {
        requestAnimationFrame(async () => {
            let ctx = this.canvas.getContext("2d");
            let imageFile = await this.selectedImage?.file.getFile();
            if (imageFile) {
                createImageBitmap(imageFile).then((imageBitmap) => {
                    this.canvas.width = imageBitmap.width;
                    this.canvas.height = imageBitmap.height;
                    ctx.drawImage(imageBitmap, 0, 0);
                    this.detectDrops();
                });
            } else {
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        });
    }

    private detectDrops() {
        let dropDetector = new DropDetector();
        let ctx = this.canvas.getContext("2d");
        let imageData: ImageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        let result = dropDetector.detectDrops(imageData);
        ctx.globalAlpha = 0.3;
        for (let enclosingCircle of result.enclosingCircles) {
            ctx.beginPath();
            ctx.arc(enclosingCircle.x, enclosingCircle.y, enclosingCircle.radius, 0, 2 * Math.PI);
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        for (let ellipse of result.ellipses) {
            ctx.beginPath();
            ctx.ellipse(ellipse.center.x, ellipse.center.y, ellipse.size.width / 2, ellipse.size.height / 2, ellipse.angle * Math.PI / 180, 0, 2 * Math.PI);
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        ctx.globalAlpha = 0.6;
        for (let drop of result.drops) {
            ctx.beginPath();
            ctx.arc(drop.pixel_x, drop.pixel_y, drop.pixel_diameter / 2, 0, 2 * Math.PI);
            ctx.strokeStyle = "yellow";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.font = "20px Arial";
            ctx.fillStyle = "white";

            ctx.globalAlpha = 1;
            ctx.fillText(`d: ${(drop.diameter * 1000).toFixed(2)}μm`, drop.pixel_x, drop.pixel_y + drop.pixel_diameter / 2);
        }

    }



    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const InspectTagName = "app-inspect";
customElements.define(InspectTagName, Inspect);
