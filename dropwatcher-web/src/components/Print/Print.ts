import { MovementStage } from "../../movement-stage";
import { TaskRunnerSynchronization } from "../../print-tasks/TaskRunnerSynchronization";
import {  HomeProgram, MoveTestProgram, PrintEncoderProgram } from "../../print-tasks/default-programs";
import { PrintTaskRunner } from "../../print-tasks/print-task-runner";
import { PrinterUSB } from "../../printer-usb";
import { PrintControlEncoderModeSettings, PrinterSystemState } from "../../proto/compiled";
import { ChangePrinterSystemStateRequest } from "../../proto/compiled";
import { ChangeEncoderModeSettingsRequest, ChangeEncoderPositionRequest } from "../../proto/compiled";
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
    private printerUsb: PrinterUSB;
    private movementStage: MovementStage;
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
