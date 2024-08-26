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

export class PrintComponent extends HTMLElement {

    private rendered = false;
    private abortController: AbortController;
    private store: Store;
    private printerUsb: PrinterUSB;
    private movementStage: MovementStage;
    private printBedSimulation: PrintBedSimulation;
    private slicingInProgress: HTMLSpanElement;
    private startPrintBtn: HTMLButtonElement;
    private cancelPrintBtn: HTMLButtonElement;
    private pausePrintBtn: HTMLButtonElement;
    private taskRunnerSynchronization: TaskRunnerSynchronization;
    private insertSpecialDialog: HTMLDialogElement;
    constructor() {
        super();
        this.store = Store.getInstance();
        this.printerUsb = PrinterUSB.getInstance();
        this.movementStage = MovementStage.getInstance();
        this.taskRunnerSynchronization = TaskRunnerSynchronization.getInstance();
    }

    connectedCallback() {
        this.abortController = new AbortController();
        this.store.subscribe((s, c) => this.update(s, c), this.abortController.signal);
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
            this.printBedSimulation = this.querySelector(PrintBedSimulationTagName);
            this.slicingInProgress = this.querySelector("#slicing-in-progress");
            this.startPrintBtn = this.querySelector("#start-print");
            this.cancelPrintBtn = this.querySelector("#cancel-print");
            this.pausePrintBtn = this.querySelector("#pause-print");
            this.insertSpecialDialog = this.querySelector("#insert-special-dialog");
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
            if (this.store.state.programRunnerState.state === PrinterProgramState.Paused) {
                this.taskRunnerSynchronization.continueAll();
            } else {
                const PrintEncoderProgram: PrinterProgram = {
                    tasks: this.generateEncoderProgramSteps()
                };
                this.taskRunnerSynchronization.startTaskRunner(new PrintTaskRunner(PrintEncoderProgram));
            }
        }, this.abortController.signal);
        abortableEventListener(this.cancelPrintBtn, "click", async (ev) => {
            ev.preventDefault();
            this.taskRunnerSynchronization.cancelAll();
        }, this.abortController.signal);
        abortableEventListener(this.pausePrintBtn, "click", async (ev) => {
            ev.preventDefault();
            this.taskRunnerSynchronization.pauseAll();
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
                    modelGroup: null,
                    evenOddView: false,
                } : {
                    mode: "rasterization",
                    trackIncrement: 0,
                    modelGroup: this.store.state.printBedViewState.viewMode.modelGroup,
                    evenOddView: this.store.state.printBedViewState.viewMode.evenOddView,
                }
            }));
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#slice-next-track"), "click", async (ev) => {
            ev.preventDefault();
            this.store.postAction(new PrintBedViewStateChanged({
                viewMode: this.store.state.printBedViewState.viewMode.mode != "rasterization" ? {
                    mode: "rasterization",
                    trackIncrement: 0,
                    modelGroup: null,
                    evenOddView: false,
                } : {
                    mode: "rasterization",
                    trackIncrement: this.store.state.printBedViewState.viewMode.trackIncrement + 1,
                    modelGroup: this.store.state.printBedViewState.viewMode.modelGroup,
                    evenOddView: this.store.state.printBedViewState.viewMode.evenOddView,
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
        abortableEventListener(this.querySelector("#start-nozzle-test"), "click", async (ev) => {
            ev.preventDefault();
            let steps: PrinterTasks[] = [
                {
                    type: PrinterTaskType.Home,
                },
                {
                    type: PrinterTaskType.CheckNozzles,
                    layerNr: -1,
                    nozzleTestSurfaceHeight: 1,
                    startNozzle: 0,
                    safeTravelHeight: 10
                },
                {
                    type: PrinterTaskType.CheckNozzles,
                    layerNr: -1,
                    nozzleTestSurfaceHeight: 1,
                    startNozzle: 8,
                    safeTravelHeight: 10
                },
                {
                    type: PrinterTaskType.CheckNozzles,
                    layerNr: -1,
                    nozzleTestSurfaceHeight: 1,
                    startNozzle: 16,
                    safeTravelHeight: 10
                },
                {
                    type: PrinterTaskType.CheckNozzles,
                    layerNr: -1,
                    nozzleTestSurfaceHeight: 1,
                    startNozzle: 24,
                    safeTravelHeight: 10
                },
            ];
            let program: PrinterProgram = {
                tasks: steps
            };
            this.taskRunnerSynchronization.startTaskRunner(new PrintTaskRunner(program));
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
                    let res = getNozzleTestTracks(
                        0,
                        16,
                        5,
                        this.store.state.printState.printerParams,
                        8, 3500, 32);
                    let res2 = getNozzleTestTracks(
                        4,
                        16,
                        5 + 3 * 0.137,
                        this.store.state.printState.printerParams,
                        8, 3570, 32);
                    this.store.postAction(new SetCustomTracks([...res.customTracks, ...res2.customTracks]));
                    break;
                default:
                    break;
            }
        }, this.abortController.signal);

        this.update(this.store.state, Object.keys(this.store.state || {}) as StateChanges);
    }

    private generateEncoderProgramSteps() {
        let height = this.store.state.printState.printingParams.firstLayerHeight;
        let steps: PrinterTasks[] = [
            {
                type: PrinterTaskType.Home,
            },
            {
                type: PrinterTaskType.HeatBed,
                temperature: this.store.state.printState.printingParams.bedTemperature,
                primingPosition: {
                    x: 200,
                    y: 0,
                    z: 40
                }
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
            }
        ];
        let maxLayersModels = this.store.state.models.map(m => m.layers.length).reduce((a, b) => Math.max(a, b), 0);
        console.log(maxLayersModels);
        let maxLayersCustomTracks = this.store.state.printState.customTracks.reduce((a, b) => Math.max(a, b.layer + 1), 0);
        let maxLayers = Math.max(maxLayersModels, maxLayersCustomTracks);
        let printPlan = this.store.state.printState.slicingState.printPlan;
        for (let i = 0; i < maxLayers; i++) {
            steps.push({
                type: PrinterTaskType.Move,
                movement: {
                    x: 0,
                    y: 0,
                    z: height
                },
                feedRate: 10000
            });
            steps.push({
                type: PrinterTaskType.SetTargetPressure,
                targetPressure: -2
            });
            // steps.push({
            //     type: PrinterTaskType.PrimeNozzle
            // });
            let layerPlan = printPlan?.layers[i];
            if (null != layerPlan) {
                steps.push({
                    type: PrinterTaskType.PrintLayer,
                    layerNr: i,
                    layerPlan: layerPlan,
                    z: height,
                    dryingPosition: {
                        x: 200,
                        y: 0,
                        z: 40
                    }
                });
            }
            let layerCustomTracks = this.store.state.printState.customTracks.filter(t => t.layer == i);
            if (layerCustomTracks.length > 0) {
                steps.push({
                    type: PrinterTaskType.PrintCustomTracks,
                    customTracks: layerCustomTracks,
                    z: height,
                    printingParams: this.store.state.printState.printingParams
                });
            }
            // steps.push({
            //     type: PrinterTaskType.Move,
            //     movement: {
            //         z: 25
            //     },
            //     feedRate: 500
            // });
        }
        if (printPlan && printPlan.layers.length > 0) {
            let x = printPlan.layers[0].modelGroupPlans[0].tracks[0].moveAxisPosition;
            let y = printPlan.layers[0].modelGroupPlans[0].tracks[0].startPrintAxisPosition;
            let pos = printBedPositionToMicroscope({ x: x, y: y }, height, this.store.state.printState.printerParams.printBedToCamera, this.store.state.printState.printerParams.movementRange);
            if (pos.feasible) {
                steps.push({
                    type: PrinterTaskType.Move,
                    movement: {
                        x: pos.microscopePos.x,
                        y: pos.microscopePos.y,
                        z: pos.microscopePos.z
                    },
                    feedRate: 10000
                });
            }
        }
        return steps;

    }


    update(s: State, c: StateChanges): void {
        if (c.includes("currentProgram")) {
            // this.currentProgram.textContent = JSON.stringify(s.currentProgram, null, 2);
            this.startPrintBtn.disabled = s.programRunnerState.state == PrinterProgramState.Running;
            this.cancelPrintBtn.disabled = s.programRunnerState.state == PrinterProgramState.Done || s.programRunnerState.state == PrinterProgramState.Canceled;
            this.pausePrintBtn.disabled = s.programRunnerState.state != PrinterProgramState.Running;
            this.startPrintBtn.innerText = s.programRunnerState.state == PrinterProgramState.Running ? "Pause" : "Start Print";
        }
        if (c.includes("printState")) {
            this.slicingInProgress.style.display = s.printState.slicingState.slicingStatus == SlicingStatus.InProgress ? "" : "none";
            // this.moveAxisPos.innerText = "" + s.printBedViewState.;
        }
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const PrintTagName = "app-print";
customElements.define(PrintTagName, PrintComponent);
