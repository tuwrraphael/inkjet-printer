import { MovementStage } from "../../movement-stage";
import { TaskRunnerSynchronization } from "../../print-tasks/TaskRunnerSynchronization";
import { PrintEncoderProgram } from "../../print-tasks/default-programs";
import { PrintTaskRunner } from "../../print-tasks/print-task-runner";
import { PrinterUSB } from "../../printer-usb";
import { PrintControlEncoderModeSettings, PrinterSystemState } from "../../proto/compiled";
import { ChangePrinterSystemStateRequest } from "../../proto/compiled";
import { ChangeEncoderModeSettingsRequest, ChangeEncoderPositionRequest } from "../../proto/compiled";
import { SlicingStatus, State, StateChanges } from "../../state/State";
import { Store } from "../../state/Store";
import { abortableEventListener } from "../../utils/abortableEventListener";
import template from "./Print.html";
import "./Print.scss";
import "../PrintBedSimulation/PrintBedSimulation";
import { PrintBedSimulation, PrintBedSimulationTagName } from "../PrintBedSimulation/PrintBedSimulation";
import { ModelAdded } from "../../state/actions/ModelAdded";
import { parseSvgFile } from "../../utils/parseSvgFile";
import { svgToModel } from "../../utils/svgToModel";
import { SlicePositionChanged } from "../../state/actions/SlicePositionChanged";
import { SlicePositionIncrement } from "../../state/actions/SlicePositionIncrement";
import { ChangePrintMemoryRequest } from "../../proto/compiled";

export class PrintComponent extends HTMLElement {

    private rendered = false;
    private abortController: AbortController;
    private store: Store;
    private programRunnerState: HTMLPreElement;
    private currentProgram: HTMLPreElement;
    private printerUsb: PrinterUSB;
    private movementStage: MovementStage;
    private printBedSimulation: PrintBedSimulation;
    private slicingInProgress: HTMLSpanElement;
    private moveAxisPos: HTMLInputElement;
    constructor() {
        super();
        this.store = Store.getInstance();
        this.printerUsb = PrinterUSB.getInstance();
        this.movementStage = MovementStage.getInstance();
    }

