import { MovementStage } from "../../movement-stage";
import { abortableEventListener } from "../../utils/abortableEventListener";
import template from "./MovementControl.html";
import "./MovementControl.scss";

export class MovementControl extends HTMLElement {

    private rendered = false;
    private movementStage: MovementStage;
    private abortController: AbortController;
    constructor() {
        super();
        this.movementStage = MovementStage.getInstance();
    }

    connectedCallback() {
        this.abortController = new AbortController();
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;

            abortableEventListener(this.querySelector("#btn-send"), "click", async (event) => {
                event.preventDefault();
                using executor = this.movementStage.getMovementExecutor("movement-control");
                await executor.sendRaw((this.querySelector("#gcode") as HTMLTextAreaElement).value);
            }, this.abortController.signal);
            abortableEventListener(this.querySelector("#btn-home"), "click", async (event) => {
                event.preventDefault();
                using executor = this.movementStage.getMovementExecutor("movement-control");
                await executor.home();
            }, this.abortController.signal);
            abortableEventListener(this.querySelector("#btn-dock-capping-station"), "click", async (event) => {
                event.preventDefault();
                using executor = this.movementStage.getMovementExecutor("movement-control");
                await executor.home();
                await executor.moveAbsoluteAndWait(100, 100, 0, 400);
            }, this.abortController.signal);
            abortableEventListener(this.querySelector("#btn-undock-capping-station"), "click", async (event) => {
                event.preventDefault();
                using executor = this.movementStage.getMovementExecutor("movement-control");
                await executor.moveAbsoluteAndWait(100, 100, 30, 400);
                console.log("undocked");
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
