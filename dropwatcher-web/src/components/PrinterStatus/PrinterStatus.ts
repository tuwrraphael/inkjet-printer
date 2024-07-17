
import { MovementStage } from "../../movement-stage";
import { PrinterUSB } from "../../printer-usb";
import { State, StateChanges, PrinterSystemState, PressureControlAlgorithm, PressureControlDirection, PrintControlEncoderMode } from "../../state/State";
import { Store } from "../../state/Store";
import { abortableEventListener } from "../../utils/abortableEventListener";
import template from "./PrinterStatus.html";
import "./PrinterStatus.scss";

const numberFormat = new Intl.NumberFormat('de-AT', { style: 'decimal', maximumFractionDigits: 2 });

export class PrinterStatus extends HTMLElement {

    private rendered = false;
    private store: Store;
    private abortController: AbortController;
    private usbConnected: HTMLTableCellElement;
    private state: HTMLTableCellElement;
    private errorFlags: HTMLTableCellElement;
    private currentPressure: HTMLSpanElement;
    private pressureControlEnabled: HTMLTableCellElement;
    private pressureControlDone: HTMLTableCellElement;
    private connectUsbButton: HTMLButtonElement;
    private stageConnected: HTMLTableCellElement;
    private stagePosition: HTMLTableCellElement;
    private connectStageButton: HTMLButtonElement;
    private printerUSB: PrinterUSB;
    private movementStage: MovementStage;
    private sequentialFires: HTMLTableCellElement;
    private fireEveryTicks: HTMLTableCellElement;
    private printFirstLineAfterEncoderTick: HTMLTableCellElement;
    private encoderValue: HTMLTableCellElement;
    private expectedEncoderValue: HTMLTableCellElement;
    private lastPrintedLine: HTMLTableCellElement;
    private lostLinesCount: HTMLTableCellElement;
    private printedLines: HTMLTableCellElement;
    private nozzlePrimingActive: HTMLTableCellElement;
    private encoderMode: HTMLTableCellElement;
    private lostLinesBySlowData: HTMLTableCellElement;
    private voltage: HTMLSpanElement;
    constructor() {
        super();
        this.store = Store.getInstance();
        this.printerUSB = PrinterUSB.getInstance();
        this.movementStage = MovementStage.getInstance();
    }