    connectedCallback() {
        this.abortController = new AbortController();
        this.store.subscribe((s, c) => this.update(s, c), this.abortController.signal);
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
            this.printBedSimulation = this.querySelector(PrintBedSimulationTagName);
            this.slicingInProgress = this.querySelector("#slicing-in-progress");
            this.moveAxisPos = this.querySelector("#move-axis-pos");
        }
        abortableEventListener(this.printBedSimulation, "drop", async (ev) => {
            ev.preventDefault();
            let files = ev.dataTransfer.files;
            if (files.length > 0) {
                let file: File = files[0];
                let parsed = svgToModel(await parseSvgFile(file));
                this.store.postAction(new ModelAdded({
                    fileName: file.name,
                    layers: parsed.layers
                }));
            }
        }, this.abortController.signal);
        abortableEventListener(this.printBedSimulation, "dragover", (ev) => {
            ev.preventDefault();
        }, this.abortController.signal);
        this.programRunnerState = document.querySelector("#program-runner-state");
        this.currentProgram = document.querySelector("#current-program");
        abortableEventListener(this.querySelector("#start-print"), "click", async (ev) => {
            ev.preventDefault();
            TaskRunnerSynchronization.getInstance().startTaskRunner(new PrintTaskRunner(PrintEncoderProgram));
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#cancel-print"), "click", async (ev) => {
            ev.preventDefault();
            TaskRunnerSynchronization.getInstance().cancelAll();
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#zero-encoder"), "click", async (ev) => {
            ev.preventDefault();
            let changeEncoderPositionRequest = new ChangeEncoderPositionRequest();
            changeEncoderPositionRequest.position = 0;
            await this.printerUsb.sendChangeEncoderPositionRequest(changeEncoderPositionRequest);
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#reset-encoder"), "click", async (ev) => {
            ev.preventDefault();
            let changeEncoderModeSettingsRequest = new ChangeEncoderModeSettingsRequest();
            let encoderModeSettings = new PrintControlEncoderModeSettings();
            encoderModeSettings.fireEveryTicks = 4;
            encoderModeSettings.printFirstLineAfterEncoderTick = 100;
            encoderModeSettings.sequentialFires = 1;
            changeEncoderModeSettingsRequest.encoderModeSettings = encoderModeSettings;
            await this.printerUsb.sendChangeEncoderModeSettingsRequest(changeEncoderModeSettingsRequest);
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#enter-print"), "click", async (ev) => {
            ev.preventDefault();
            let changePrinterSystemStateRequest = new ChangePrinterSystemStateRequest();
            changePrinterSystemStateRequest.state = PrinterSystemState.PrinterSystemState_PRINT;
            await this.printerUsb.sendChangeSystemStateRequest(changePrinterSystemStateRequest);
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#home"), "click", async (ev) => {
            ev.preventDefault();
            await this.movementStage.movementExecutor.home();
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#go-start"), "click", async (ev) => {
            ev.preventDefault();
            await this.movementStage.sendGcodeAndWaitForFinished("G0 Y175 F400");
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#go-end"), "click", async (ev) => {
            ev.preventDefault();
            await this.movementStage.sendGcodeAndWaitForFinished("G1 Y0 F400");
        }, this.abortController.signal);
        abortableEventListener(this.moveAxisPos, "change", async (ev) => {
            ev.preventDefault();
            let moveAxisPos = parseInt(this.moveAxisPos.value);
            this.store.postAction(new SlicePositionChanged(moveAxisPos));
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#slice-next-track"), "click", async (ev) => {
            ev.preventDefault();
            this.store.postAction(new SlicePositionIncrement(1));
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#move-stage-to"), "click", async (ev) => {
            ev.preventDefault();
            this.movementStage.movementExecutor.moveRelativeAndWait(this.store.state.printState.slicingState.moveAxisPos, 0, 0, 400);
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#sync-from-stage"), "click", async (ev) => {
            ev.preventDefault();
            if (null == this.store.state.movementStageState.pos?.x) {
                return;
            }
            this.store.postAction(new SlicePositionChanged(this.store.state.movementStageState.pos.x));
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#write-data"), "click", async (ev) => {
            ev.preventDefault();
            if (this.store.state.printState.slicingState.track == null) {
                console.error("No track data to write");
                return;
            }
            let data = this.store.state.printState.slicingState.track;
            console.log("Writing track data", data);
            let chunkSize = 8;
            for (let i = 0; i < data.length; i += chunkSize) {
                let chunk = data.slice(i, i + chunkSize);
                var printMemoryRequest = new ChangePrintMemoryRequest();
                printMemoryRequest.data = Array.from(chunk);
                printMemoryRequest.offset = i;
                await this.printerUsb.sendChangePrintMemoryRequest(printMemoryRequest);
            }
            console.log("Done writing track data");
        }, this.abortController.signal);
        this.update(this.store.state, Object.keys(this.store.state || {}) as StateChanges);
    }

    update(s: State, c: StateChanges): void {
        if (c.includes("programRunnerState")) {
            this.programRunnerState.textContent = JSON.stringify(s.programRunnerState, null, 2);
        }
        if (c.includes("currentProgram")) {
            this.currentProgram.textContent = JSON.stringify(s.currentProgram, null, 2);
        }
        if (c.includes("printState")) {
            this.slicingInProgress.style.display = s.printState.slicingState.slicingStatus == SlicingStatus.InProgress ? "" : "none";
            this.moveAxisPos.value = "" + s.printState.slicingState.moveAxisPos;
        }
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const PrintTagName = "app-print";
customElements.define(PrintTagName, PrintComponent);
