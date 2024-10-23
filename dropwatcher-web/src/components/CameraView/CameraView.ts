import { ContextExclusionPlugin } from "webpack";
import { CameraAccess } from "../../camera-access";
import { CameraType } from "../../CameraType";
import { MovementStage } from "../../movement-stage";
import { ChangeCameraViewParams } from "../../state/actions/ChangeCameraViewParams";
import { InspectImageType, State, StateChanges } from "../../state/State";
import { Store } from "../../state/Store";
import { abortableEventListener } from "../../utils/abortableEventListener";
import template from "./CameraView.html";
import "./CameraView.scss";
import *as cv from "@techstark/opencv-js";
import "../MovementControlPanel/MovementControlPanel";

export class CameraView extends HTMLElement {

    private rendered = false;
    private store: Store;
    abortController: AbortController;
    private cameraSelect: HTMLSelectElement;
    private video: HTMLVideoElement;
    private canvas: HTMLCanvasElement;
    private videoActive: boolean = false;
    private showCrosshair: boolean;
    private showCrossHair: HTMLInputElement;
    private nextVideoClickMessage: HTMLSpanElement;
    private movementStage: MovementStage;
    private nextVideoClick: "autofocus" | "measure1" | "measure2";
    private measurementPoint1: { x: number; y: number; };
    private measurementPoint2: { x: number; y: number; };
    private resizeObserver: ResizeObserver;
    private saveImgBtn: HTMLButtonElement;
    center: { x: number; y: number; };
    constructor() {
        super();
        this.store = Store.getInstance();
        this.movementStage = MovementStage.getInstance();
    }