    connectedCallback() {

        this.abortController = new AbortController();
        this.store.subscribe((s, c) => this.update(s, c), this.abortController.signal);
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
            this.usbConnected = document.querySelector("#usb-connected");
            this.state = document.querySelector("#state");
            this.errorFlags = document.querySelector("#error-flags");
            this.currentPressure = document.querySelector("#current-pressure");
            this.pressureControlEnabled = document.querySelector("#pressure-control-enabled");
            this.pressureControlDone = document.querySelector("#pressure-control-done");
            this.connectUsbButton = document.querySelector("#connect-usb");
            this.sequentialFires = document.querySelector("#sequential-fires");
            this.fireEveryTicks = document.querySelector("#fire-every-ticks");
            this.printFirstLineAfterEncoderTick = document.querySelector("#print-first-line-after-encoder-tick");
            this.encoderValue = document.querySelector("#encoder-value");
            this.expectedEncoderValue = document.querySelector("#expected-encoder-value");
            this.lastPrintedLine = document.querySelector("#last-printed-line");
            this.lostLinesCount = document.querySelector("#lost-lines-count");
            this.printedLines = document.querySelector("#printed-lines");
            this.nozzlePrimingActive = document.querySelector("#nozzle-priming-active");
            this.encoderMode = document.querySelector("#encoder-mode");
            this.lostLinesBySlowData = document.querySelector("#lost-lines-by-slow-data");
            this.voltage = document.querySelector("#voltage");
            abortableEventListener(this.connectUsbButton, "click", async ev => {
                ev.preventDefault();
                await this.connectUsb();
            }, this.abortController.signal);

            this.stageConnected = document.querySelector("#stage-connected");
            this.stagePosition = document.querySelector("#stage-position");
            this.connectStageButton = document.querySelector("#connect-stage");
            abortableEventListener(this.connectStageButton, "click", async ev => {
                ev.preventDefault();
                await this.connectStage();
            }, this.abortController.signal);
        }
        this.update(this.store.state, <StateChanges>Object.keys(this.store.state || {}));
    }

    async connectUsb() {
        this.printerUSB.connectNew();
    }

    async connectStage() {
        this.movementStage.connectNew();
    }

    formatStagePosition(s: State) {
        return `X: ${this.formatNumber(s.movementStageState.pos?.x)} Y: ${this.formatNumber(s.movementStageState.pos?.y)} Z: ${this.formatNumber(s.movementStageState.pos?.z)} E: ${this.formatNumber(s.movementStageState.e)}`;
    }

    formatState(state: PrinterSystemState) {
        switch (state) {
            case PrinterSystemState.Idle:
                return "Idle";
            case PrinterSystemState.Error:
                return "Error";
            case PrinterSystemState.Startup:
                return "Startup";
            case PrinterSystemState.Dropwatcher:
                return "Dropwatcher";
            case PrinterSystemState.Print:
                return "Print";
            case PrinterSystemState.KeepAlive:
                return "Keep Alive";
            default:
                return "Unspecified";
        }
    }

    formatErrorFlags(s: State) {
        let flags: number = s.printerSystemState.errors.flags;
        let map: {
            [flag: string]: string
        } = {
            "1": "Printhead Reset",
            "2": "User Abort",
            "0": "Pressure Control",
            "3": "Printhead Communication",
            "4": "Printhead Fire Request",
        }

        let errors = [];
        for (let i = 0; i < 32; i++) {
            if (flags & (1 << i)) {
                errors.push(map[i.toString()] || `Unknown flag ${i}`);
            }
        }
        return errors.join(", ") || "None";
    }



    formatEncoderMode(encoderMode: PrintControlEncoderMode) {
        switch (encoderMode) {
            case PrintControlEncoderMode.Unspecified:
                return "Unspecified";
            case PrintControlEncoderMode.Off:
                return "Off";
            case PrintControlEncoderMode.On:
                return "On";
            case PrintControlEncoderMode.Paused:
                return "Paused";
            default:
                return "Unspecified";
        }
    }

    formatNumber(n: number) {
        if (isNaN(n) || n == undefined) return "-";
        return numberFormat.format(n);
    }

    update(s: State, c: StateChanges): void {
        if (c.includes("printerSystemState")) {
            this.usbConnected.innerText = s.printerSystemState.usbConnected ? "Connected" : "Disconnected";
            this.state.innerText = this.formatState(s.printerSystemState.state);
            this.errorFlags.innerText = this.formatErrorFlags(s);
            let currentPressure = s.printerSystemState.pressureControl?.pressure.slice(-1)[0]?.mbar;
            this.currentPressure.innerText = this.formatNumber(currentPressure);
            this.pressureControlEnabled.innerText = s.printerSystemState.pressureControl?.enabled ? "Enabled" : "Disabled";
            this.pressureControlDone.innerText = s.printerSystemState.pressureControl?.done ? "Done" : "-";
            this.connectUsbButton.style.display = s.printerSystemState.usbConnected ? "none" : "";
            this.sequentialFires.innerText = this.formatNumber(s.printerSystemState.printControl?.encoderModeSettings.sequentialFires);
            this.fireEveryTicks.innerText = this.formatNumber(s.printerSystemState.printControl?.encoderModeSettings.fireEveryTicks);
            this.printFirstLineAfterEncoderTick.innerText = this.formatNumber(s.printerSystemState.printControl?.encoderModeSettings.printFirstLineAfterEncoderTick);
            this.encoderValue.innerText = this.formatNumber(s.printerSystemState.printControl?.encoderValue);
            this.expectedEncoderValue.innerText = this.formatNumber(s.printerSystemState.printControl?.expectedEncoderValue);
            this.lastPrintedLine.innerText = this.formatNumber(s.printerSystemState.printControl?.lastPrintedLine);
            this.lostLinesCount.innerText = this.formatNumber(s.printerSystemState.printControl?.lostLinesCount);
            this.printedLines.innerText = this.formatNumber(s.printerSystemState.printControl?.printedLines);
            this.nozzlePrimingActive.innerText = s.printerSystemState.printControl?.nozzlePrimingActive ? "Active" : "Inactive";
            this.encoderMode.innerText = this.formatEncoderMode(s.printerSystemState.printControl?.encoderMode);
            this.lostLinesBySlowData.innerText = this.formatNumber(s.printerSystemState.printControl?.lostLinesBySlowData);
            this.voltage.innerText = s.printerSystemState.waveformControl?.voltageMv ? this.formatNumber(s.printerSystemState.waveformControl?.voltageMv / 1000) : "-";
        }
        if (c.includes("movementStageState")) {
            this.stagePosition.innerText = this.formatStagePosition(s);
            this.stageConnected.innerText = s.movementStageState.connected ? "Connected" : "Disconnected";
            this.connectStageButton.style.display = s.movementStageState.connected ? "none" : "";
        }
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const PrinterStatusTagName = "printer-status";
customElements.define(PrinterStatusTagName, PrinterStatus);
