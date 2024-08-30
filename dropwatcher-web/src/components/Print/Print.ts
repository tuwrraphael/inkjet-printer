import { MovementStage } from "../../movement-stage";
import { TaskRunnerSynchronization } from "../../print-tasks/TaskRunnerSynchronization";
import { PrintTaskRunner } from "../../print-tasks/print-task-runner";
import { PrinterUSB } from "../../printer-usb";
import { PrinterSystemState } from "../../proto/compiled";
import { ChangePrinterSystemStateRequest } from "../../proto/compiled";
import { CustomTrack, NewModel, PolygonType, SlicingStatus, State, StateChanges } from "../../state/State";
import { Store } from "../../state/Store";
import { abortableEventListener } from "../../utils/abortableEventListener";
import template from "./Print.html";
import "./Print.scss";
import "../PrintBedSimulation/PrintBedSimulation";
import { PrintBedClickAction, PrintBedSimulation, PrintBedSimulationTagName } from "../PrintBedSimulation/PrintBedSimulation";
import { ModelAdded } from "../../state/actions/ModelAdded";
import { parseSvgFile } from "../../utils/parseSvgFile";
import { svgToModel } from "../../utils/svgToModel";
import { PrinterProgram, PrinterProgramState, PrinterTaskType, PrinterTasks } from "../../print-tasks/printer-program";
import "../PrintOptions/PrintOptions";
import "../ModelList/ModelList";
import "../ModelParams/ModelParams";
import "../PrintBedViewStateControl/PrintBedViewStateControl";

import { getNozzleDistance } from "../../slicer/getNozzleDistance";
import { getModelBoundingBox } from "../../utils/getModelBoundingBox";
import { mirrorY } from "../../utils/mirrorY";
import { TrackRasterization } from "../../slicer/TrackRasterization";
import { SetCustomTracks } from "../../state/actions/SetCustomTracks";
import { getPrintheadSwathe } from "../../slicer/getPrintheadSwathe";
import { setNozzleForRow } from "../../slicer/setNozzleDataView";
import { ChangeWaveformControlSettingsRequest } from "../../proto/compiled";
import { WavefromControlSettings } from "../../proto/compiled";
import { PrintBedViewStateChanged } from "../../state/actions/PrintBedViewStateChanged";
import { ModelGroupParamsChanged, ModelParamsChanged } from "../../state/actions/ModelParamsChanged";
import { printBedPositionToMicroscope } from "../../utils/printBedPositionToMicroscope";
import { getNozzleTestTracks } from "../../slicer/getNozzleTestTracks";
import { getCodeModel } from "../../slicer/getCodeModel";
import { getSquareModel } from "../../slicer/getSquareModel";
import { getNozzleTestTasks } from "../../print-tasks/NozzleTestTasks";
import { createPrintProgram } from "../../print-tasks/createPrintProgram";
import { SlicerClient } from "../../slicer/SlicerClient";

export class PrintComponent extends HTMLElement {

    private rendered = false;
    private abortController: AbortController;
    private store: Store;
    private printerUsb: PrinterUSB;
    private movementStage: MovementStage;
    private printBedSimulation: PrintBedSimulation;
    private startPrintBtn: HTMLButtonElement;
    private taskRunnerSynchronization: TaskRunnerSynchronization;
    private insertSpecialDialog: HTMLDialogElement;
    private startPrintDialog: HTMLDialogElement;
    private slicerClient: SlicerClient;

    constructor() {
        super();
        this.store = Store.getInstance();
        this.printerUsb = PrinterUSB.getInstance();
        this.movementStage = MovementStage.getInstance();
        this.taskRunnerSynchronization = TaskRunnerSynchronization.getInstance();
        this.slicerClient = SlicerClient.getInstance();
    }

