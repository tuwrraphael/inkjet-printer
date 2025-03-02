import { getNozzleTestTasks } from "../../print-tasks/NozzleTestTasks";
import { PrintTaskRunner } from "../../print-tasks/print-task-runner";
import { PrinterProgram, PrinterProgramState, PrinterTasks, PrinterTaskType } from "../../print-tasks/printer-program";
import { TaskRunnerSynchronization } from "../../print-tasks/TaskRunnerSynchronization";
import { NozzleBlockStatusChanged } from "../../state/actions/NozzleBlockStatusChanged";
import { State, StateChanges } from "../../state/State";
import { Store } from "../../state/Store";
import { abortableEventListener } from "../../utils/abortableEventListener";
import { ArrayToElementRenderer } from "../../utils/ArrayToElementRenderer";
import { NozzleTestElement, NozzleTestElementTagName } from "../NozzleTestElement/NozzleTestElement";
import template from "./Nozzletest.html";
import "./Nozzletest.scss";

export class Nozzletest extends HTMLElement {

    private rendered = false;
    private store: Store;
    private abortController: AbortController;
    private renderer: ArrayToElementRenderer<{ id: number }, NozzleTestElement, number>;
    private container: HTMLDivElement;
    private taskRunnerSynchronization: TaskRunnerSynchronization;
    private startNozzleTest: HTMLButtonElement;
    constructor() {
        super();
        this.store = Store.getInstance();
        this.taskRunnerSynchronization = TaskRunnerSynchronization.getInstance();
    }

    connectedCallback() {
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
            this.container = this.querySelector(".nozzletest-container");
            this.renderer = new ArrayToElementRenderer<{ id: number }, NozzleTestElement, number>(this.container, m => m.id, (m) => {
                let el: NozzleTestElement = document.createElement(NozzleTestElementTagName) as NozzleTestElement;
                return el;
            });
            this.startNozzleTest = this.querySelector("#start-nozzle-test");
        }
        this.abortController = new AbortController();
        abortableEventListener(this.startNozzleTest, "click", async (ev) => {
            ev.preventDefault();
            let steps: PrinterTasks[] = [
                {
                    type: PrinterTaskType.Home,
                },
                {
                    type: PrinterTaskType.Move,
                    movement: {
                        x: 0, y: 0
                    },
                    feedRate: 10000
                },
                {
                    type: PrinterTaskType.Wait,
                    durationMs: 1000
                },
                {
                    type: PrinterTaskType.ZeroEncoder
                },
                ...getNozzleTestTasks(0)
            ];
            let program: PrinterProgram = {
                tasks: steps
            };
            this.taskRunnerSynchronization.startTaskRunner(new PrintTaskRunner(program));
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#set-all-blocked"), "click", async (ev) => {
            ev.preventDefault();
            this.store.postAction(new NozzleBlockStatusChanged(Array.from({ length: 128 }, (_, i) => ({ nozzleId: i, blocked: true }))));
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#set-all-unblocked"), "click", async (ev) => {
            ev.preventDefault();
            this.store.postAction(new NozzleBlockStatusChanged(Array.from({ length: 128 }, (_, i) => ({ nozzleId: i, blocked: false }))));
        }, this.abortController.signal);
        this.store.subscribe((s, c) => this.update(s, c));
        this.update(this.store.state, null);
    }
    update(state: State, stateChanges: StateChanges): void {
        if (state && (null == stateChanges || stateChanges.some((change) => ["printState"].includes(change)))) {
            let numNozzles = state.printState.printerParams.numNozzles;
            this.renderer.update(Array.from({ length: numNozzles }, (_, i) => ({ id: i })),
                (el, m) => {
                    el.setAttribute("nozzle", m.id.toString());
                });
        }
        if (state && (null == stateChanges || stateChanges.some((change) => ["programRunnerState"].includes(change)))) {
            this.startNozzleTest.disabled = state.programRunnerState.state == PrinterProgramState.Paused || state.programRunnerState.state == PrinterProgramState.Running;
        }
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const NozzletestTagName = "app-nozzletest";
customElements.define(NozzletestTagName, Nozzletest);
