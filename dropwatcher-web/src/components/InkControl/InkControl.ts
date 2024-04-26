import template from "./InkControl.html";
import "./InkControl.scss";
import "../Chart/Chart";
import { abortableEventListener } from "../../utils/abortableEventListener";
import { PressureControlAlgorithm, ChangePressureControlParametersRequest, PressureControlDirection, PressureControlParameters } from "../../proto/compiled";
import { PrinterUSB } from "../../printer-usb";

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
    constructor() {
        super();
        this.printerUSB = PrinterUSB.getInstance();
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
            abortableEventListener(this.action, "change", () => this.actionChanged(), this.abortController.signal);
            abortableEventListener(this.btnStart, "click", (ev) => {
                ev.preventDefault();
                this.start().catch(console.error);
            }, this.abortController.signal);
            abortableEventListener(this.btnStop, "click", (ev) => {
                ev.preventDefault();
                this.stop().catch(console.error);
            }, this.abortController.signal);
        }
        this.actionChanged();
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

    private async start() {
        if (this.inkControlForm.checkValidity()) {
            let values = new FormData(this.inkControlForm);
            console.log("Start", ...values);
            let action = values.get("action");
            let changeParametersRequest = new ChangePressureControlParametersRequest();
            let parameters = new PressureControlParameters();
            changeParametersRequest.parameters = parameters;
            switch (action) {
                case "priming":
                    parameters.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_FEED_WITH_LIMIT;
                    parameters.direction = PressureControlDirection.PressureControlDirection_PRESSURE;
                    parameters.feedPwm = parseFloat(values.get("feed-limit-pwm") as string);
                    parameters.limitPressure = parseFloat(values.get("feed-limit-pressure") as string);
                    parameters.feedTime = parseFloat(values.get("feed-time") as string);
                    parameters.enable = true;
                    await this.printerUSB.sendChangePressureControlParametersRequest(changeParametersRequest);
                    break;
                case "fillflushtank":
                    parameters.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_FEED_WITH_LIMIT;
                    parameters.direction = PressureControlDirection.PressureControlDirection_VACUUM;
                    parameters.feedPwm = parseFloat(values.get("feed-limit-pwm") as string);
                    parameters.limitPressure = parseFloat(values.get("feed-limit-pressure") as string);
                    parameters.feedTime = parseFloat(values.get("feed-time") as string);
                    parameters.enable = true;
                    await this.printerUSB.sendChangePressureControlParametersRequest(changeParametersRequest);
                    break;
                case "targetpressure":
                    parameters.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_TARGET_PRESSURE;
                    parameters.targetPressure = parseFloat(values.get("target-pressure") as string);
                    parameters.enable = true;
                    await this.printerUSB.sendChangePressureControlParametersRequest(changeParametersRequest);
                    break;
                default:
                    console.error("Unknown action", action);
                    break;
            }
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