    connectedCallback() {
        this.abortController = new AbortController();
        this.store.subscribe((s, c) => this.update(s, c), this.abortController.signal);
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
            this.printBedSimulation = this.querySelector(PrintBedSimulationTagName);
            this.startPrintBtn = this.querySelector("#start-print");
            this.insertSpecialDialog = this.querySelector("#insert-special-dialog");
            this.startPrintDialog = this.querySelector("#start-print-dialog");
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
        abortableEventListener(this.startPrintBtn, "click", async (ev) => {
            ev.preventDefault();
            this.startPrintDialog.showModal();
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#enter-print"), "click", async (ev) => {
            ev.preventDefault();
            let changePrinterSystemStateRequest = new ChangePrinterSystemStateRequest();
            changePrinterSystemStateRequest.state = PrinterSystemState.PrinterSystemState_PRINT;
            await this.printerUsb.sendChangeSystemStateRequest(changePrinterSystemStateRequest);
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#enter-idle"), "click", async (ev) => {
            ev.preventDefault();
            let changePrinterSystemStateRequest = new ChangePrinterSystemStateRequest();
            changePrinterSystemStateRequest.state = PrinterSystemState.PrinterSystemState_IDLE;
            await this.printerUsb.sendChangeSystemStateRequest(changePrinterSystemStateRequest);
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#home"), "click", async (ev) => {
            ev.preventDefault();
            using movementExecutor = this.movementStage.getMovementExecutor("print");
            await movementExecutor.home();
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#slice-first-track"), "click", async (ev) => {
            ev.preventDefault();
            this.store.postAction(new PrintBedViewStateChanged({
                viewMode: this.store.state.printBedViewState.viewMode.mode != "rasterization" ? {
                    mode: "rasterization",
                    trackIncrement: 0,
                    modelGroup: null
                } : {
                    mode: "rasterization",
                    trackIncrement: 0,
                    modelGroup: this.store.state.printBedViewState.viewMode.modelGroup
                }
            }));
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#slice-next-track"), "click", async (ev) => {
            ev.preventDefault();
            this.store.postAction(new PrintBedViewStateChanged({
                viewMode: this.store.state.printBedViewState.viewMode.mode != "rasterization" ? {
                    mode: "rasterization",
                    trackIncrement: 0,
                    modelGroup: null
                } : {
                    mode: "rasterization",
                    trackIncrement: this.store.state.printBedViewState.viewMode.trackIncrement + 1,
                    modelGroup: this.store.state.printBedViewState.viewMode.modelGroup
                }
            }));
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#test-set-voltage"), "click", async (ev) => {
            ev.preventDefault();
            let request = new ChangeWaveformControlSettingsRequest();
            let settings = new WavefromControlSettings();
            request.settings = settings;
            settings.voltageMv = 35.6 * 1000;
            settings.clockPeriodNs = 1250;
            await this.printerUsb.sendChangeWaveformControlSettingsRequestAndWait(request);
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#nozzle-priming"), "click", async (ev) => {
            ev.preventDefault();
            await this.printerUsb.sendNozzlePrimingRequestAndWait();
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#generate-voltage-test"), "click", async (ev) => {
            ev.preventDefault();
            let from = 35.6;
            let to = 25;
            let step = 0.5;
            let position = {
                x: 2,
                y: 12
            };
            let nr = 0;
            for (let v = from; v > to; v -= step) {
                let voltage = Math.round(v * 100) / 100;
                let swathe = getPrintheadSwathe(this.store.state.printState.printerParams);
                let modelPosition = {
                    x: (nr % 3) * 10 + position.x,
                    y: Math.floor(nr / 3) * 5 + position.y
                };
                let purgePosition = {
                    x: 0,
                    y: 0
                };
                let id = `square-${nr}`;
                let group = `${voltage}V`;
                let model: NewModel = {
                    layers: [{
                        polygons: [{
                            type: PolygonType.Contour,
                            "points": [
                                [
                                    3,
                                    3
                                ],
                                [
                                    0,
                                    3
                                ],
                                [
                                    0,
                                    0
                                ],
                                [
                                    3,
                                    0
                                ]
                            ]
                        }]
                    }],
                    fileName: `square-${nr}.svg`,
                    id: id
                };
                let purgeModel: NewModel = {
                    layers: [{
                        polygons: [{
                            type: PolygonType.Contour,
                            "points": [
                                [
                                    2 * swathe.x - 1,
                                    10
                                ],
                                [
                                    0,
                                    10
                                ],
                                [
                                    0,
                                    0
                                ],
                                [
                                    2 * swathe.x - 1,
                                    0
                                ]
                            ]
                        }]
                    }],
                    fileName: `purge-${nr}.svg`,
                    id: `purge-${nr}V`
                };
                let photoPoint = {
                    x: modelPosition.x + 1.5,
                    y: modelPosition.y + 1.5
                };
                this.store.postAction(new ModelAdded(model));
                this.store.postAction(new ModelAdded(purgeModel));
                this.store.postAction(new ModelParamsChanged(id, {
                    modelGroupId: group,
                    position: [modelPosition.x, modelPosition.y]
                }));
                this.store.postAction(new ModelParamsChanged(purgeModel.id, {
                    modelGroupId: group,
                    position: [purgePosition.x, purgePosition.y]
                }));
                this.store.postAction(new ModelGroupParamsChanged(group, {
                    waveform: {
                        voltage: voltage,
                        clockFrequency: 1000
                    },
                    photoPoints: [photoPoint]
                }));
                nr++;
            }
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#generate-clock-test"), "click", async (ev) => {
            ev.preventDefault();
            let from = 1500;
            let to = 500;
            let step = 50;
            let position = {
                x: 2,
                y: 12
            };
            let nr = 0;
            for (let v = from; v > to; v -= step) {
                let frequency = v;
                let swathe = getPrintheadSwathe(this.store.state.printState.printerParams);
                let modelPosition = {
                    x: position.x,
                    y: position.y
                };
                let purgePosition = {
                    x: 0,
                    y: 0
                };
                let id = `square-${nr}`;
                let group = `${frequency}kHz`;
                let model: NewModel = {
                    layers: [{
                        polygons: [{
                            type: PolygonType.Contour,
                            "points": [
                                [
                                    swathe.x,
                                    swathe.x
                                ],
                                [
                                    0,
                                    swathe.x
                                ],
                                [
                                    0,
                                    0
                                ],
                                [
                                    swathe.x,
                                    0
                                ]
                            ]
                        }]
                    }],
                    fileName: `square-${nr}.svg`,
                    id: id
                };
                let photoPoint = {
                    x: modelPosition.x + 1.5,
                    y: modelPosition.y + 1.5
                };
                this.store.postAction(new ModelAdded(model));
                // this.store.postAction(new ModelAdded(purgeModel));
                this.store.postAction(new ModelParamsChanged(id, {
                    modelGroupId: group,
                    position: [modelPosition.x, modelPosition.y]
                }));
                // this.store.postAction(new ModelParamsChanged(purgeModel.id, {
                //     modelGroupId: group,
                //     position: [purgePosition.x, purgePosition.y]
                // }));
                this.store.postAction(new ModelGroupParamsChanged(group, {
                    waveform: {
                        voltage: 35.6,
                        clockFrequency: v
                    },
                    photoPoints: [photoPoint]
                }));
                nr++;
            }

        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#test-nozzle-pattern"), "click", async (ev) => {
            ev.preventDefault();
            let moveAxisPos = 50;
            let blockSpacing = 20;
            let spacing = 32;
            let tracks: CustomTrack[] = [];
            let boxHeightMM = 2;
            let rows = Math.ceil(boxHeightMM * this.store.state.printState.printerParams.encoder.printAxis.dpi / (this.store.state.printState.printingParams.fireEveryTicks * 25.4));
            let spacingMM = 4;
            let spacingRows = Math.ceil(spacingMM * this.store.state.printState.printerParams.encoder.printAxis.dpi / (this.store.state.printState.printingParams.fireEveryTicks * 25.4));
            let startEncoderTick = 100;
            let blocks = 2;
            let groups = 128 / (128 / spacing) / blocks;
            let linesToPrint = groups * (rows + spacingRows);
            let colSpacing = 0.1;
            let numColumns = 16;



            for (let block = 0; block < blocks; block++) {
                let blockOffset = spacing / blocks * block;

                let currentRow = 0;
                let r: TrackRasterization = {
                    data: new Uint32Array(linesToPrint * 4),
                    linesToPrint: linesToPrint,
                    printFirstLineAfterEncoderTick: startEncoderTick,
                    endPrintAxisPosition: 150,
                    startPrintAxisPosition: 0,
                    printLastLineAfterEncoderTick: this.store.state.printState.printingParams.fireEveryTicks * (linesToPrint - 1) + startEncoderTick,
                };
                r.data.fill(0)

                for (let startNozzle = blockOffset; startNozzle < spacing; startNozzle += 1) {
                    console.log(startNozzle);
                    for (let nozzle = startNozzle; nozzle < 128; nozzle += spacing) {

                        for (let row = 0; row < rows; row++) {
                            setNozzleForRow(nozzle, true, r.data, currentRow + row);
                        }
                    }
                    currentRow += spacingRows + rows;
                }
                for (let i = 0; i < numColumns; i++) {
                    tracks.push({ layer: 0, track: r, moveAxisPos: moveAxisPos + i * colSpacing + block * blockSpacing });
                }

            }
            console.log(tracks);
            this.store.postAction(new SetCustomTracks(tracks));

            // let startEncoderTick = 100;

            let nozzleDistance = getNozzleDistance(this.store.state.printState.printerParams);

            // let spacing = 16;
            // let groups = this.store.state.printState.printerParams.numNozzles / (this.store.state.printState.printerParams.numNozzles / spacing);

            // let rows = 8;
            // let spacingRows = 3 * rows;

            // let colSpacing = 0.1;
            // let numColumns = 8;

            let boxWidth = (numColumns - 1) * colSpacing;
            let boxHeight = (rows - 1) * this.store.state.printState.printingParams.fireEveryTicks * 25.4 / this.store.state.printState.printerParams.encoder.printAxis.dpi;

            let boxPadding = 0.2;

            let boxes: {
                x: number,
                y: number,
                width: number,
                height: number,
                textPos: { x: number, y: number },
                text: string
            }[] = [];

            for (let nozzle = 0; nozzle < this.store.state.printState.printerParams.numNozzles; nozzle++) {

                let inBlock = Math.floor(((blocks * nozzle) / spacing)) % blocks;


                let nozzleX = moveAxisPos + ((this.store.state.printState.printerParams.numNozzles - 1) - nozzle) * nozzleDistance.x;
                let nozzleYEncoderTick = startEncoderTick + nozzle % (spacing / blocks) * (rows + spacingRows) * this.store.state.printState.printingParams.fireEveryTicks;
                let nozzleYBase = nozzleYEncoderTick * 25.4 / this.store.state.printState.printerParams.encoder.printAxis.dpi;
                let nozzleY = nozzleYBase + ((this.store.state.printState.printerParams.numNozzles - 1) - nozzle) * nozzleDistance.y;
                let pos = { x: nozzleX - boxPadding, y: nozzleY + boxHeight + boxPadding };
                let textPos = { x: nozzleX - boxPadding + inBlock * blockSpacing, y: nozzleY - 2.5 };
                boxes.push({
                    x: pos.x + inBlock * blockSpacing,
                    y: pos.y,
                    width: boxWidth + 2 * boxPadding,
                    height: boxHeight + 2 * boxPadding,
                    textPos: textPos,
                    text: nozzle.toString()
                });





                // svg += `<rect x="${pos.x}" y="${pos.y}" width="${(boxWidth + 2 * boxPadding)}" height="${(boxHeight + 2 * boxPadding)}" fill="fuchsia" stroke="black" stroke-width="0.1"/>`;
                // svg += `<text x="${textPos.x}" y="${textPos.y}" font-family="Arial" font-size="12" fill="black">${nozzle}</text>`;
            }
            console.log(boxes);

            let svgPadding = 10;
            let maxY = boxes.reduce((acc, b) => Math.max(acc, b.y + b.height), 0);
            let maxX = boxes.reduce((acc, b) => Math.max(acc, b.x + b.width), 0);
            let svgWidth = maxX + 10;
            let svgHeight = maxY + 10;

            let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}mm" height="${svgHeight}mm" viewBox="0 0 ${svgWidth} ${svgHeight}">`;
            svg += `<rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" fill="black"/>`;
            for (let box of boxes) {
                svg += `<rect x="${box.x + svgPadding / 2}" y="${maxY - box.y + svgPadding / 2}" width="${box.width}" height="${box.height}" fill="black" stroke="white" stroke-width="0.1"/>`;
                svg += `<text x="${box.textPos.x + svgPadding / 2}" y="${maxY - box.textPos.y + svgPadding / 2}" font-family="Arial" font-size="2" fill="white">${box.text}</text>`;
            }
            svg += "</svg>";
            const svgBlob = new Blob([svg], { type: "image/svg+xml" });
            const svgUrl = URL.createObjectURL(svgBlob);
            const link = document.createElement("a");
            link.href = svgUrl;
            link.download = "test.svg";
            link.click();

        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#place-photo-point"), "click", async (ev) => {
            ev.preventDefault();
            (this.querySelector(PrintBedSimulationTagName) as PrintBedSimulation).setClickAction(PrintBedClickAction.PlacePhotoPoint);
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#move-camera-to"), "click", async (ev) => {
            ev.preventDefault();
            (this.querySelector(PrintBedSimulationTagName) as PrintBedSimulation).setClickAction(PrintBedClickAction.MoveCamera);
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#insert-special"), "click", async (ev) => {
            ev.preventDefault();
            this.insertSpecialDialog.showModal();
        }, this.abortController.signal);
        abortableEventListener(this.insertSpecialDialog.querySelector("form"), "submit", async (ev) => {
            let formData = new FormData(this.insertSpecialDialog.querySelector("form"));
            let model = formData.get("special-model") as string;
            switch (model) {
                case "none":
                    break;
                case "test-code":
                    let model = getCodeModel(this.store.state.printState.printerParams);
                    this.store.postAction(new ModelAdded(model));
                    break;
                case "test-nozzle-pattern2":
                    let moveAxisPos = 5;
                    let stride = 32;
                    let fireEveryTicks = 6;
                    let numNozzles = 16;
                    let res = getNozzleTestTracks(
                        0,
                        numNozzles,
                        moveAxisPos,
                        this.store.state.printState.printerParams,
                        fireEveryTicks, 3200, stride, 10);
                    let offsetSecondBlock = this.store.state.printState.printerParams.numNozzles / stride;
                    let offsetTicks = 70;
                    let res2 = getNozzleTestTracks(
                        0 + offsetSecondBlock,
                        numNozzles,
                        moveAxisPos + (offsetSecondBlock - 1) * this.store.state.printState.printerParams.printheadSwathePerpendicular / (this.store.state.printState.printerParams.numNozzles - 1),
                        this.store.state.printState.printerParams,
                        fireEveryTicks, 3200, stride, 22);
                    this.store.postAction(new SetCustomTracks(res.customTracks.concat(res2.customTracks)));
                    break;
                case "8x8square":
                    let square = getSquareModel(8, 10);
                    this.store.postAction(new ModelAdded(square));
                    break;
                default:
                    break;
            }
        }, this.abortController.signal);
        abortableEventListener(this.startPrintDialog.querySelector("form"), "submit", async (ev) => {
            if (this.startPrintDialog.querySelector("form").checkValidity()) {
                let formData = new FormData(this.startPrintDialog.querySelector("form"));
                let startAtLayer = parseInt(formData.get("start-at-layer") as string);
                let home = formData.get("home-on-start") == "on";
                let nozzleTestBeforeFirstLayer = formData.get("nozzle-test-first-layer") == "on";
                let nozzleTestEveryNLayer = parseInt(formData.get("nozzle-test-after-layers") as string);
                let printPlan = await this.slicerClient.slicer.getPrintPlan();
                let program = createPrintProgram(
                    this.store.state.printState.printingParams,
                    this.store.state.printState.printerParams,
                    this.store.state.printState.customTracks,
                    printPlan,
                    {
                        startAtLayer: startAtLayer,
                        home: home,
                        nozzleTestBeforeFirstLayer: nozzleTestBeforeFirstLayer,
                        nozzleTestEveryNLayer: nozzleTestEveryNLayer
                    }
                )
                if (this.store.state.programRunnerState.state !== PrinterProgramState.Paused &&
                    this.store.state.programRunnerState.state !== PrinterProgramState.Running) {
                    this.taskRunnerSynchronization.startTaskRunner(new PrintTaskRunner(program));
                }
            } else {
                return;
            }
        }, this.abortController.signal);

        this.update(this.store.state, Object.keys(this.store.state || {}) as StateChanges);
    }

    update(s: State, c: StateChanges): void {
        if (c.includes("currentProgram")) {
            this.startPrintBtn.disabled = s.programRunnerState.state == PrinterProgramState.Paused || s.programRunnerState.state == PrinterProgramState.Running;
        }
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const PrintTagName = "app-print";
customElements.define(PrintTagName, PrintComponent);
