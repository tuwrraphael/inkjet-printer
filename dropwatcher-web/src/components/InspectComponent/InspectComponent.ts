import template from "./InspectComponent.html";
import "./InspectComponent.scss";
import "../MovementControlPanel/MovementControlPanel";

export class InspectComponent extends HTMLElement {
   
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

export const InspectComponentTagName = "inspect-component";
customElements.define(InspectComponentTagName, InspectComponent);
