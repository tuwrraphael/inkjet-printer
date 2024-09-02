import { CameraAccess } from "../../camera-access";
import { CameraType } from "../../CameraType";
import { MovementStage } from "../../movement-stage";
import { PrinterUSB } from "../../printer-usb";
import { ChangeDropwatcherParametersRequest, ChangeWaveformControlSettingsRequest, WavefromControlSettings } from "../../proto/compiled";
import { InspectImageType, PrinterSystemState, State, StateChanges } from "../../state/State";
import { Store } from "../../state/Store";
import { abortableEventListener } from "../../utils/abortableEventListener";
import { NozzleCheckBox, NozzleCheckBoxTagName } from "../NozzleCheckBox/NozzleCheckBox";
import template from "./Dropwatcher.html";
import "./Dropwatcher.scss";
import "../MovementControlPanel/MovementControlPanel";
import { ChangePrinterSystemStateRequest, PrinterSystemState as ProtoPrinterSystemState } from "../../proto/compiled";
import { DropwatcherNozzlePosChanged } from "../../state/actions/DropwatcherNozzlePosChanged";
import { kHzToNs } from "../../utils/kHzToNs";


const NumNozzles = 128;

let numberFormat = new Intl.NumberFormat("en-US", { style: "decimal", maximumFractionDigits: 2 });

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
    private nextVideoClick: "autofocus" | "measure1" | "measure2" | null;
    private nextVideoClickMessage: HTMLSpanElement;
    private toggleDropwatcherBtn: HTMLButtonElement;
    private moveToForm: HTMLFormElement;
    private waveformForm: HTMLFormElement;
    measurementPoint1: { x: number; y: number; };
    constructor() {
        super();
        this.printerUsb = PrinterUSB.getInstance();
        this.store = Store.getInstance();
        this.cameraAccess = CameraAccess.getInstance(CameraType.Microscope);
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
            abortableEventListener(this.videoElement, "click", (ev: MouseEvent) => {
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
                this.moveToNozzle(id - 1).catch(console.error);
            }, this.abortController.signal);
            this.waveformForm = this.querySelector("#waveform-form");
            abortableEventListener(this.waveformForm, "submit", async e => {
                e.preventDefault();
                if (this.store.state.printerSystemState.state != PrinterSystemState.Idle) {
                    return;
                }
                if (this.waveformForm.reportValidity()) {
                    let formData = new FormData(this.waveformForm);
                    let request = new ChangeWaveformControlSettingsRequest();
                    let settings = new WavefromControlSettings();
                    request.settings = settings;
                    settings.voltageMv = Math.round(parseFloat(formData.get("voltage") as string) * 1000);
                    settings.clockPeriodNs = kHzToNs(parseFloat(formData.get("clock") as string));
                    await this.printerUsb.sendChangeWaveformControlSettingsRequestAndWait(request);
                }
            }, this.abortController.signal);

            abortableEventListener(this.querySelector("#capture-clock-sweep"), "click", e => {
                e.preventDefault();
                this.captureClockSweep().catch(console.error);
            }, this.abortController.signal);
            abortableEventListener(this.querySelector("#capture-voltage-sweep"), "click", e => {
                e.preventDefault();
                this.captureVoltageSweep().catch(console.error);
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
        using movementExecutor = this.movementStage.getMovementExecutor("dropwatcher");
        let dx = this.store.state.dropwatcherState.nozzlePos.last.x - this.store.state.dropwatcherState.nozzlePos.first.x;
        let dy = this.store.state.dropwatcherState.nozzlePos.last.y - this.store.state.dropwatcherState.nozzlePos.first.y;
        let dz = this.store.state.dropwatcherState.nozzlePos.last.z - this.store.state.dropwatcherState.nozzlePos.first.z;
        let x = this.store.state.dropwatcherState.nozzlePos.first.x + dx / (NumNozzles - 1) * id;
        let y = this.store.state.dropwatcherState.nozzlePos.first.y + dy / (NumNozzles - 1) * id;
        let z = this.store.state.dropwatcherState.nozzlePos.first.z + dz / (NumNozzles - 1) * id;
        await movementExecutor.moveAbsoluteAndWait(x, y, z, 100);
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

    private async toggleCamera() {
        if (this.store.state.cameras[CameraType.Microscope]?.cameraOn) {
            await this.cameraAccess.stop();
        } else {
            await this.cameraAccess.start();
        }
    }

    private async performAutoFocus(args: MouseEvent) {
        using movementExecutor = this.movementStage.getMovementExecutor("dropwatcher");
        let videoElementX = args.offsetX;
        let videoElementY = args.offsetY;
        let x = (videoElementX / this.videoElement.clientWidth);
        let y = (videoElementY / this.videoElement.clientHeight);
        let res = await this.cameraAccess.performAutoFocus(x, y, movementExecutor);
        this.canvas.width = res.best.width;
        this.canvas.height = res.best.height;
        let ctx = this.canvas.getContext("2d");
        ctx.drawImage(res.best, 0, 0);
        ctx.strokeStyle = "green";
        ctx.lineWidth = 4;
        ctx.rect(res.area.x, res.area.y, res.area.width, res.area.height);
        ctx.stroke();
        this.nextVideoClick = null;
        this.setNextVideoClickMessage();
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

        let mm = (distance / (this.videoElement.clientWidth)) * 2.975780963;

        console.log(distance, mm);
        this.nextVideoClick = null;
        this.setNextVideoClickMessage();
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
        if (changed.includes("dropwatcherState") || changed.includes("cameras")) {
            let nozzleData = state.dropwatcherState?.nozzleData;
            if (nozzleData) {
                for (let i = 0; i < NumNozzles; i++) {
                    let checkBox = this.querySelector(`[name="nozzle${i}"]`) as NozzleCheckBox;
                    checkBox.value = (nozzleData[Math.floor(i / 32)] & (1 << (i % 32))) != 0;
                }
            }

            let cameraState = state.cameras[CameraType.Microscope];

            let cameraOn = cameraState?.cameraOn;

            this.cameraStartStopBtn.innerText = cameraOn ? "Stop Camera" : "Start Camera";
            if (!this.videoActive && cameraOn) {
                this.videoElement.srcObject = this.cameraAccess.getStream();
                this.videoActive = true;
            } else if (this.videoActive && !cameraOn) {
                this.videoElement.srcObject = null;
                this.videoActive = false;
            }
            if (cameraState) {
                this.exposureTimeDisplay.innerText = (cameraState.exposureTime ? (cameraState.exposureTime / 10).toString() : "-");
                if (cameraState.canChangeExposure) {
                    this.exposureInput.min = (cameraState.canChangeExposure.min).toString();
                    this.exposureInput.max = (cameraState.canChangeExposure.max).toString();
                    this.exposureInput.step = cameraState.canChangeExposure.step.toString();
                    this.exposureInput.value = cameraState.exposureTime?.toString() || "0";
                }
                this.exposureInput.disabled = !cameraState.cameraOn || !cameraState.canChangeExposure;
            }
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

    private async captureClockSweep() {
        let from = 1500;
        let to = 500;
        let step = 50;


        this.doCaptureContiniuous = false;
        for (let i = from; i >= to; i -= step) {

            // go to idle
            let systemStateRequest = new ChangePrinterSystemStateRequest();
            systemStateRequest.state = ProtoPrinterSystemState.PrinterSystemState_IDLE;
            await this.printerUsb.sendChangeSystemStateRequest(systemStateRequest);

            let request = new ChangeWaveformControlSettingsRequest();
            request.settings = new WavefromControlSettings();
            request.settings.voltageMv = 35600;
            request.settings.clockPeriodNs = kHzToNs(i);
            await this.printerUsb.sendChangeWaveformControlSettingsRequestAndWait(request);
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // go to dropwatcher
            systemStateRequest = new ChangePrinterSystemStateRequest();
            systemStateRequest.state = ProtoPrinterSystemState.PrinterSystemState_DROPWATCHER;
            await this.printerUsb.sendChangeSystemStateRequest(systemStateRequest);
            await new Promise((resolve) => setTimeout(resolve, 3000));
            // set timings

            let flashRequest = new ChangeDropwatcherParametersRequest();
            flashRequest.delayNanos = 270 * 1000;
            flashRequest.flashOnTimeNanos = 2 * 1000;
            await this.printerUsb.sendChangeDropwatcherParametersRequest(flashRequest);


            // fire 10 times
            for (let j = 0; j < 10; j++) {
                await this.waitForNextVideoFrame();
                await this.printerUsb.sendFireRequest();

            }

            await this.waitForNextVideoFrame();
            await this.printerUsb.sendFireRequest();
            await this.cameraAccess.saveImage(`clocksweep-${i}-kHz`, InspectImageType.Dropwatcher);

            // wait for frame
            // await this.waitForNextVideoFrame();


        }

    }

    private async captureVoltageSweep() {
        let from = 35.6;
        let to = 15;
        let step = 0.3;


        this.doCaptureContiniuous = false;
        for (let i = from; i >= to; i -= step) {

            // go to idle
            let systemStateRequest = new ChangePrinterSystemStateRequest();
            systemStateRequest.state = ProtoPrinterSystemState.PrinterSystemState_IDLE;
            await this.printerUsb.sendChangeSystemStateRequest(systemStateRequest);

            let request = new ChangeWaveformControlSettingsRequest();
            request.settings = new WavefromControlSettings();
            request.settings.voltageMv = Math.round(i * 1000);
            request.settings.clockPeriodNs = kHzToNs(1000);
            await this.printerUsb.sendChangeWaveformControlSettingsRequestAndWait(request);
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // go to dropwatcher
            systemStateRequest = new ChangePrinterSystemStateRequest();
            systemStateRequest.state = ProtoPrinterSystemState.PrinterSystemState_DROPWATCHER;
            await this.printerUsb.sendChangeSystemStateRequest(systemStateRequest);
            await new Promise((resolve) => setTimeout(resolve, 3000));
            // set timings

            let flashRequest = new ChangeDropwatcherParametersRequest();
            flashRequest.delayNanos = 270 * 1000;
            flashRequest.flashOnTimeNanos = 2 * 1000;
            await this.printerUsb.sendChangeDropwatcherParametersRequest(flashRequest);


            // fire 10 times
            for (let j = 0; j < 10; j++) {
                await this.waitForNextVideoFrame();
                await this.printerUsb.sendFireRequest();

            }

            await this.waitForNextVideoFrame();
            await this.printerUsb.sendFireRequest();
            await this.cameraAccess.saveImage(`voltagesweep-${numberFormat.format(i)}-V`, InspectImageType.Dropwatcher);

            // wait for frame
            // await this.waitForNextVideoFrame();


        }

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
                request.flashOnTimeNanos = 2 * 1000;
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