    connectedCallback() {
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
            this.cameraSelect = this.querySelector("#camera-view__select");
            this.video = this.querySelector("video");
            this.canvas = this.querySelector("canvas");
            this.showCrossHair = this.querySelector("#show-crosshair");
            this.saveImgBtn = this.querySelector("#save-img");
        }
        this.abortController = new AbortController();
        this.store.subscribe((s, c) => this.update(s, c), this.abortController.signal);
        this.update(this.store.state, null);
        abortableEventListener(this.cameraSelect, "change", async (e) => {
            let cameraType = <CameraType>this.cameraSelect.value || null;
            this.store.postAction(new ChangeCameraViewParams({
                selectedCamera: cameraType
            }));
            if (null != cameraType) {
                if (false == !!(this.store.state.cameras[cameraType]?.cameraOn)) {
                    let cameraAccess = CameraAccess.getInstance(cameraType);
                    await cameraAccess.start();
                }

            }
        }, this.abortController.signal);
        abortableEventListener(this.showCrossHair, "change", async (e) => {
            this.store.postAction(new ChangeCameraViewParams({
                showCrosshair: this.showCrossHair.checked
            }));
        }, this.abortController.signal);
        this.nextVideoClickMessage = this.querySelector("#videoclickmessage");
        abortableEventListener(this.querySelector("#autofocus"), "click", (e) => {
            e.preventDefault();
            this.nextVideoClick = "autofocus";
            this.setNextVideoClickMessage();
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#measure"), "click", (e) => {
            e.preventDefault();
            this.nextVideoClick = "measure1";
            this.setNextVideoClickMessage();
        }, this.abortController.signal);
        abortableEventListener(this.video, "click", (ev: MouseEvent) => {
            switch (this.nextVideoClick) {
                case "autofocus":
                    this.performAutoFocus(ev);
                    break;
                case "measure1":
                    this.selectMeasurementPoint1(ev);
                    break;
                case "measure2":
                    this.performMeasurement(ev);
                    break;
                default: break;
            }
        }, this.abortController.signal);
        abortableEventListener(this.video, "mousemove", (ev: MouseEvent) => {
            if (this.nextVideoClick == "measure2") {
                this.measurementPoint2 = { x: ev.offsetX, y: ev.offsetY };
                this.renderCanvas();
            }
        }, this.abortController.signal);
        abortableEventListener(this.saveImgBtn, "click", async (ev) => {
            ev.preventDefault();
            let cameraAccess = CameraAccess.getInstance(this.store.state.cameraView.selectedCamera);
            await cameraAccess.saveImage("cameraview", InspectImageType.Unknown);
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#detect-homing-fiducial"), "click", async (ev) => {
            ev.preventDefault();
            this.detectHomingFiducial();
        }, this.abortController.signal);
        this.resizeObserver = new ResizeObserver(() => {
            this.renderCanvas();
        });
        this.resizeObserver.observe(this.video);
    }

    private setNextVideoClickMessage() {
        switch (this.nextVideoClick) {
            case "autofocus":
                this.nextVideoClickMessage.innerText = "Click the video to set focus";
                break;
            case "measure1":
                this.nextVideoClickMessage.innerText = "Click the video to select the first measurement point";
                break;
            case "measure2":
                this.nextVideoClickMessage.innerText = "Click the video to select the second measurement point";
                break;
            default:

                break;
        }
        this.nextVideoClickMessage.style.display = this.nextVideoClick ? "" : "none";
    }

    private async performAutoFocus(args: MouseEvent) {
        this.nextVideoClick = null;
        this.setNextVideoClickMessage();
        using movementExecutor = this.movementStage.getMovementExecutor("cameraview");
        let videoElementX = args.offsetX;
        let videoElementY = args.offsetY;
        let x = (videoElementX / this.video.clientWidth);
        let y = (videoElementY / this.video.clientHeight);
        let cameraAccess = CameraAccess.getInstance(this.store.state.cameraView.selectedCamera);
        await cameraAccess.performAutoFocus(x, y, movementExecutor);
    }

    private selectMeasurementPoint1(args: MouseEvent) {
        this.measurementPoint1 = { x: args.offsetX, y: args.offsetY };
        this.nextVideoClick = "measure2";
        this.setNextVideoClickMessage();
    }

    private performMeasurement(args: MouseEvent) {
        let x = args.offsetX;
        let y = args.offsetY;
        let x1 = this.measurementPoint1.x;
        let y1 = this.measurementPoint1.y;
        let dx = x - x1;
        let dy = y - y1;
        let distance = Math.sqrt(dx * dx + dy * dy);

        let mm = (distance / (this.video.clientWidth)) * 2.975780963;

        console.log(distance, mm);
        this.nextVideoClick = null;
        this.setNextVideoClickMessage();
    }

    update(state: State, stateChanges: StateChanges): void {
        let keysOfInterest = ["cameraView", "cameras"];
        if (state && (null == stateChanges || stateChanges.some((change) => keysOfInterest.includes(change)))) {
            this.cameraSelect.value = state.cameraView.selectedCamera || "";

            let cameraState = state.cameras[state.cameraView.selectedCamera];

            let cameraOn = cameraState?.cameraOn;

            if (!this.videoActive && cameraOn) {
                let cameraAccess = CameraAccess.getInstance(state.cameraView.selectedCamera);
                let stream = cameraAccess.getStream();
                this.video.srcObject = stream;
                this.videoActive = true;
            } else if (this.videoActive && !cameraOn) {
                this.video.srcObject = null;
                this.videoActive = false;
            }

            this.showCrosshair = state.cameraView.showCrosshair;
            this.showCrossHair.checked = this.showCrosshair;
            this.renderCanvas();
        }
    }

    drawCrosshair() {
        let ctx = this.canvas.getContext("2d");
        ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
        ctx.lineWidth = 1;
        // dashed:
        ctx.setLineDash([5, 5]);
        let crossWidth = 0.3 * this.canvas.width;
        let crossHeight = 0.3 * this.canvas.height;
        ctx.beginPath();
        ctx.moveTo(this.canvas.width / 2 - crossWidth / 2, this.canvas.height / 2);
        ctx.lineTo(this.canvas.width / 2 + crossWidth / 2, this.canvas.height / 2);
        ctx.moveTo(this.canvas.width / 2, this.canvas.height / 2 - crossHeight / 2);
        ctx.lineTo(this.canvas.width / 2, this.canvas.height / 2 + crossHeight / 2);
        ctx.stroke();
    }

    drawMeasurementLine() {
        let ctx = this.canvas.getContext("2d");
        ctx.strokeStyle = "rgba(0, 255, 255, 0.5)";
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(this.measurementPoint1.x, this.measurementPoint1.y);
        ctx.lineTo(this.measurementPoint2.x, this.measurementPoint2.y);
        ctx.stroke();
        // text
        let x1 = this.measurementPoint1.x;
        let y1 = this.measurementPoint1.y;
        let x2 = this.measurementPoint2.x;
        let y2 = this.measurementPoint2.y;
        let dx = x2 - x1;
        let dy = y2 - y1;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let mm = (distance / (this.video.clientWidth)) * 2.975780963;
        let text = `${mm.toFixed(2)} mm`;
        ctx.font = "12px Arial";
        ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
        ctx.fillText(text, x1 + dx / 2, y1 + dy / 2);

    }


    renderCanvas() {
        requestAnimationFrame(() => {
            let ctx = this.canvas.getContext("2d");
            this.canvas.width = this.video.clientWidth
            this.canvas.height = this.video.clientHeight;
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            if (this.showCrosshair) {
                this.drawCrosshair();
            }
            if (this.measurementPoint1 && this.measurementPoint2) {
                this.drawMeasurementLine();
            }
            if (this.center) {
                ctx.beginPath();
                ctx.arc(this.center.x, this.center.y, 5, 0, 2 * Math.PI, false);
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'green';
                ctx.stroke();
            }
        });
    }

    private async detectHomingFiducial() {
        using movementExecutor = this.movementStage.getMovementExecutor("cameraview");
        await movementExecutor.home();
        const y = 28.2;
        let x = 149.45;
        await movementExecutor.moveAbsoluteAndWait(x, y, 16.53, 1000);
        let cameraAccess = CameraAccess.getInstance(this.store.state.cameraView.selectedCamera);
        await cameraAccess.performAutoFocus(0.5, 0.5, movementExecutor);
        await movementExecutor.disableAxes();
        await new Promise((resolve) => setTimeout(resolve, 500));
        let maxSteps = 20;
        let lastMovement = { x: Infinity, y: Infinity };
        for (let i = 0; i < maxSteps; i++) {
            // get image data from video
            await new Promise((resolve) => setTimeout(resolve, 500));
            let ctx = this.canvas.getContext("2d");
            ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            let imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            let src = cv.matFromImageData(imageData);
            let grayscale = new cv.Mat(src.rows, src.cols, cv.CV_8UC3);

            let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
            cv.cvtColor(src, grayscale, cv.COLOR_RGBA2GRAY, 0);

            cv.GaussianBlur(grayscale, src, { width: 5, height: 5 }, 2, 2, cv.BORDER_DEFAULT);

            cv.threshold(src, src, 150, 255, cv.THRESH_BINARY);
            // cv.imshow(this.canvas, src);
            let contours = new cv.MatVector();
            let hierarchy = new cv.Mat();
            cv.findContours(src, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
            // let drops: {
            //     x: number, y: number, diameter: number
            //     pixel_x: number, pixel_y: number, pixel_diameter: number
            // }[] = [];
            // let dropMask = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC1);

            // let enclosingCircles: {
            //     x: number,
            //     y: number,
            //     radius: number
            // }[] = [];
            // let ellipses: {
            //     center: { x: number, y: number },
            //     size: { width: number, height: number },
            //     angle: number
            // }[] = [];
            let pxToMm = 2.975780963 / this.canvas.width;
            let circles: { x: number, y: number }[] = [];
            for (let i = 0; i < contours.size(); ++i) {
                let cnt = contours.get(i);

                let enclosingCircle = cv.minEnclosingCircle(cnt);



                let radius = enclosingCircle.radius * pxToMm;

                if (radius > 0.2 && radius < 0.3) {

                    let ellipse: cv.RotatedRect;
                    try {
                        ellipse = cv.fitEllipse(cnt);
                    }
                    catch (e) {
                        console.error(e);
                        cnt.delete();
                        continue;
                    }


                    let isCircleLike = Math.abs(ellipse.size.width / ellipse.size.height);
                    if (isCircleLike < 0.6) {
                        cnt.delete();
                        continue;
                    }

                    console.log("Found circle", radius);
                    ctx.beginPath();
                    ctx.arc(enclosingCircle.center.x, enclosingCircle.center.y, enclosingCircle.radius, 0, 2 * Math.PI, false);
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = 'red';
                    ctx.stroke();
                    cnt.delete();
                    circles.push({ x: enclosingCircle.center.x, y: enclosingCircle.center.y });
                    this.drawCrosshair();
                }
            }
            if (circles.length > 1) {
                let p1 = circles[0];
                let p2 = circles[1];
                if (circles.length > 2) {
                    let p3 = circles[2];
                    this.center = { x: (p1.x + p2.x + p3.x) / 3, y: (p1.y + p2.y + p3.y) / 3 };
                } else {
                    // Estimate the missing point assuming an equilateral triangle
                    let missingPoint = {
                        x: p1.x + (p2.x - p1.x) / 2,
                        y: p1.y + (p2.y - p1.y) / 2 - Math.sqrt(3) * (p2.x - p1.x) / 2
                    };

                    this.center = { x: (p1.x + p2.x + missingPoint.x) / 3, y: (p1.y + p2.y + missingPoint.y) / 3 };
                }
                console.log("Center", this.center);
                ctx.beginPath();
                ctx.arc(this.center.x, this.center.y, 5, 0, 2 * Math.PI, false);
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'green';
                ctx.stroke();

                // await new Promise((resolve) => setTimeout(resolve, 3000));
                let movementX = -(this.center.x - this.canvas.width / 2) * pxToMm;
                let movementY = (this.center.y - this.canvas.height / 2) * pxToMm;
                console.log("Movement", movementX, movementY);

                let minimumStep = 6 * 0.016;
                let okDist = 3*0.016;

                if (Math.abs(movementX) < okDist) {
                    movementX = 0;
                }
                if (Math.abs(movementY) < okDist) {
                    movementY = 0;
                }
                lastMovement = { x: movementX, y: movementY };
                if (movementX == 0 && movementY == 0 && circles.length == 3) {
                    console.log("Centered", i);
                    await movementExecutor.setPosition(x, y);
                    break;
                }
                // await movementExecutor.moveRelativeAndWait(10, 10, 0, 1000);
                await movementExecutor.moveRelativeAndWait(minimumStep, minimumStep, 0, 1000);
                await movementExecutor.moveRelativeAndWait(-movementX*0.9 - minimumStep, -movementY*0.9 - minimumStep, 0, 1000);
            }
        }
        if (Math.abs(lastMovement.x) < 0.05 && Math.abs(lastMovement.y) < 0.05) {
            console.log("Centered, last distance", lastMovement);
            await movementExecutor.setPosition(x, y);
        } else {
            throw new Error("Could not center");
        }
    }


    disconnectedCallback() {
        this.abortController.abort();
        this.resizeObserver.disconnect();
    }
}

export const CameraViewTagName = "camera-view";
customElements.define(CameraViewTagName, CameraView);
