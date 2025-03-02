import template from "./HomeComponent.html";
import "./HomeComponent.scss";

export class HomeComponent extends HTMLElement {
   
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

export const HomeComponentTagName = "home-component";
customElements.define(HomeComponentTagName, HomeComponent);
