import { CameraAccess } from "../../camera-access";
import { MovementStage } from "../../movement-stage";
import { PrinterUSB } from "../../printer-usb";
import { ChangeDropwatcherParametersRequest } from "../../proto/compiled";
import { PrinterSystemState, State, StateChanges } from "../../state/State";
import { Store } from "../../state/Store";
import { abortableEventListener } from "../../utils/abortableEventListener";
import { NozzleCheckBox, NozzleCheckBoxTagName } from "../NozzleCheckBox/NozzleCheckBox";
import template from "./Dropwatcher.html";
import "./Dropwatcher.scss";
import *as cv from "@techstark/opencv-js";
import "../MovementControlPanel/MovementControlPanel";
import { ChangePrinterSystemStateRequest, PrinterSystemState as ProtoPrinterSystemState } from "../../proto/compiled";
import { DropwatcherNozzlePosChanged } from "../../state/actions/DropwatcherNozzlePosChanged";


const NumNozzles = 128;

export class DropwatcherComponent extends HTMLElement {

    private rendered = false;
    private nozzleSelectContainer: HTMLDivElement;
    private nozzleForm: HTMLFormElement;
    private abortController: AbortController;
    private setNozzlesButton: HTMLButtonElement;
    private printerUsb: PrinterUSB;
    private store: Store;
    private flashForm: HTMLFormElement;
    private cameraStartStopBtn: HTMLButtonElement;
    private videoElement: HTMLVideoElement;
    private cameraAccess: CameraAccess;
    private videoActive = false;
    private exposureInput: HTMLInputElement;
    private exposureTimeDisplay: HTMLSpanElement;
    private canvas: HTMLCanvasElement;
    private doCaptureContiniuous: boolean;
    private movementStage: MovementStage;
    private nextVideoClick: "autofocus" | null;
    private nextVideoClickMessage: HTMLSpanElement;
    private toggleDropwatcherBtn: HTMLButtonElement;
    private moveToForm: HTMLFormElement;
    constructor() {
        super();
        this.printerUsb = PrinterUSB.getInstance();
        this.store = Store.getInstance();
        this.cameraAccess = CameraAccess.getInstance();
        this.movementStage = MovementStage.getInstance();
    }

