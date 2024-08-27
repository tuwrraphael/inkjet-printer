import { NozzleBlockStatusChanged } from "../../state/actions/NozzleBlockStatusChanged";
import { State, StateChanges } from "../../state/State";
import { Store } from "../../state/Store";
import { abortableEventListener } from "../../utils/abortableEventListener";
import template from "./NozzleTestElement.html";
import "./NozzleTestElement.scss";

export class NozzleTestElement extends HTMLElement {
    private rendered = false;
    private _nozzle: number | undefined;
    private nozzleId: HTMLSpanElement;
    private label: HTMLLabelElement;
    private blocked: HTMLInputElement;
    private store: Store;
    private abortController: AbortController;
    private isBlocked: boolean;
    private blockedText: HTMLSpanElement;
    img: HTMLImageElement;

    constructor() {
        super();
        this.store = Store.getInstance();
    }

    connectedCallback() {
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
            this.nozzleId = this.querySelector(".nozzle-id");
            this.label = this.querySelector("label");
            this.blocked = this.querySelector("[name=blocked]");
            this.blockedText = this.querySelector(".blocked-text");
            this.img = this.querySelector("img");

            this.update();
        }
        this.abortController = new AbortController();
        this.store.subscribe((s, c) => this.updateStore(s, c));
        abortableEventListener(this.blocked, "change", (ev) => {
            this.store.postAction(new NozzleBlockStatusChanged(this.nozzle, this.blocked.checked));
        }, this.abortController.signal);
        abortableEventListener(this.img, "click", (ev) => {
            this.img.classList.toggle("enlarged");
        }, this.abortController.signal);
        this.updateStore(this.store.state, null);
    }
    updateStore(s: State, c: StateChanges): void {
        let keysOfInterest = ["printState"];
        if (s && (null == c || c.some((change) => keysOfInterest.includes(change)))) {
            this.isBlocked = s.printState.printerParams.blockedNozzles.find(n => n === this.nozzle) !== undefined;
            this.update();
        }
    }

    get nozzle(): number | undefined {
        return this._nozzle;
    }

    set nozzle(value: number | undefined) {
        this._nozzle = value;
    }

    static get observedAttributes() {
        return ["nozzle"];
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === "nozzle") {
            this.nozzle = parseInt(newValue);
        }
        this.update();
    }

    update() {
        if (!this.rendered) {
            return;
        }
        this.nozzleId.innerText = this.nozzle.toString();
        this.label.htmlFor = `blocked-${this.nozzle}`;
        this.blocked.id = `blocked-${this.nozzle}`;
        this.blocked.checked = this.isBlocked;
        this.blockedText.innerText = this.isBlocked ? "Blocked" : "Blocked";
        this.label.classList.toggle("blocked-display--blocked", this.isBlocked);
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const NozzleTestElementTagName = "nozzle-test-element";
customElements.define(NozzleTestElementTagName, NozzleTestElement);
