import { PressureControlAlgorithm, PressureControlDirection, PressureControlPumpParameters } from "../../state/State";
import template from "./PumpStatus.html";
import "./PumpStatus.scss";

const numberFormat = new Intl.NumberFormat('de-AT', { style: 'decimal', maximumFractionDigits: 2 });

export class PumpStatus extends HTMLElement {

    private rendered = false;
    private targetPressure: HTMLSpanElement;
    private feedTime: HTMLSpanElement;
    private feedPwm: HTMLSpanElement;
    private maxPressure: HTMLSpanElement;
    private minPressure: HTMLSpanElement;
    private direction: HTMLSpanElement;
    private pumpAlgorithm: HTMLSpanElement;
    constructor() {
        super();
    }

    connectedCallback() {
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
            this.targetPressure = this.querySelector("#pump-target-pressure");
            this.direction = this.querySelector("#pump-direction");
            this.feedTime = this.querySelector("#pump-feed-time");
            this.feedPwm = this.querySelector("#pump-feed-pwm");
            this.maxPressure = this.querySelector("#pump-max-pressure");
            this.minPressure = this.querySelector("#pump-min-pressure");
            this.pumpAlgorithm = this.querySelector("#pump-algorithm");
        }
    }

    formatPressureControlDirection(direction: PressureControlDirection) {
        switch (direction) {
            case PressureControlDirection.Pressure:
                return "Pressure";
            case PressureControlDirection.Vacuum:
                return "Vacuum";
            default:
                return "Unspecified";
        }
    }

    formatPressureControlAlgorithm(algorithm: PressureControlAlgorithm) {
        switch (algorithm) {
            case PressureControlAlgorithm.FeedwithLimit:
                return "Feed with Limit";
            case PressureControlAlgorithm.TargetPressure:
                return "Target Pressure";
            default:
                return "Unspecified";
        }
    }

    formatNumber(n: number) {
        if (isNaN(n) || n == undefined) return "-";
        return numberFormat.format(n);
    }


    setPumpParameters(p: PressureControlPumpParameters) {
        this.targetPressure.innerText = this.formatNumber(p.targetPressure);
        this.direction.innerText = this.formatPressureControlDirection(p.direction);
        this.feedTime.innerText = this.formatNumber(p.feedTime);
        this.feedPwm.innerText = this.formatNumber(p.feedPwm);
        this.maxPressure.innerText = this.formatNumber(p.maxPressureLimit);
        this.minPressure.innerText = this.formatNumber(p.minPressureLimit);
        this.pumpAlgorithm.innerText = this.formatPressureControlAlgorithm(p.algorithm);
    }

    disconnectedCallback() {

    }
}

export const PumpStatusTagName = "pump-status";
customElements.define(PumpStatusTagName, PumpStatus);
