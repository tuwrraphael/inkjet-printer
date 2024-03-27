import { PrinterUSB } from "../../printer-usb";
import { SetNozzleDataRequest } from "../../proto/compiled";
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
    constructor() {
        super();
        this.printerUsb = PrinterUSB.getInstance();
        this.store = Store.getInstance();
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
            abortableEventListener(this.setNozzlesButton, "click", (e) => {
                e.preventDefault();
                this.setNozzles();
            }, this.abortController.signal);
            this.store.subscribe((state, changed) => this.update(state, changed), this.abortController.signal);
        }
        this.update(this.store.state, <StateChanges>Object.keys(this.store.state || {}));
    }
    private update(state: State, changed: StateChanges): void {
        this.setNozzlesButton.disabled = !state.printerSystemState?.usbConnected || state.printerSystemState.state != PrinterSystemState.Dropwatcher;
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

    private setNozzles() {
        let formData = new FormData(this.nozzleForm);
        let nozzleData = new Uint32Array(4);
        for (let i = 0; i < NumNozzles; i++) {
            let value = formData.get(`nozzle${i}`) === "on";
            this.setNozzle(i, value, nozzleData);
        }
        let setNozzleDataRequest = new SetNozzleDataRequest();
        setNozzleDataRequest.data = Array.from(nozzleData);
        console.log(setNozzleDataRequest);
        this.printerUsb.sendSetNozzleDataRequest(setNozzleDataRequest);
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

    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const DropwatcherTagName = "app-dropwatcher";
customElements.define(DropwatcherTagName, DropwatcherComponent);
