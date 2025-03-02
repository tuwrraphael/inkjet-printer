import { abortableEventListener } from "../../utils/abortableEventListener";
import template from "./NozzleCheckBox.html";
let templateElement: HTMLTemplateElement = document.createElement("template");
templateElement.innerHTML = template;
document.importNode(templateElement.content, true);

export class NozzleCheckBox extends HTMLElement {

    private rendered = false;

    static formAssociated = true;
    private _internals: ElementInternals;
    _value: boolean;
    private checkBox: HTMLInputElement;
    private abortController: AbortController;
    private label: HTMLLabelElement;
    setByEnter: boolean;
    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(templateElement.content.cloneNode(true));
        this._internals = this.attachInternals();
        this._value = false;
    }

    get value() { return this._value; }
    set value(v) { this._value = v; this.checkBox.checked = v; this.checkBoxChange();}

    connectedCallback() {
        this.abortController = new AbortController();
        if (!this.rendered) {
            this.rendered = true;
            this.checkBox = this.shadowRoot.querySelector("input");
            this.label = this.shadowRoot.querySelector("label");
            abortableEventListener(this.checkBox, "change", () => this.checkBoxChange(), this.abortController.signal);
            abortableEventListener(this.label, "mouseenter", (ev: MouseEvent) => this.labelMouseEnter(ev), this.abortController.signal);
            abortableEventListener(this.label, "mouseleave", (ev: MouseEvent) => this.labelMouseLeave(ev), this.abortController.signal);
            // abortableEventListener(this.label, "click", (ev: MouseEvent) => ev.preventDefault(), this.abortController.signal);
        }
    }
    labelMouseLeave(ev: MouseEvent): any {
        if (ev.buttons === 1 && !this.setByEnter) {
            this.checkBox.checked = !this.checkBox.checked;
            this.checkBoxChange();
        }
        this.setByEnter = false;
    }
    labelMouseEnter(ev: MouseEvent): any {
        if (ev.buttons === 1) {
            this.setByEnter = true;
            this.checkBox.checked = !this.checkBox.checked;
            this.checkBoxChange();
        }
    }
    private checkBoxChange() {
        this._value = this.checkBox.checked;
        if (this._value) {
            this._internals.setFormValue("on");
        }
        else {
            this._internals.setFormValue(null);
        }
        this.dispatchEvent(new Event("change", { bubbles: true }));
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const NozzleCheckBoxTagName = "nozzle-check-box";
customElements.define(NozzleCheckBoxTagName, NozzleCheckBox);
