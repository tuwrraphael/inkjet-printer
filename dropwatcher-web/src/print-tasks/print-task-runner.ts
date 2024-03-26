import { MovementStage } from "../movement-stage";
import { PrinterUSB } from "../printer-usb";
import { Store } from "../state/Store";
import { ProgramRunnerStateChanged } from "../state/actions/ProgramRunnerStateChanged";
import { HomeTaskRunner } from "./runners/HomeTaskRunner";
import { PrinterProgram, PrinterProgramState, PrinterTask, PrinterTaskHome, PrinterTaskType, PrinterTasks, ProgramRunnerState } from "./printer-program";
import { TaskRunnerSynchronization } from "./TaskRunnerSynchronization";
import { PrimeNozzleTaskRunner } from "./runners/PrimeNozzleTaskRunner";
import { SetTargetPressureTaskRunner } from "./runners/SetTargetPressureTaskRunner";

export class PrintTaskRunner {
    private printerUsb: PrinterUSB;
    private movementStage: MovementStage;
    private store: Store;
    private programRunnerState: any;
    private canceled = false;

    constructor(public program: PrinterProgram) {
        this.printerUsb = PrinterUSB.getInstance();
        this.movementStage = MovementStage.getInstance();
        this.store = Store.getInstance();
    }

    async isRunning() {
        return this.programRunnerState.state === PrinterProgramState.Running;
    }

    private canContinue() {
        if (this.canceled) {
            return false;
        }
        if (this.store.state.printerSystemState.usbConnected === false) {
            return false;
        }
        if (this.store.state.movementStageState.connected === false) {
            return false;
        }
        if (this.store.state.printerSystemState.errors.flags !== 0) {
            return false;
        }
        return true;
    }

    private isDone() {
        return !(this.programRunnerState.currentTaskIndex < this.program.tasks.length);
    }

    async run() {
        this.programRunnerState = {
            state: PrinterProgramState.Running,
            currentTaskIndex: 0
        };
        this.store.postAction(new ProgramRunnerStateChanged(this.programRunnerState, this.program));        
        while (this.canContinue() && !this.isDone()) {
            let nextTask = this.program.tasks[this.programRunnerState.currentTaskIndex];
            await this.runTask(nextTask);
            this.programRunnerState.currentTaskIndex++;
            this.store.postAction(new ProgramRunnerStateChanged(this.programRunnerState, this.program));
        }
        if (!this.isDone()) {
            this.programRunnerState.state = PrinterProgramState.Canceled;
        } else {
            this.programRunnerState.state = PrinterProgramState.Done;
        }
        this.store.postAction(new ProgramRunnerStateChanged(this.programRunnerState, this.program));
    }

    private async runTask(task: PrinterTasks) {
        switch (task.type) {
            case PrinterTaskType.Home:
                var homeTaskRunner = new HomeTaskRunner(task, this.movementStage);
                await homeTaskRunner.run();
                break;
            case PrinterTaskType.PrimeNozzle:
                var primeNozzleTaskRunner = new PrimeNozzleTaskRunner(task, this.printerUsb);
                await primeNozzleTaskRunner.run();
                break;
            case PrinterTaskType.SetTargetPressure:
                var setTargetPressureTaskRunner = new SetTargetPressureTaskRunner(task, this.printerUsb);
                await setTargetPressureTaskRunner.run();
                break;
            default:
                throw new Error("Unknown task type");
        }
    }

    cancel() {
        this.canceled = true;
    }
}
