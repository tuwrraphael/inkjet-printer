import { MovementStage } from "../../movement-stage";
import { abortableEventListener } from "../../utils/abortableEventListener";
import template from "./Utils.html";
import "./Utils.scss";

export class Utils extends HTMLElement {

    private rendered = false;
    private movementStage: MovementStage;
    private abortController: AbortController;
    constructor() {
        super();
        this.movementStage = MovementStage.getInstance();
    }

    connectedCallback() {
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
        }
        this.abortController = new AbortController();
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
        abortableEventListener(this.querySelector("#go-start"), "click", async (ev) => {
            ev.preventDefault();
            using movementExecutor = this.movementStage.getMovementExecutor("print");
            await movementExecutor.moveAbsoluteYAndWait(175, 4000);
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#go-end"), "click", async (ev) => {
            ev.preventDefault();
            using movementExecutor = this.movementStage.getMovementExecutor("print");
            await movementExecutor.moveAbsoluteYAndWait(0, 4000);
        }, this.abortController.signal);
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const UtilsTagName = "app-utils";
customElements.define(UtilsTagName, Utils);
