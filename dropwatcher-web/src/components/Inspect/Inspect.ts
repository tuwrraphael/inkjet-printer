import template from "./Inspect.html";
import "./Inspect.scss";
import "../MovementControlPanel/MovementControlPanel";
import "../ImageList/ImageList";
import { Store } from "../../state/Store";
import { InspectImage, State, StateChanges } from "../../state/State";
import { abortableEventListener } from "../../utils/abortableEventListener";
import *as cv from "@techstark/opencv-js";

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
                    let res = this.detectDrops();
                    ctx.drawImage(imageBitmap, 0, 0);
                    this.detectDrops(res.threshold);
                });
            } else {
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        });
    }

    private detectDrops(threshold: number = 100) {
        let ctx = this.canvas.getContext("2d");
        let imageData: ImageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        let src = cv.matFromImageData(imageData);
        let grayscale = new cv.Mat(src.rows, src.cols, cv.CV_8UC3);
        let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
        cv.cvtColor(src, grayscale, cv.COLOR_RGBA2GRAY, 0);
        cv.GaussianBlur(grayscale, src, { width: 5, height: 5 }, 2, 2, cv.BORDER_DEFAULT);
        cv.threshold(src, src, threshold, 255, cv.THRESH_BINARY);
        // cv.imshow(this.canvas, src);
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        cv.findContours(src, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
        let drops: { x: number, y: number, diameter: number }[] = [];
        let dropMask = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC1);
        for (let i = 0; i < contours.size(); ++i) {
            // let tmp = new cv.Mat();
            let cnt = contours.get(i);
            // You can try more different parameters

            let enclosingCircle = cv.minEnclosingCircle(cnt);
            let pxToMm = 2.975780963 / 1920;
            let radius = enclosingCircle.radius * pxToMm;

            if (radius > 0.05 && radius < 0.3) {
                ctx.globalAlpha = 0.3;
                ctx.beginPath();
                ctx.arc(enclosingCircle.center.x, enclosingCircle.center.y, enclosingCircle.radius, 0, 2 * Math.PI);
                ctx.strokeStyle = "blue";
                ctx.lineWidth = 2;
                ctx.stroke();

                // ctx.beginPath();
                // ctx.strokeStyle = "blue";
                // ctx.lineWidth = 2;
                // for (let j = 0; j < cnt.rows; j++) {

                //     ctx.lineTo(cnt.data32S[j * 2], cnt.data32S[j * 2 + 1]);
                // }

                // ctx.closePath();

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
                // console.log("isCircleLike", isCircleLike);
                if (isCircleLike < 0.6) {
                    // console.log("Not a circle", isCircleLike);
                    cnt.delete();
                    continue;
                }
                ctx.beginPath();
                ctx.ellipse(ellipse.center.x, ellipse.center.y, ellipse.size.width / 2, ellipse.size.height / 2, ellipse.angle * Math.PI / 180, 0, 2 * Math.PI);
                ctx.strokeStyle = "red";
                
                ctx.lineWidth = 2;
                ctx.stroke();
                let ellipseRadius = (ellipse.size.width + ellipse.size.height) / 4;
                let drop = { x: ellipse.center.x * pxToMm, y: ellipse.center.y * pxToMm, diameter: ellipseRadius * 2 * pxToMm };
                drops.push(drop);

                ctx.globalAlpha = 0.6;

                ctx.beginPath();
                ctx.arc(ellipse.center.x, ellipse.center.y, ellipseRadius, 0, 2 * Math.PI);
                ctx.strokeStyle = "yellow";
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.font = "20px Arial";
                ctx.fillStyle = "white";

                ctx.globalAlpha = 1;
                ctx.fillText(`d: ${(ellipseRadius * pxToMm * 2 * 1000).toFixed(2)}μm`, ellipse.center.x, ellipse.center.y + ellipseRadius);



                cv.circle(dropMask, ellipse.center, ellipseRadius, new cv.Scalar(255, 255, 255), -1, 8, 0);
                // let mean = cv.mean(src, circleMask);
                // let masked = new cv.Mat();
                // let mean = cv.mean(grayscale, circleMask);
                // console.log(mean);  
                // let mean = cv.mean(masked);

                // masked.delete();



            }
            // let circle = { center: ellipse.center, radius: (ellipse.size.width + ellipse.size.height) / 4 };







            cnt.delete();
        }
        // let averageDiameter = drops.reduce((acc, drop) => acc + drop.diameter, 0) / drops.length;
        // // draw contours with random Scalar
        // for (let i = 0; i < contours.size(); ++i) {
        //     let color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
        //         Math.round(Math.random() * 255));
        //     cv.drawContours(dst, poly, i, color, 1, 8, hierarchy, 0);
        // }
        // cv.imshow('canvasOutput', dst);

        let meanDrop = cv.mean(grayscale, dropMask);
        let invertedMask = new cv.Mat(src.rows, src.cols, cv.CV_8UC1);
        cv.bitwise_not(dropMask, invertedMask);
        let meanBackground = cv.mean(grayscale, invertedMask);

        console.log("meanDrop", meanDrop);
        console.log("meanBackground", meanBackground);

        let newthreshold = (meanDrop[0] + meanBackground[0]) / 2;


        // cv.imshow(this.canvas, invertedMask);
        console.log(drops);
        dropMask.delete();
        invertedMask.delete();
        src.delete(); dst.delete(); hierarchy.delete(); contours.delete(); grayscale.delete();
        ctx.globalAlpha = 1;
        return {
            drops,
            threshold: newthreshold
        };
    }



    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const InspectTagName = "app-inspect";
customElements.define(InspectTagName, Inspect);
