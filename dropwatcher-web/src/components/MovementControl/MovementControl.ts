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
                await this.movmentStage.sendGcode((this.querySelector("#gcode") as HTMLTextAreaElement).value);
            }, this.abortController.signal);
            abortableEventListener(this.querySelector("#btn-home"), "click", async (event) => {
                event.preventDefault();
                await this.movmentStage.movementExecutor.home();
            }, this.abortController.signal);
            abortableEventListener(this.querySelector("#btn-dock-capping-station"), "click", async (event) => {
                event.preventDefault();
                await this.movmentStage.movementExecutor.home();
                await this.movmentStage.movementExecutor.moveAbsoluteAndWait(100, 100, 0, 400);
            }, this.abortController.signal);
            abortableEventListener(this.querySelector("#btn-undock-capping-station"), "click", async (event) => {
                event.preventDefault();
                await this.movmentStage.movementExecutor.moveAbsoluteAndWait(100, 100, 30, 400);
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
