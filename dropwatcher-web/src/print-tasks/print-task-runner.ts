import { MovementStage } from "../movement-stage";
import { PrinterUSB } from "../printer-usb";
import { Store } from "../state/Store";
import { ProgramRunnerStateChanged } from "../state/actions/ProgramRunnerStateChanged";
import { HomeTaskRunner } from "./runners/HomeTaskRunner";
import { MoveTaskRunner } from "./runners/MoveTaskRunner";
import { PrinterProgram, PrinterProgramState, PrinterTaskPrintCustomTracksTask, PrinterTaskType, PrinterTasks, ProgramRunnerState } from "./printer-program";
import { PrimeNozzleTaskRunner } from "./runners/PrimeNozzleTaskRunner";
import { SetTargetPressureTaskRunner } from "./runners/SetTargetPressureTaskRunner";
import { SetNozzleDataTaskRunner } from "./runners/SetNozzleDataTaskRunner";
import { RequestFireTaskRunner } from "./runners/RequestFireTaskRunner";
import { WaitTaskRunner } from "./runners/WaitTaskRunner";
import { ZeroEncoderTaskRunner } from "./runners/ZeroEncoderTaskRunner";
import { PrintCustomTracksTaskRunner, PrintLayerTaskRunner } from "./runners/PrintLayerTaskRunner";
import { SlicerClient } from "../slicer/SlicerClient";
import { HeatBedTaskRunner } from "./runners/HeatBedTaskRunner";
import { PrinterTaskCancellationToken } from "./PrinterTaskCancellationToken";
import { GCodeRunner } from "../gcode-runner";

export class PrintTaskRunner {
    private printerUsb: PrinterUSB;
    private movementStage: MovementStage;
    private store: Store;
    private programRunnerState: ProgramRunnerState;
    private canceled = false;
    private slicerClient: SlicerClient;

    constructor(public program: PrinterProgram) {
        this.printerUsb = PrinterUSB.getInstance();
        this.movementStage = MovementStage.getInstance();
        this.store = Store.getInstance();
        this.slicerClient = SlicerClient.getInstance();
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
        using movementExecutor = this.movementStage.getMovementExecutor("print-task-runner");
        this.programRunnerState = {
            state: PrinterProgramState.Running,
            currentTaskIndex: 0
        };
        this.store.postAction(new ProgramRunnerStateChanged(this.programRunnerState, this.program));
        while (this.canContinue() && !this.isDone()) {
            let nextTask = this.program.tasks[this.programRunnerState.currentTaskIndex];
            await this.runTask(nextTask, movementExecutor);
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

    private get cancellationToken(): PrinterTaskCancellationToken {
        return new PrinterTaskCancellationToken(() => !this.canContinue());
    }

    private async runTask(task: PrinterTasks, movementExecutor: GCodeRunner) {
        switch (task.type) {
            case PrinterTaskType.Home:
                let homeTaskRunner = new HomeTaskRunner(task, movementExecutor);
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
            case PrinterTaskType.Move:
                let moveTaskRunner = new MoveTaskRunner(task, movementExecutor);
                await moveTaskRunner.run();
                break;
            case PrinterTaskType.PrintLayer:
                let moveAndSliceNextTaskRunner = new PrintLayerTaskRunner(task, movementExecutor, this.slicerClient, this.printerUsb, this.store);
                await moveAndSliceNextTaskRunner.run(this.cancellationToken);
                break;
            case PrinterTaskType.Wait:
                let waitTaskRunner = new WaitTaskRunner(task);
                await waitTaskRunner.run();
                break;
            case PrinterTaskType.ZeroEncoder:
                let zeroEncoderTaskRunner = new ZeroEncoderTaskRunner(task, this.printerUsb);
                await zeroEncoderTaskRunner.run();
                break;
            case PrinterTaskType.PrintCustomTracks:
                let printCustomTracksTaskRunner = new PrintCustomTracksTaskRunner(task, movementExecutor, this.slicerClient, this.printerUsb, this.store);
                await printCustomTracksTaskRunner.run(this.cancellationToken);
                break;
            case PrinterTaskType.HeatBed:
                let heatBedTaskRunner = new HeatBedTaskRunner(task, movementExecutor);
                await heatBedTaskRunner.run();
                break;
            default:
                throw new Error("Unknown task type");
        }
    }

    cancel() {
        this.canceled = true;
    }
}
