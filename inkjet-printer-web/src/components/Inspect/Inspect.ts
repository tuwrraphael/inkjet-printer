import template from "./Inspect.html";
import "./Inspect.scss";
import "../MovementControlPanel/MovementControlPanel";
import "../ImageList/ImageList";
import { Store } from "../../state/Store";
import { InspectImage, State, StateChanges } from "../../state/State";
import { DropDetector } from "../../vision/DropDetector";
import { abortableEventListener } from "../../utils/abortableEventListener";

export class Inspect extends HTMLElement {

    private rendered = false;
    private store: Store;
    private abortController: AbortController;
    private canvas: HTMLCanvasElement;
    private selectedImage: InspectImage;
    private detectedDrops: {
        drops: {
            x: number;
            y: number;
            diameter: number;
            pixel_x: number;
            pixel_y: number;
            pixel_diameter: number;
        }[];
        threshold: number;
        ellipses: {
            center: {
                x: number;
                y: number;
            };
            size: {
                width: number;
                height: number;
            };
            angle: number;
        }[];
        enclosingCircles: {
            radius: number;
            x: number;
            y: number;
        }[];
    };
    bitmap: ImageBitmap;
    selectedDrops: {
        x: number;
        y: number;
        diameter: number;
        pixel_x: number;
        pixel_y: number;
        pixel_diameter: number;
    }[];
    distance: {

        start: {
            x: number;
            y: number;
            diameter: number;
            pixel_x: number;
            pixel_y: number;
            pixel_diameter: number;
        },
        end: {
            x: number;
            y: number;
            diameter: number;
            pixel_x: number;
            pixel_y: number;
            pixel_diameter: number;
        },
        distance: number;
    };
    storedMeasurements: {

        start: {
            x: number;
            y: number;
            diameter: number;
            pixel_x: number;
            pixel_y: number;
            pixel_diameter: number;
        },
        end: {
            x: number;
            y: number;
            diameter: number;
            pixel_x: number;
            pixel_y: number;
            pixel_diameter: number;
        },
        distance: number;
    }[] = [];


    constructor() {
        super();
        this.store = Store.getInstance();
    }

