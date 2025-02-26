import { State, StateChanges } from "../../state/State";
import { Store } from "../../state/Store";
import { PrintingParamsChanged as PrintingParamsChanged } from "../../state/actions/PrintOptionsChanged";
import { abortableEventListener } from "../../utils/abortableEventListener";
import template from "./PrintOptions.html";
import "./PrintOptions.scss";

export class PrintOptions extends HTMLElement {

    private rendered = false;
    private fireEvery: HTMLInputElement;
    store: any;
    private abortController: AbortController;
    private firstLayerHeight: HTMLInputElement;
    private bedTemperature: HTMLInputElement;
    private dryingTemperature : HTMLInputElement;
    private inkPressure : HTMLInputElement;
    private voltage: HTMLInputElement;
    private dryingTime: HTMLInputElement;
    private skipNozzles: HTMLInputElement;
    private offsetEveryOtherLayerByTicks: HTMLInputElement;
    private offsetEveryOtherLayerByNozzles: HTMLInputElement;
    private clock: HTMLInputElement;
    private form: HTMLFormElement;
    constructor() {
        super();
    }

    connectedCallback() {
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
            this.fireEvery = this.querySelector("#fire-every");
            this.firstLayerHeight = this.querySelector("#first-layer-height");
            this.bedTemperature = this.querySelector("#bed-temperature");
            this.dryingTime = this.querySelector("#drying-time");
            this.voltage = this.querySelector("#voltage");
            this.clock = this.querySelector("#clock");
            this.skipNozzles = this.querySelector("#skip-nozzles");
            this.offsetEveryOtherLayerByTicks = this.querySelector("#offset-every-other-layer-by-ticks");
            this.offsetEveryOtherLayerByNozzles = this.querySelector("#offset-every-other-layer-by-nozzles");
            this.form = this.querySelector("#print-options-form");
            this.inkPressure = this.querySelector("#inkpressure");
            this.dryingTemperature = this.querySelector("#drying-temperature");
        }
        this.abortController = new AbortController();
        this.store = Store.getInstance();

        this.store.subscribe((s: State, c: StateChanges) => this.update(s, c));

        abortableEventListener(this.form, "submit", (e) => {
            e.preventDefault();
            if (this.form.checkValidity()) {

                let formData = new FormData(e.target as HTMLFormElement);
                let fireEvery = parseInt(formData.get("fire-every") as string);
                let firstLayerHeight = parseFloat(formData.get("first-layer-height") as string);
                let bedTemperature = parseInt(formData.get("bed-temperature") as string);
                let voltage = parseFloat(formData.get("voltage") as string);
                let clock = parseInt(formData.get("clock") as string);
                let dryingTemperature = parseInt(formData.get("drying-temperature") as string);
                let inkPressure = parseFloat(formData.get("inkpressure") as string);
                this.store.postAction(new PrintingParamsChanged({
                    fireEveryTicks: fireEvery,
                    firstLayerHeight: firstLayerHeight,
                    bedTemperature: bedTemperature,
                    waveform: {
                        voltage: voltage,
                        clockFrequency: clock
                    },
                    inkPressure: inkPressure,
                    dryingTimeSeconds: parseInt(formData.get("drying-time") as string),
                    dryingTemperature: dryingTemperature,
                    skipNozzles: parseInt(formData.get("skip-nozzles") as string),
                    offsetLayers: {
                        printAxis: {
                            everyOtherLayerByTicks: parseInt(formData.get("offset-every-other-layer-by-ticks") as string)
                        },
                        moveAxis: {
                            everyOtherLayerByNozzles: parseInt(formData.get("offset-every-other-layer-by-nozzles") as string)
                        }
                    }
                }));
            } else {
                this.form.reportValidity();
            }
        }, this.abortController.signal);

        this.update(this.store.state, ["printState"]);
    }
    update(s: State, c: StateChanges) {
        if (null == s) {
            return;
        }
        if (!c || c.includes("printState")) {
            this.fireEvery.value = s.printState.printingParams.fireEveryTicks.toString();
            this.firstLayerHeight.value = s.printState.printingParams.firstLayerHeight.toString();
            this.bedTemperature.value = s.printState.printingParams.bedTemperature.toString();
            this.voltage.value = s.printState.printingParams.waveform.voltage.toString();
            this.dryingTime.value = s.printState.printingParams.dryingTimeSeconds.toString();
            this.skipNozzles.value = s.printState.printingParams.skipNozzles.toString();
            this.offsetEveryOtherLayerByTicks.value = s.printState.printingParams.offsetLayers?.printAxis?.everyOtherLayerByTicks.toString();
            this.offsetEveryOtherLayerByNozzles.value = s.printState.printingParams.offsetLayers?.moveAxis?.everyOtherLayerByNozzles.toString();
            this.clock.value = s.printState.printingParams.waveform.clockFrequency.toString();
            this.inkPressure.value = s.printState.printingParams.inkPressure.toString();
            this.dryingTemperature.value = s.printState.printingParams.dryingTemperature.toString();
        }
    }


    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const PrintOptionsTagName = "print-options";
customElements.define(PrintOptionsTagName, PrintOptions);
