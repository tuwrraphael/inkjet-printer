import { MovementStage } from "../movement-stage";
import { PrinterUSB } from "../printer-usb";
import { Store } from "../state/Store";
import { ProgramRunnerStateChanged } from "../state/actions/ProgramRunnerStateChanged";
import { HomeTaskRunner } from "./runners/HomeTaskRunner";
import { PrinterProgram, PrinterProgramState, PrinterTask, PrinterTaskHome, PrinterTaskType, PrinterTasks, ProgramRunnerState } from "./printer-program";
import { TaskRunnerSynchronization } from "./TaskRunnerSynchronization";
import { PrimeNozzleTaskRunner } from "./runners/PrimeNozzleTaskRunner";
import { SetTargetPressureTaskRunner } from "./runners/SetTargetPressureTaskRunner";
import { SetNozzleDataTaskRunner } from "./runners/SetNozzleDataTaskRunner";
import { RequestFireTaskRunner } from "./runners/RequestFireTaskRunner";

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
                let homeTaskRunner = new HomeTaskRunner(task, this.movementStage);
                await homeTaskRunner.run();
                break;
            case PrinterTaskType.PrimeNozzle:
                let primeNozzleTaskRunner = new PrimeNozzleTaskRunner(task, this.printerUsb);
                await primeNozzleTaskRunner.run();
                break;
            case PrinterTaskType.SetTargetPressure:
                let setTargetPressureTaskRunner = new SetTargetPressureTaskRunner(task, this.printerUsb);
                await setTargetPressureTaskRunner.run();
                break;
            case PrinterTaskType.SetNozzleData:
                let setNozzleDataTaskRunner = new SetNozzleDataTaskRunner(task, this.printerUsb);
                await setNozzleDataTaskRunner.run();
                break;
            case PrinterTaskType.RequestFire:
                let requestFireTaskRunner = new RequestFireTaskRunner(task, this.printerUsb);
                await requestFireTaskRunner.run();
                break;
            default:
                throw new Error("Unknown task type");
        }
    }

    cancel() {
        this.canceled = true;
    }
}