    connectedCallback() {
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
            this.canvas = this.querySelector("canvas");
        }
        this.abortController = new AbortController();
        this.store.subscribe((state, stageChanges) => this.update(state, stageChanges), this.abortController.signal);
        this.update(this.store.state, null);
        abortableEventListener(this.canvas, "click", (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const x = (event.clientX - rect.left) * scaleX;
            const y = (event.clientY - rect.top) * scaleY;

            const clickedDrop = this.detectedDrops.drops.find(drop => {
                const dx = x - drop.pixel_x;
                const dy = y - drop.pixel_y;
                return Math.sqrt(dx * dx + dy * dy) < drop.pixel_diameter / 2;
            });

            if (clickedDrop) {
                if (!this.selectedDrops) {
                    this.selectedDrops = [];
                }
                const index = this.selectedDrops.indexOf(clickedDrop);
                if (index === -1) {
                    this.selectedDrops.push(clickedDrop);
                } else {
                    this.selectedDrops.splice(index, 1);
                }
                if (this.selectedDrops.length === 2) {
                    let pxToMm = 2.975780963 / 1920;
                    let dx = this.selectedDrops[0].pixel_x - this.selectedDrops[1].pixel_x;
                    let dy = this.selectedDrops[0].pixel_y - this.selectedDrops[1].pixel_y;
                    this.distance = {
                        start: this.selectedDrops[0],
                        end: this.selectedDrops[1],
                        distance: Math.sqrt(dx * dx + dy * dy) * pxToMm
                    }
                } else {
                    this.distance = null;
                }
                this.renderImage();
            }
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#add-measurement"), "click", () => {
            if (this.distance != null
            ) {
                this.storedMeasurements.push(this.distance);
                this.distance = null;
                this.selectedDrops = null;
                this.renderImage();
                // render to the measurements table
                this.renderMeasurements();
            }
        }, this.abortController.signal);
    }

    private renderMeasurements() {
        let table = this.querySelector("#measurements");
        table.innerHTML = "";
        let header = document.createElement("tr");
        let th1 = document.createElement("th");
        th1.textContent = "Start";
        header.appendChild(th1);
        let th2 = document.createElement("th");
        th2.textContent = "End";
        header.appendChild(th2);
        let th3 = document.createElement("th");
        th3.textContent = "Distance (μm)";
        header.appendChild(th3);
        table.appendChild(header);
        for (let measurement of this.storedMeasurements) {
            let tr = document.createElement("tr");
            let td1 = document.createElement("td");
            td1.textContent = `(${(measurement.start.x * 1000).toFixed(2)}, ${(measurement.start.y * 1000).toFixed(2)})`;
            tr.appendChild(td1);
            let td2 = document.createElement("td");
            td2.textContent = `(${(measurement.end.x * 1000).toFixed(2)}, ${(measurement.end.y * 1000).toFixed(2)})`;
            tr.appendChild(td2);
            let td3 = document.createElement("td");
            td3.textContent = (measurement.distance * 1000).toFixed(2);
            tr.appendChild(td3);
            table.appendChild(tr);
        }
    }

    private update(state: State, stageChanges: StateChanges) {
        let keysOfInterest = ["inspect"];
        if (state && (null == stageChanges || stageChanges.some((change) => keysOfInterest.includes(change)))) {

            let selectedImage = state.inspect.images.find(x => x.file.name === state.inspect.selectedImageFileName);
            let selectedImageChanged = selectedImage !== this.selectedImage;
            this.selectedImage = selectedImage;
            if (selectedImageChanged) {
                this.renderImage();
                this.imageChanged();
            }
        }
    }


    private async imageChanged() {
        let imageFile = await this.selectedImage?.file.getFile();
        if (imageFile) {
            this.bitmap = await createImageBitmap(imageFile);
            this.detectDrops();
        }
        else {
            this.bitmap = null;
            this.detectedDrops = null;
        }
        this.renderImage();
    }

    private renderImage() {
        requestAnimationFrame(async () => {
            let ctx = this.canvas.getContext("2d");
            if (this.bitmap) {
                let imageBitmap = this.bitmap;
                this.canvas.width = imageBitmap.width;
                this.canvas.height = imageBitmap.height;
                ctx.drawImage(imageBitmap, 0, 0);
                if (this.detectedDrops) {
                    this.drawDrops();
                }
            } else {
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        });
    }

    private detectDrops() {
        let dropDetector = new DropDetector();
        let offscreenCanvas = new OffscreenCanvas(this.canvas.width, this.canvas.height);
        let ctx = offscreenCanvas.getContext("2d");
        ctx.drawImage(this.bitmap, 0, 0);
        let imageData: ImageData = ctx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
        let result = dropDetector.detectDrops(imageData);
        this.detectedDrops = result;
    }

    private drawDrops() {
        let ctx = this.canvas.getContext("2d");
        ctx.globalAlpha = 0.3;
        for (let enclosingCircle of this.detectedDrops.enclosingCircles) {
            ctx.beginPath();
            ctx.arc(enclosingCircle.x, enclosingCircle.y, enclosingCircle.radius, 0, 2 * Math.PI);
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        for (let ellipse of this.detectedDrops.ellipses) {
            ctx.beginPath();
            ctx.ellipse(ellipse.center.x, ellipse.center.y, ellipse.size.width / 2, ellipse.size.height / 2, ellipse.angle * Math.PI / 180, 0, 2 * Math.PI);
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        ctx.globalAlpha = 0.6;
        for (let drop of this.detectedDrops.drops) {
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
        if (this.selectedDrops) {
            ctx.globalAlpha = 0.6;
            for (let selectedDrop of this.selectedDrops) {
                ctx.beginPath();
                ctx.arc(selectedDrop.pixel_x, selectedDrop.pixel_y, selectedDrop.pixel_diameter / 2, 0, 2 * Math.PI);
                ctx.fillStyle = "green";
                ctx.fill();
            }
        }
        if (this.distance != null) {
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.moveTo(this.distance.start.pixel_x, this.distance.start.pixel_y);
            ctx.lineTo(this.distance.end.pixel_x, this.distance.end.pixel_y);
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.font = "20px Arial";
            ctx.fillStyle = "white";
            ctx.fillText(`${(this.distance.distance * 1000).toFixed(2)}μm`,
                (this.distance.start.pixel_x + this.distance.end.pixel_x) / 2,
                (this.distance.start.pixel_y + this.distance.end.pixel_y) / 2);
        }
    }


    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const InspectTagName = "app-inspect";
customElements.define(InspectTagName, Inspect);
