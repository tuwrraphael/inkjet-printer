
import { MovementStage } from "../../movement-stage";
import { PrinterUSB } from "../../printer-usb";
import { State, StateChanges, PrinterSystemState, PressureControlAlgorithm, PressureControlDirection } from "../../state/State";
import { Store } from "../../state/Store";
import { abortableEventListener } from "../../utils/abortableEventListener";
import template from "./PrinterStatus.html";
import "./PrinterStatus.scss";

const numberFormat = new Intl.NumberFormat('de-AT', { style: 'decimal', maximumFractionDigits: 2 });

export class PrinterStatus extends HTMLElement {

    private rendered = false;
    private store: Store;
    private abortController: AbortController;
    private usbConnected : HTMLTableCellElement;
    private state : HTMLTableCellElement;
    private errorFlags : HTMLTableCellElement;
    private currentPressure : HTMLSpanElement;
    private pressureControlEnabled : HTMLTableCellElement;
    private pressureControlDone : HTMLTableCellElement;
    private pressureControlTargetPressure : HTMLSpanElement;
    private pressureControlDirection : HTMLTableCellElement;
    private pressureControlFeedTime : HTMLSpanElement;
    private pressureControlFeedPwm : HTMLSpanElement;
    private pressureControlLimitPressure : HTMLSpanElement;
    private pressureControlAlgorithm : HTMLTableCellElement;
    private connectUsbButton : HTMLButtonElement;
    private stageConnected : HTMLTableCellElement;
    private connectStageButton : HTMLButtonElement;
    private printerUSB: PrinterUSB;
    private movementStage: MovementStage;
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
            this.pressureControlTargetPressure = document.querySelector("#pressure-control-target-pressure");
            this.pressureControlDirection = document.querySelector("#pressure-control-direction");
            this.pressureControlFeedTime = document.querySelector("#pressure-control-feed-time");
            this.pressureControlFeedPwm = document.querySelector("#pressure-control-feed-pwm");
            this.pressureControlLimitPressure = document.querySelector("#pressure-control-limit-pressure");
            this.pressureControlAlgorithm = document.querySelector("#pressure-control-algorithm");
            this.connectUsbButton = document.querySelector("#connect-usb");
            abortableEventListener(this.connectUsbButton, "click", async ev => {
                ev.preventDefault();
                await this.connectUsb();
            }, this.abortController.signal);

            this.stageConnected = document.querySelector("#stage-connected");
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

    formatState(state : PrinterSystemState) {
        switch (state) {
            case PrinterSystemState.Idle:
                return "Idle";
            case PrinterSystemState.Error:
                return "Error";
            case PrinterSystemState.Startup:
                return "Startup";
            case PrinterSystemState.Dropwatcher:
                return "Dropwatcher";
            default:
                return "Unspecified";
        }
    }

    formatErrorFlags(s:State) {
        let flags : number = s.printerSystemState.errors.flags;
        let map : {
            [flag:string] : string
        } = {
            "1" : "Printhead Reset",
            "2" : "User Abort",
            "0" : "Pressure Control" 
        }

        let errors = [];
        for (let i = 0; i < 32; i++) {
            if (flags & (1 << i)) {
                errors.push(map[i.toString()] || `Unknown flag ${i}`);
            }
        }        
        return errors.join(", ") || "None";
    }

    formatPressureControlDirection(direction : PressureControlDirection) {
        switch (direction) {
            case PressureControlDirection.Pressure:
                return "Pressure";
            case PressureControlDirection.Vacuum:
                return "Vacuum";
            default:
                return "Unspecified";
        }
    }

    formatPressureControlAlgorithm(algorithm : PressureControlAlgorithm) {
        switch (algorithm) {
            case PressureControlAlgorithm.FeedwithLimit:
                return "Feed with Limit";
            case PressureControlAlgorithm.TargetPressure:
                return "Target Pressure";
            default:
                return "Unspecified";
        }
    }

    formatNumber(n : number) {
        if (!n) return "-";
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
            this.pressureControlTargetPressure.innerText = this.formatNumber(s.printerSystemState.pressureControl?.parameters.targetPressure);
            this.pressureControlDirection.innerText = this.formatPressureControlDirection(s.printerSystemState.pressureControl?.parameters.direction);
            this.pressureControlFeedTime.innerText = this.formatNumber(s.printerSystemState.pressureControl?.parameters.feedTime);
            this.pressureControlFeedPwm.innerText = this.formatNumber(s.printerSystemState.pressureControl?.parameters.feedPwm);
            this.pressureControlLimitPressure.innerText = this.formatNumber(s.printerSystemState.pressureControl?.parameters.limitPressure);
            this.pressureControlAlgorithm.innerText = this.formatPressureControlAlgorithm(s.printerSystemState.pressureControl?.parameters.algorithm);
            this.connectUsbButton.style.display = s.printerSystemState.usbConnected ? "none" : "";

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
