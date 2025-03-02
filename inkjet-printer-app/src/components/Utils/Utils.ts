import { MovementStage } from "../../movement-stage";
import { PrintTaskRunner } from "../../print-tasks/print-task-runner";
import { PrinterProgram, PrinterProgramState, PrinterTask, PrinterTaskNozzleWetting, PrinterTaskType } from "../../print-tasks/printer-program";
import { NozzleWettingTaskRunner } from "../../print-tasks/runners/NozzleWettingTaskRunner";
import { TaskRunnerSynchronization } from "../../print-tasks/TaskRunnerSynchronization";
import { PrinterUSB } from "../../printer-usb";
import { PressureControlDirection } from "../../proto/compiled";
import { ChangePressureControlParametersRequest, PressureControlAlgorithm, PressureControlParameters, PressureControlPumpParameters } from "../../proto/compiled";
import { Store } from "../../state/Store";
import { abortableEventListener } from "../../utils/abortableEventListener";
import template from "./Utils.html";
import "./Utils.scss";

export class Utils extends HTMLElement {

    private rendered = false;
    private movementStage: MovementStage;
    private abortController: AbortController;
    private printerUSB: PrinterUSB;
    private store: Store;
    private taskRunnerSynchronization: TaskRunnerSynchronization;
    constructor() {
        super();
        this.movementStage = MovementStage.getInstance();
        this.printerUSB = PrinterUSB.getInstance();
        this.store = Store.getInstance();
        this.taskRunnerSynchronization = TaskRunnerSynchronization.getInstance();
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
        abortableEventListener(this.querySelector("#wetting-nozzle-plate"), "click", async (ev) => {
            ev.preventDefault();
            let steps: PrinterTaskNozzleWetting[] = [
                {
                    type: PrinterTaskType.NozzleWetting,
                    pressureWetting: 4,
                    pressurePrinting: -0.5,
                    wettingWaitTime: 3000
                }
            ];
            let program: PrinterProgram = {
                tasks: steps
            };
            if (this.store.state.programRunnerState.state !== PrinterProgramState.Paused &&
                this.store.state.programRunnerState.state !== PrinterProgramState.Running) {
                this.taskRunnerSynchronization.startTaskRunner(new PrintTaskRunner(program));
            }
        }, this.abortController.signal);
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const UtilsTagName = "app-utils";
customElements.define(UtilsTagName, Utils);
