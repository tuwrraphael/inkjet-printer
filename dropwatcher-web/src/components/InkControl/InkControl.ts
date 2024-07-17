import template from "./InkControl.html";
import "./InkControl.scss";
import "../Chart/Chart";
import { abortableEventListener } from "../../utils/abortableEventListener";
import { PressureControlAlgorithm, ChangePressureControlParametersRequest, PressureControlDirection, PressureControlParameters, PrinterSystemState } from "../../proto/compiled";
import { PrinterUSB } from "../../printer-usb";
import { Store } from "../../state/Store";
import { State, StateChanges } from "../../state/State";
import { PressureControlPumpParameters } from "../../proto/compiled";
import "../PumpStatus/PumpStatus";
import { PumpStatus } from "../PumpStatus/PumpStatus";
import { ChangePrinterSystemStateRequest } from "../../proto/compiled";

export class InkControl extends HTMLElement {

    private rendered = false;
    private action: HTMLSelectElement;
    private btnStart: HTMLButtonElement;
    private abortController: AbortController;
    private inkControlForm: HTMLFormElement;
    private nozzlePrimingGroup: HTMLFieldSetElement;
    private targetPressureGroup: HTMLFieldSetElement;
    private printerUSB: PrinterUSB;
    private btnStop: HTMLButtonElement;
    private store: Store;
    // private targetPressure: HTMLInputElement;
    // private initialValueSet = false;
    private inkPumpStatus: PumpStatus;
    private cappingPumpStatus: PumpStatus;
    private btnKeepAlive : HTMLButtonElement;

    constructor() {
        super();
        this.printerUSB = PrinterUSB.getInstance();
        this.store = Store.getInstance();
    }

