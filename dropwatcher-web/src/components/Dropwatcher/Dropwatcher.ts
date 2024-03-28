import { CameraAccess } from "../../camera-access";
import { PrinterUSB } from "../../printer-usb";
import { ChangeDropwatcherParametersRequest } from "../../proto/compiled";
import { PrinterSystemState, State, StateChanges } from "../../state/State";
import { Store } from "../../state/Store";
import { abortableEventListener } from "../../utils/abortableEventListener";
import { NozzleCheckBox, NozzleCheckBoxTagName } from "../NozzleCheckBox/NozzleCheckBox";
import template from "./Dropwatcher.html";
import "./Dropwatcher.scss";

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
    constructor() {
        super();
        this.printerUsb = PrinterUSB.getInstance();
        this.store = Store.getInstance();
        this.cameraAccess = CameraAccess.getInstance();
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
        }
        this.update(this.store.state, <StateChanges>Object.keys(this.store.state || {}));
    }
    private async toggleCamera() {
        if (this.store.state.dropwatcherState.cameraOn) {
            await this.cameraAccess.stop();
        } else {
            await this.cameraAccess.start();
        }
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
        await this.waitForNextVideoFrame();
        await this.printerUsb.sendFireRequest();
        await this.waitForNextVideoFrame();
        let frame = await createImageBitmap(this.videoElement);
        this.canvas.width = frame.width;
        this.canvas.height = frame.height;
        let ctx = this.canvas.getContext("2d");
        ctx.drawImage(frame, 0, 0);
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const DropwatcherTagName = "app-dropwatcher";
customElements.define(DropwatcherTagName, DropwatcherComponent);
