import { PrinterUSB } from "../../printer-usb";
import { ChangePressureControlParametersRequest, PressureControlAlgorithm, PressureControlDirection, PressureControlParameters, PressureControlPumpParameters } from "../../proto/compiled";
import { abortableEventListener } from "../../utils/abortableEventListener";
import template from "./InkControlLoadInk.html";
import "./InkControlLoadInk.scss";

export class InkControlLoadInk extends HTMLElement {

    private rendered = false;
    private abortController: AbortController;
    private printerUSB: PrinterUSB;
    constructor() {
        super();
        this.printerUSB = PrinterUSB.getInstance();
    }

    connectedCallback() {
        this.abortController = new AbortController();
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
        }
        abortableEventListener(this.querySelector("button"), "click", async ev => {
            this.querySelector("button").disabled = true;
            ev.preventDefault();
            let time = parseInt((<HTMLInputElement>this.querySelector("input")).value);
            let changeParametersRequest = new ChangePressureControlParametersRequest();
            let parameters = new PressureControlParameters();
            changeParametersRequest.parameters = parameters;
            parameters.enable = false;
            let inkPumpParameters = new PressureControlPumpParameters();
            inkPumpParameters.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_NONE;
            parameters.inkPump = inkPumpParameters;
            await this.printerUSB.sendChangePressureControlParametersRequest(changeParametersRequest);


            changeParametersRequest = new ChangePressureControlParametersRequest();
            parameters = new PressureControlParameters();
            changeParametersRequest.parameters = parameters;
            parameters.enable = true;
            let cappingPumpParameters = new PressureControlPumpParameters();
            cappingPumpParameters.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_FEED_WITH_LIMIT;
            cappingPumpParameters.direction = PressureControlDirection.PressureControlDirection_VACUUM;
            cappingPumpParameters.feedPwm = 0.4;
            cappingPumpParameters.maxPressureLimit = 20;
            cappingPumpParameters.minPressureLimit = -20;
            cappingPumpParameters.feedTime = time
            parameters.cappingPump = cappingPumpParameters;
            await this.printerUSB.sendChangePressureControlParametersRequestAndWait(changeParametersRequest);
            this.querySelector("button").disabled = false;
        }, this.abortController.signal);
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const InkControlLoadInkTagName = "ink-control-load-ink";
customElements.define(InkControlLoadInkTagName, InkControlLoadInk);
