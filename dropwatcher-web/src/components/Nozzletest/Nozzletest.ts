import template from "./Nozzletest.html";
import "./Nozzletest.scss";

export class Nozzletest extends HTMLElement {
   
    private rendered = false;
    constructor() {
        super();
    }

    connectedCallback() {
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
        }
    }

    disconnectedCallback() {

    }
}

export const NozzletestTagName = "app-nozzletest";
customElements.define(NozzletestTagName, Nozzletest);