    connectedCallback() {
        this.abortController = new AbortController();
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
            this.action = this.querySelector("#action");
            this.btnStart = this.querySelector("#btn-start");
            this.inkControlForm = this.querySelector("#ink-control-form");
            this.nozzlePrimingGroup = this.querySelector("#nozzle-priming-group");
            this.targetPressureGroup = this.querySelector("#target-pressure-group");
            this.btnStop = this.querySelector("#btn-stop");
            this.inkPumpStatus = this.querySelector("#ink-pump-status");
            this.cappingPumpStatus = this.querySelector("#capping-pump-status");
            this.btnKeepAlive = this.querySelector("#btn-keepalive");
            // this.targetPressure = this.querySelector("#target-pressure");
            // abortableEventListener(this.action, "change", () => this.actionChanged(), this.abortController.signal);
            abortableEventListener(this.btnStart, "click", (ev) => {
                ev.preventDefault();
                this.start().catch(console.error);
            }, this.abortController.signal);
            abortableEventListener(this.btnStop, "click", (ev) => {
                ev.preventDefault();
                this.stop().catch(console.error);
            }, this.abortController.signal);
            abortableEventListener(this.btnKeepAlive, "click", async (ev) => {
                ev.preventDefault();
                let request = new ChangePrinterSystemStateRequest();
                request.state = PrinterSystemState.PrinterSystemState_KEEP_ALIVE;
                await this.printerUSB.sendChangeSystemStateRequest(request);
            }, this.abortController.signal);
        }
        // this.actionChanged();
        this.store.subscribe((s, c) => this.update(s, c), this.abortController.signal);
    }
    private update(s: State, c: StateChanges): void {
        if (!s) {
            return;
        }
        if (!c || c.includes("printerSystemState")) {
            // if (!this.initialValueSet) {
            //     this.targetPressure.value = s.printerSystemState.pressureControl?.parameters.targetPressure.toString();
            //     this.initialValueSet = true;
            // }
            if (s.printerSystemState.pressureControl?.inkPump) {
                this.inkPumpStatus.setPumpParameters(s.printerSystemState.pressureControl.inkPump);
            }
            if (s.printerSystemState.pressureControl?.cappingPump) {
                this.cappingPumpStatus.setPumpParameters(s.printerSystemState.pressureControl.cappingPump);
            }
        }
    }


    private actionChanged() {
        let action = this.action.value;
        let showNozzlePrimingGroup = ["fillflushtank", "priming"].includes(action);
        let showTargetPressureGroup = ["targetpressure"].includes(action);
        this.nozzlePrimingGroup.style.display = showNozzlePrimingGroup ? "" : "none";
        this.nozzlePrimingGroup.disabled = !showNozzlePrimingGroup;
        this.targetPressureGroup.style.display = showTargetPressureGroup ? "" : "none";
        this.targetPressureGroup.disabled = !showTargetPressureGroup;
    }

    private parseAlgorithm(str: string): {
        alg: PressureControlAlgorithm,
        dir: PressureControlDirection
    } {
        switch (str) {
            case "targetpressure":
                return { alg: PressureControlAlgorithm.PressureControlAlgorithm_TARGET_PRESSURE, dir: PressureControlDirection.PressureControlDirection_PRESSURE };
            case "feed":
                return { alg: PressureControlAlgorithm.PressureControlAlgorithm_FEED_WITH_LIMIT, dir: PressureControlDirection.PressureControlDirection_PRESSURE };
            case "vacuum":
                return { alg: PressureControlAlgorithm.PressureControlAlgorithm_FEED_WITH_LIMIT, dir: PressureControlDirection.PressureControlDirection_VACUUM };
            default:
                return { alg: PressureControlAlgorithm.PressureControlAlgorithm_NONE, dir: PressureControlDirection.PressureControlDirection_PRESSURE };
        }
    }

    private async start() {
        if (this.inkControlForm.checkValidity()) {
            let values = new FormData(this.inkControlForm);
            console.log("Start", ...values);

            let changeParametersRequest = new ChangePressureControlParametersRequest();
            let parameters = new PressureControlParameters();
            changeParametersRequest.parameters = parameters;
            parameters.enable = false;
            let inkPumpParameters = new PressureControlPumpParameters();
            let inkPumpAlg = this.parseAlgorithm(values.get("ink-pump-pump-action") as string);
            inkPumpParameters.algorithm = inkPumpAlg.alg;
            inkPumpParameters.direction = inkPumpAlg.dir;
            inkPumpParameters.feedPwm = parseFloat(values.get("ink-pump-feed-limit-pwm") as string);
            inkPumpParameters.maxPressureLimit = parseFloat(values.get("ink-pump-feed-max-pressure") as string);
            inkPumpParameters.minPressureLimit = parseFloat(values.get("ink-pump-feed-min-pressure") as string);
            inkPumpParameters.feedTime = parseFloat(values.get("ink-pump-feed-time") as string);
            inkPumpParameters.targetPressure = parseFloat(values.get("ink-pump-target-pressure") as string);
            parameters.inkPump = inkPumpParameters;

            await this.printerUSB.sendChangePressureControlParametersRequest(changeParametersRequest);


            changeParametersRequest = new ChangePressureControlParametersRequest();
            parameters = new PressureControlParameters();
            changeParametersRequest.parameters = parameters;
            parameters.enable = true;
            let cappingPumpParameters = new PressureControlPumpParameters();
            let cappingPumpAlg = this.parseAlgorithm(values.get("capping-pump-pump-action") as string);
            cappingPumpParameters.algorithm = cappingPumpAlg.alg;
            cappingPumpParameters.direction = cappingPumpAlg.dir;
            cappingPumpParameters.feedPwm = parseFloat(values.get("capping-pump-feed-limit-pwm") as string);
            cappingPumpParameters.maxPressureLimit = parseFloat(values.get("capping-pump-feed-max-pressure") as string);
            cappingPumpParameters.minPressureLimit = parseFloat(values.get("capping-pump-feed-min-pressure") as string);
            cappingPumpParameters.feedTime = parseFloat(values.get("capping-pump-feed-time") as string);
            cappingPumpParameters.targetPressure = parseFloat(values.get("capping-pump-target-pressure") as string);
            parameters.cappingPump = cappingPumpParameters;

            await this.printerUSB.sendChangePressureControlParametersRequest(changeParametersRequest);



            // switch (action) {
            //     case "priming":
            //         parameters.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_FEED_WITH_LIMIT;
            //         parameters.direction = PressureControlDirection.PressureControlDirection_PRESSURE;
            //         parameters.feedPwm = parseFloat(values.get("feed-limit-pwm") as string);
            //         parameters.limitPressure = parseFloat(values.get("feed-limit-pressure") as string);
            //         parameters.feedTime = parseFloat(values.get("feed-time") as string);
            //         parameters.enable = true;
            //         await this.printerUSB.sendChangePressureControlParametersRequest(changeParametersRequest);
            //         break;
            //     case "fillflushtank":
            //         parameters.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_FEED_WITH_LIMIT;
            //         parameters.direction = PressureControlDirection.PressureControlDirection_VACUUM;
            //         parameters.feedPwm = parseFloat(values.get("feed-limit-pwm") as string);
            //         parameters.limitPressure = parseFloat(values.get("feed-limit-pressure") as string);
            //         parameters.feedTime = parseFloat(values.get("feed-time") as string);
            //         parameters.enable = true;
            //         await this.printerUSB.sendChangePressureControlParametersRequest(changeParametersRequest);
            //         break;
            //     case "targetpressure":
            //         parameters.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_TARGET_PRESSURE;
            //         parameters.targetPressure = parseFloat(values.get("target-pressure") as string);
            //         parameters.enable = true;
            //         await this.printerUSB.sendChangePressureControlParametersRequest(changeParametersRequest);
            //         break;
            //     default:
            //         console.error("Unknown action", action);
            //         break;
            // }
        }
        else {
            this.inkControlForm.reportValidity();
        }
    }

    private async stop() {
        let changeParametersRequest = new ChangePressureControlParametersRequest();
        let parameters = new PressureControlParameters();
        changeParametersRequest.parameters = parameters;
        parameters.enable = false;
        await this.printerUSB.sendChangePressureControlParametersRequest(changeParametersRequest);
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const InkControlTagName = "ink-control";
customElements.define(InkControlTagName, InkControl);