    connectedCallback() {
        this.abortController = new AbortController();
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
            this.nozzleSelectContainer = this.querySelector(".nozzle-select");
            this.nozzleForm = this.querySelector("#nozzle-form");
            this.generateNozzleCheckboxes();
            abortableEventListener(this.querySelector("#set-all-nozzles"), "click", (e) => {
                e.preventDefault();
                this.setAllNozzles(true);
            }, this.abortController.signal);
            abortableEventListener(this.querySelector("#clear-all-nozzles"), "click", (e) => {
                e.preventDefault();
                this.setAllNozzles(false);
            }, this.abortController.signal);
            this.setNozzlesButton = this.querySelector("#set-nozzles");
            abortableEventListener(this.nozzleForm, "submit", (e) => {
                e.preventDefault();
                this.setNozzles().catch(console.error);
            }, this.abortController.signal);
            this.flashForm = this.querySelector("#flash-form");
            abortableEventListener(this.flashForm, "submit", (e) => {
                e.preventDefault();
                this.changeDropwatcherParameters().catch(console.error);
            }, this.abortController.signal);
            this.cameraStartStopBtn = this.querySelector("#camera-start-stop");
            this.store.subscribe((state, changed) => this.update(state, changed), this.abortController.signal);
            abortableEventListener(this.cameraStartStopBtn, "click", (e) => {
                e.preventDefault();
                this.toggleCamera().catch(console.error);
            }, this.abortController.signal);
            this.videoElement = this.querySelector("#video-element");
            this.exposureInput = this.querySelector("#exposure-ms");
            this.exposureTimeDisplay = this.querySelector("#exposure-time");
            abortableEventListener(this.exposureInput, "change", (e) => {
                this.cameraAccess.setExposureTime(parseFloat(this.exposureInput.value)).catch(console.error);
            }, this.abortController.signal);
            this.canvas = this.querySelector("#canvas");
            abortableEventListener(this.querySelector("#capture-single-frame"), "click", (e) => {
                e.preventDefault();
                this.captureSingleFrame().catch(console.error);
            }, this.abortController.signal);
            abortableEventListener(this.querySelector("#capture-continuous-frames"), "input", (e) => {
                if ((e.target as HTMLInputElement).checked) {
                    this.captureContinuousFrames().catch(console.error);
                } else {
                    this.doCaptureContiniuous = false;
                }
            }, this.abortController.signal);
            this.nextVideoClickMessage = this.querySelector("#videoclickmessage");
            abortableEventListener(this.querySelector("#autofocus"!), "click", (e) => {
                e.preventDefault();
                this.nextVideoClick = "autofocus";
                this.setNextVideoClickMessage();
            }, this.abortController.signal);
            abortableEventListener(this.videoElement, "click", (ev: MouseEvent) => {
                switch (this.nextVideoClick) {
                    case "autofocus":
                        this.performAutoFocus(ev);
                        break;
                    default: break;
                }
                this.nextVideoClick = null;
                this.setNextVideoClickMessage();
            }, this.abortController.signal);
            this.toggleDropwatcherBtn = this.querySelector("#toggle-dropwatcher");
            abortableEventListener(this.toggleDropwatcherBtn, "click", (e) => {
                e.preventDefault();
                this.toggleDropwatcher().catch(console.error);
            }, this.abortController.signal);

            abortableEventListener(this.querySelector("#set-first-nozzle-pos"), "click", e => {
                e.preventDefault();
                this.setFirstNozzlePos();
            }, this.abortController.signal);
            abortableEventListener(this.querySelector("#set-last-nozzle-pos"), "click", e => {
                e.preventDefault();
                this.setLastNozzlePos();
            }, this.abortController.signal);
            this.moveToForm = this.querySelector("#move-to-form");
            abortableEventListener(this.moveToForm, "submit", e => {
                e.preventDefault();
                let data = new FormData(this.moveToForm);
                let id = parseInt(data.get("nozzle-pos") as string);
                this.moveToNozzle(id-1).catch(console.error);
            }, this.abortController.signal);
        }
        this.update(this.store.state, <StateChanges>Object.keys(this.store.state || {}));
    }
    setLastNozzlePos() {
        this.store.postAction(new DropwatcherNozzlePosChanged(null, this.store.state.movementStageState.pos));
    }
    setFirstNozzlePos() {
        this.store.postAction(new DropwatcherNozzlePosChanged(this.store.state.movementStageState.pos, null));
    }

    async moveToNozzle(id: number) {
        let dx = this.store.state.dropwatcherState.nozzlePos.last.x - this.store.state.dropwatcherState.nozzlePos.first.x;
        let dy = this.store.state.dropwatcherState.nozzlePos.last.y - this.store.state.dropwatcherState.nozzlePos.first.y;
        let dz = this.store.state.dropwatcherState.nozzlePos.last.z - this.store.state.dropwatcherState.nozzlePos.first.z;
        let x = this.store.state.dropwatcherState.nozzlePos.first.x + dx / (NumNozzles - 1) * id;
        let y = this.store.state.dropwatcherState.nozzlePos.first.y + dy / (NumNozzles - 1) * id;
        let z = this.store.state.dropwatcherState.nozzlePos.first.z + dz / (NumNozzles - 1) * id;
        await this.movementStage.movementExecutor.moveAbsoluteAndWait(x, y, z, 100);
    }

    async toggleDropwatcher() {
        let r = new ChangePrinterSystemStateRequest();
        if (this.store.state.printerSystemState.state == PrinterSystemState.Dropwatcher) {
            r.state = ProtoPrinterSystemState.PrinterSystemState_IDLE;
        } else if (this.store.state.printerSystemState.state == PrinterSystemState.Idle || this.store.state.printerSystemState.state == PrinterSystemState.Startup) {
            r.state = ProtoPrinterSystemState.PrinterSystemState_DROPWATCHER;
        } else {
            throw new Error(`Invalid state ${this.store.state.printerSystemState.state}`);
        }
        await this.printerUsb.sendChangeSystemStateRequest(r);
    }

    private setNextVideoClickMessage() {
        switch (this.nextVideoClick) {
            case "autofocus":
                this.nextVideoClickMessage.innerText = "Click the video to set focus";
                break;
            default:
                break;
        }
        this.nextVideoClickMessage.style.display = this.nextVideoClick ? "" : "none";
    }

    private async toggleCamera() {
        if (this.store.state.dropwatcherState.cameraOn) {
            await this.cameraAccess.stop();
        } else {
            await this.cameraAccess.start();
        }
    }




    private async autofocusAlg(step: number, range: number, videoElementX: number, videoElementY: number) {

        let direction = new cv.Mat(3, 1, cv.CV_64F);
        direction.data64F[0] = 0;
        direction.data64F[1] = 1;
        direction.data64F[2] = 0;
        let relativeMovement = direction.mul(cv.Mat.ones(3, 1, cv.CV_64F), -range / 2);
        await this.movementStage.movementExecutor.moveRelativeAndWait(relativeMovement.data64F[0], relativeMovement.data64F[1], relativeMovement.data64F[2], 100);
        let bestDistance = 0;
        let bestScore = 0;
        let best: ImageData = null;
        // let bestArea: ImageData = null;
        await this.waitForNextVideoFrame();
        let frame = await createImageBitmap(this.videoElement);
        let areaSize = frame.height / 2.5;
        let x = Math.floor((videoElementX / this.videoElement.clientWidth) * frame.width);
        let y = Math.floor((videoElementY / this.videoElement.clientHeight) * frame.height);

        let minX = Math.max(0, x - areaSize / 2);
        let minY = Math.max(y - areaSize / 2, 0);
        let maxX = Math.min(frame.width, x + areaSize / 2);
        let maxY = Math.min(frame.height, y + areaSize / 2);
        // console.log(y, x, minX, minY, maxX - minX, maxY - minY);
        let ctx = this.canvas.getContext("2d");
        for (let i = 0; i < range; i += step) {
            relativeMovement = direction.mul(cv.Mat.ones(3, 1, cv.CV_64F), step);
            await this.movementStage.movementExecutor.moveRelativeAndWait(relativeMovement.data64F[0], relativeMovement.data64F[1], relativeMovement.data64F[2], 100);
            await this.waitForNextVideoFrame();
            frame = await createImageBitmap(this.videoElement);
            this.canvas.width = frame.width;
            this.canvas.height = frame.height;

            ctx.drawImage(frame, 0, 0);


            let imageData: ImageData = ctx.getImageData(minX, minY, maxX - minX, maxY - minY);
            // let imageData: ImageData = ctx.getImageData(0, 0, frame.width, frame.height);
            // console.log(imageData);
            // ctx.putImageData(imageData,0,0);
            // return;
            let srcMat = cv.matFromImageData(imageData);




            let blurred = new cv.Mat();
            let dstMat = new cv.Mat();
            cv.cvtColor(srcMat, dstMat, cv.COLOR_RGBA2GRAY);


            let resized = new cv.Mat();
            let targetSize = Math.floor(0.15 * areaSize);
            let dsize = new cv.Size(targetSize, targetSize);
            cv.resize(dstMat, resized, dsize, 0, 0, cv.INTER_AREA);

            // cv.GaussianBlur(resized, blurred, { width: 5, height: 5 }, 0.9, 0.9, cv.BORDER_DEFAULT);
            cv.medianBlur(resized, blurred, 5);

            let laplacian = new cv.Mat();
            cv.Laplacian(blurred, laplacian, cv.CV_64F);
            let mean = new cv.Mat();
            let stddev = new cv.Mat();
            cv.meanStdDev(laplacian, mean, stddev);
            let focusScore = stddev.data64F[0] * stddev.data64F[0];
            // console.log("focus score", focusScore, i);

            if (focusScore > bestScore) {

                bestScore = focusScore;
                bestDistance = i;
                best = ctx.getImageData(0, 0, frame.width, frame.height);
                // bestArea = imageData;
            }

            // let imshowMat = new cv.Mat();
            // cv.convertScaleAbs(laplacian, imshowMat, 5);

            // cv.imshow(this.canvas, imshowMat);




            dstMat.delete();
            srcMat.delete();
            blurred.delete();
            laplacian.delete();
            mean.delete();
            stddev.delete();
            resized.delete();
        }
        ctx.putImageData(best, 0, 0);
        ctx.strokeStyle = "green";
        ctx.lineWidth = 4;
        ctx.rect(minX, minY, maxX - minX, maxY - minY);
        ctx.stroke();
        // ctx.putImageData(bestArea, 0, 0);
        console.log("best distance", bestDistance);
        console.log("best score", bestScore);
        let relativeMovementToBestDistance = direction.mul(cv.Mat.ones(3, 1, cv.CV_64F), -range + bestDistance);
        await this.movementStage.movementExecutor.moveRelativeAndWait(relativeMovementToBestDistance.data64F[0], relativeMovementToBestDistance.data64F[1], relativeMovementToBestDistance.data64F[2], 100);
        await this.movementStage.movementExecutor.disableAxes();
        direction.delete();
    }

    private async performAutoFocus(args: MouseEvent) {
        let x = args.offsetX;
        let y = args.offsetY;
        await this.autofocusAlg(0.25, 2, x, y);
        await this.autofocusAlg(0.02, 0.5, x, y);
    }

    private async changeDropwatcherParameters() {
        let formData = new FormData(this.flashForm);
        let request = new ChangeDropwatcherParametersRequest();
        request.delayNanos = parseFloat(formData.get("delay-us") as string) * 1000;
        request.flashOnTimeNanos = parseFloat(formData.get("flash-on-time-us") as string) * 1000;
        await this.printerUsb.sendChangeDropwatcherParametersRequest(request);
    }
    private update(state: State, changed: StateChanges): void {
        if (!state) {
            return;
        }
        if (changed.includes("printerSystemState")) {
            this.toggleDropwatcherBtn.innerText = state.printerSystemState?.state == PrinterSystemState.Dropwatcher ? "Stop Dropwatcher" : "Start Dropwatcher";
        }
        this.setNozzlesButton.disabled = !state.printerSystemState?.usbConnected || state.printerSystemState?.state != PrinterSystemState.Dropwatcher;
        if (changed.includes("dropwatcherState")) {
            let nozzleData = state.dropwatcherState?.nozzleData;
            if (nozzleData) {
                for (let i = 0; i < NumNozzles; i++) {
                    let checkBox = this.querySelector(`[name="nozzle${i}"]`) as NozzleCheckBox;
                    checkBox.value = (nozzleData[Math.floor(i / 32)] & (1 << (i % 32))) != 0;
                }
            }
            this.cameraStartStopBtn.innerText = state.dropwatcherState.cameraOn ? "Stop Camera" : "Start Camera";
            if (!this.videoActive && state.dropwatcherState.cameraOn) {
                this.videoElement.srcObject = this.cameraAccess.getStream();
                this.videoActive = true;
            } else if (this.videoActive && !state.dropwatcherState.cameraOn) {
                this.videoElement.srcObject = null;
                this.videoActive = false;
            }
            this.exposureTimeDisplay.innerText = (state.dropwatcherState.exposureTime ? (state.dropwatcherState.exposureTime / 10).toString() : "-");
            if (state.dropwatcherState.canChangeExposure) {
                this.exposureInput.min = (state.dropwatcherState.canChangeExposure.min).toString();
                this.exposureInput.max = (state.dropwatcherState.canChangeExposure.max).toString();
                this.exposureInput.step = state.dropwatcherState.canChangeExposure.step.toString();
                this.exposureInput.value = state.dropwatcherState.exposureTime?.toString() || "0";
            }
            this.exposureInput.disabled = !state.dropwatcherState.cameraOn || !state.dropwatcherState.canChangeExposure;
        }
    }

    private setNozzle(id: number, value: boolean, data: Uint32Array) {
        let patternid = Math.floor(id / 32);
        let bitid = id % 32;
        if (value) {
            data[patternid] |= (1 << (bitid));
        } else {
            data[patternid] &= ~(1 << (bitid));
        }
    }

    private async setNozzles() {
        let formData = new FormData(this.nozzleForm);
        let nozzleData = new Uint32Array(4);
        for (let i = 0; i < NumNozzles; i++) {
            let value = formData.get(`nozzle${i}`) === "on";
            this.setNozzle(i, value, nozzleData);
        }
        await this.printerUsb.sendChangeNozzleDataRequest(nozzleData);
    }
    private setAllNozzles(arg0: boolean) {
        for (let i = 0; i < NumNozzles; i++) {
            let checkBox = this.querySelector(`[name="nozzle${i}"]`) as NozzleCheckBox;
            checkBox.value = arg0;
        }
    }

    private generateNozzleCheckboxes() {
        for (let i = 0; i < NumNozzles; i++) {
            let checkBox = document.createElement(NozzleCheckBoxTagName);
            checkBox.setAttribute("name", "nozzle" + i);
            checkBox.innerText = `${(i + 1)}`;
            this.nozzleSelectContainer.appendChild(checkBox);
        }
    }

    private waitForNextVideoFrame() {
        return new Promise<void>((resolve, reject) => {
            this.videoElement.requestVideoFrameCallback(() => {
                resolve();
            })
        });
    }

    private async captureSingleFrame() {
        // await this.waitForNextVideoFrame();
        // await this.waitForNextVideoFrame();
        // // await new Promise((resolve) => setTimeout(resolve, 10));
        // await this.printerUsb.sendFireRequest();
        // await this.waitForNextVideoFrame();
        // let frame = await createImageBitmap(this.videoElement);
        // this.canvas.width = frame.width;
        // this.canvas.height = frame.height;
        // let ctx = this.canvas.getContext("2d");
        // ctx.drawImage(frame, 0, 0);
        this.captureTimelapse();
    }

    private async captureContinuousFrames() {
        this.doCaptureContiniuous = true;

        // const trackProcessor = new MediaStreamTrackProcessor(<any>this.cameraAccess.getStream().getVideoTracks()[0]);

        // const reader = trackProcessor.readable.getReader();




        // while (this.doCaptureContiniuous && !this.abortController.signal.aborted) {
        //     const delays = [];
        //     for (let i = 0; i < 200; i++) {

        //         performance.mark("start");
        //         let result = await reader.read();
        //         performance.mark("end");
        //         let duration = performance.measure("frame", "start", "end").duration;
        //         delays.push(duration);
        //         if (result.done) {
        //             return;
        //         }
        //         const frameFromCamera = result.value;
        //         frameFromCamera.close();
        //     }
        //     let avgdelay = delays.reduce((a, b) => a + b) / delays.length;
        //     // let result = await reader.read();
        //     // if (result.done) {
        //     //     return;
        //     // }
        //     // const frameFromCamera = result.value;
        //     // frameFromCamera.close();
        //     let frames = 0;
        //     await new Promise<void>((resolve) => { setTimeout(resolve, 1); });
        //     await new Promise<void>((resolve) => {
        //         let int = setInterval(() => {
        //             this.printerUsb.sendFireRequest().catch(console.error);
        //             frames++;
        //             if (frames > 200) {
        //                 clearInterval(int);
        //                 resolve();
        //             }
        //         }, avgdelay);
        //     });





        //     // if (delays.length > 100) {
        //     //     delays.shift();
        //     // }
        //     // avgdelay = delays.reduce((a, b) => a + b) / delays.length;
        //     // console.log(duration, avgdelay);
        //     // if (result.done) break;
        //     // const frameFromCamera = result.value;
        //     // frameFromCamera.close();
        //     // await new Promise((resolve) => setTimeout(resolve, 5));


        // }

        let callback = () => {
            performance.mark("end");
            this.printerUsb.sendFireRequest().catch(console.error);
            var duration = performance.measure("frame", "start", "end").duration;
            performance.mark("start");
            this.doCaptureContiniuous && !this.abortController.signal.aborted && this.videoElement.requestVideoFrameCallback(callback);

            console.log(duration);

        };
        performance.mark("start");
        callback();
        // while (this.doCaptureContiniuous && !this.abortController.signal.aborted) {
        //     await this.printerUsb.sendFireRequest();
        //     await this.waitForNextVideoFrame();
        //     // let frame = await createImageBitmap(this.videoElement);
        //     // this.canvas.width = frame.width;
        //     // this.canvas.height = frame.height;
        //     // let ctx = this.canvas.getContext("2d");
        //     // ctx.drawImage(frame, 0, 0);
        // }
    }

    private async getBlob() {
        return new Promise<Blob>((resolve, reject) => {
            this.canvas.toBlob((blob) => {
                resolve(blob);
            }, "image/png");
        });
    }

    private captureTimelapse() {
        let photo = 0;
        let numphotos = 30;
        let delay = 1;
        let enddelay = 1000;

        let frames: ImageBitmap[] = [];

        // const stream = this.canvas.captureStream(30);
        // const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        // mediaRecorder.ondataavailable = (e) => {
        //     if (e.data.size > 0) {
        //         recordedChunks.push(e.data);
        //     }
        // };
        // mediaRecorder.onstop = () => {
        //     console.log('recording stopped', recordedChunks.length);
        //     const blob = new Blob(recordedChunks, { type: 'video/webm' });
        //     const url = URL.createObjectURL(blob);
        //     const a = document.createElement('a');
        //     document.body.appendChild(a);
        //     a.style.display = 'none';
        //     a.href = url;
        //     a.download = 'test.webm';
        //     a.click();
        //     window.URL.revokeObjectURL(url);
        // };
        // mediaRecorder.start(20);



        let callback = () => {
            createImageBitmap(this.videoElement).then((frame) => {
                this.canvas.width = frame.width;
                this.canvas.height = frame.height;
                let ctx = this.canvas.getContext("2d");
                ctx.drawImage(frame, 0, 0);
                frames.push(frame);
                // (<any>stream.getVideoTracks()[0]).requestFrame();
                // return this.getBlob().then(blob => {
                // recordedChunks.push(blob);
                // var link = document.createElement('a');
                // link.download = `photo${photo}.png`;
                // link.href = this.canvas.toDataURL()
                // link.click();
                photo++;
                delay += enddelay / numphotos;
                let request = new ChangeDropwatcherParametersRequest();
                request.delayNanos = delay * 1000;
                request.flashOnTimeNanos = 3 * 1000;
                return this.printerUsb.sendChangeDropwatcherParametersRequest(request).then(() => {
                    return this.printerUsb.sendFireRequest().then(() => {
                        if (photo < numphotos) {
                            this.videoElement.requestVideoFrameCallback(callback);
                        } else {
                            // for (let i = 0; i < frames.length; i++) {
                            //     let frame = frames[i];
                            //     ctx.drawImage(frame, 0, 0);
                            //     var link = document.createElement('a');
                            //     link.download = `photo${i}.png`;
                            //     link.href = this.canvas.toDataURL()
                            //     link.click();
                            // }


                            // mediaRecorder.stop();



                        }
                    });
                });
            }).catch(console.error);
        };
        this.videoElement.requestVideoFrameCallback(callback);
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const DropwatcherTagName = "app-dropwatcher";
customElements.define(DropwatcherTagName, DropwatcherComponent);
