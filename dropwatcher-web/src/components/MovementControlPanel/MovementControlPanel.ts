import { Z_FINISH } from "zlib";
import { MovementStage } from "../../movement-stage";
import { abortableEventListener } from "../../utils/abortableEventListener";
import template from "./MovementControlPanel.html";
import "./MovementControlPanel.scss";

export class MovementControlPanel extends HTMLElement {

    private rendered = false;
    private enableKeyboardControl: HTMLInputElement;
    private form: HTMLFormElement;
    private abortController: AbortController;
    private abortKeyboardEvent: AbortController;
    private movementStage: MovementStage;
    private stepSize: number;
    private moving = false;
    constructor() {
        super();
        this.movementStage = MovementStage.getInstance();
    }

    connectedCallback() {
        this.abortController = new AbortController();
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
            this.enableKeyboardControl = this.querySelector("#enable-keyboard-control");
            this.form = this.querySelector("form");
            abortableEventListener(this.form, "input", () => { this.toggleKeyboardControl(); }, this.abortController.signal);
        }
    }

    private toggleKeyboardControl() {
        let xyfeedrate = 400;
        let zfeedrate = 100;
        if (!this.form.reportValidity()) {
            this.enableKeyboardControl.checked = false;
        }
        this.stepSize = parseFloat(new FormData(this.form).get("step-size") as string);
        if (this.enableKeyboardControl.checked && null == this.abortKeyboardEvent) {
            this.abortKeyboardEvent = new AbortController();
            console.log("install");
            abortableEventListener(document, "keydown", async (ev: KeyboardEvent) => {
                if (this.moving) {
                    return;
                }
                this.moving = true;
                
                switch (ev.code) {
                    case "ArrowUp":
                        ev.preventDefault();
                        await this.movementStage.movementExecutor.moveRelativeAndWait(0, -this.stepSize, 0, xyfeedrate);
                        break;
                    case "ArrowDown":
                        ev.preventDefault();
                        await this.movementStage.movementExecutor.moveRelativeAndWait(0, this.stepSize, 0, xyfeedrate);
                        break;
                    case "ArrowLeft":
                        ev.preventDefault();
                        await this.movementStage.movementExecutor.moveRelativeAndWait(this.stepSize, 0, 0, xyfeedrate);
                        break;
                    case "ArrowRight":
                        ev.preventDefault();
                        await this.movementStage.movementExecutor.moveRelativeAndWait(-this.stepSize, 0, 0, xyfeedrate);
                        break;
                    case "NumpadAdd":
                        ev.preventDefault();
                        await this.movementStage.movementExecutor.moveRelativeAndWait(0, 0, this.stepSize, zfeedrate);
                        break;
                    case "NumpadSubtract":
                        ev.preventDefault();
                        await this.movementStage.movementExecutor.moveRelativeAndWait(0, 0, -this.stepSize, zfeedrate);
                        break;
                }
                this.moving = false;
            }, this.abortKeyboardEvent.signal);
        } else if (!this.enableKeyboardControl.checked && null != this.abortKeyboardEvent) {
            console.log("remove");
            this.abortKeyboardEvent.abort();
            this.abortKeyboardEvent = null;
        }
    }

    disconnectedCallback() {
        this.abortController.abort();
        this.abortKeyboardEvent && this.abortKeyboardEvent.abort();
    }
}

export const MovementControlPanelTagName = "movement-control-panel";
customElements.define(MovementControlPanelTagName, MovementControlPanel);
