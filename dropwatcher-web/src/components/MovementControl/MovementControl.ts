import { MovementStage } from "../../movement-stage";
import { abortableEventListener } from "../../utils/abortableEventListener";
import template from "./MovementControl.html";
import "./MovementControl.scss";

export class MovementControl extends HTMLElement {

    private rendered = false;
    private movmentStage: MovementStage;
    private abortController: AbortController;
    constructor() {
        super();
        this.movmentStage = MovementStage.getInstance();
    }

    connectedCallback() {
        this.abortController = new AbortController();
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
           
            abortableEventListener(this.querySelector("#btn-send"), "click", async () => {
                await this.movmentStage.sendGcode((this.querySelector("#gcode")as HTMLTextAreaElement).value);
            }, this.abortController.signal);
        }

        // navigator.usb.ge
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const MovementControlTagName = "movement-control";
customElements.define(MovementControlTagName, MovementControl);
