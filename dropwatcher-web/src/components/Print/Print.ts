import { TaskRunnerSynchronization } from "../../print-tasks/TaskRunnerSynchronization";
import { HelloWorldProgram, HomeProgram, MoveTestProgram } from "../../print-tasks/default-programs";
import { PrintTaskRunner } from "../../print-tasks/print-task-runner";
import { State, StateChanges } from "../../state/State";
import { Store } from "../../state/Store";
import { abortableEventListener } from "../../utils/abortableEventListener";
import template from "./Print.html";
import "./Print.scss";

export class PrintComponent extends HTMLElement {

    private rendered = false;
    private abortController: AbortController;
    private store: Store;
    private programRunnerState: HTMLPreElement;
    private currentProgram: HTMLPreElement;
    constructor() {
        super();
        this.store = Store.getInstance();
    }

    connectedCallback() {
        this.abortController = new AbortController();
        this.store.subscribe((s, c) => this.update(s, c), this.abortController.signal);
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
            this.programRunnerState = document.querySelector("#program-runner-state");
            this.currentProgram = document.querySelector("#current-program");
            abortableEventListener(this.querySelector("#start-print"), "click", async (ev) => {
                ev.preventDefault();
                TaskRunnerSynchronization.getInstance().startTaskRunner(new PrintTaskRunner(HelloWorldProgram));
            }, this.abortController.signal);
        }
        this.update(this.store.state, Object.keys(this.store.state || {}) as StateChanges);
    }
    update(s: State, c: StateChanges): void {
        if (c.includes("programRunnerState")) {
            this.programRunnerState.textContent = JSON.stringify(s.programRunnerState, null, 2);
        }
        if (c.includes("currentProgram")) {
            this.currentProgram.textContent = JSON.stringify(s.currentProgram, null, 2);
        }
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const PrintTagName = "app-print";
customElements.define(PrintTagName, PrintComponent);
