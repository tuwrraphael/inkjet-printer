import { MovementStage } from "../../movement-stage";
import { TaskRunnerSynchronization } from "../../print-tasks/TaskRunnerSynchronization";
import { PrintTaskRunner } from "../../print-tasks/print-task-runner";
import { PrinterUSB } from "../../printer-usb";
import { PrintControlEncoderModeSettings, PrinterSystemState } from "../../proto/compiled";
import { ChangePrinterSystemStateRequest } from "../../proto/compiled";
import { ChangeEncoderModeSettingsRequest, ChangeEncoderPositionRequest } from "../../proto/compiled";
import { CustomTrack, NewModel, Polygon, PolygonType, SlicingStatus, State, StateChanges } from "../../state/State";
import { Store } from "../../state/Store";
import { abortableEventListener } from "../../utils/abortableEventListener";
import template from "./Print.html";
import "./Print.scss";
import "../PrintBedSimulation/PrintBedSimulation";
import { PrintBedClickAction, PrintBedSimulation, PrintBedSimulationTagName } from "../PrintBedSimulation/PrintBedSimulation";
import { ModelAdded } from "../../state/actions/ModelAdded";
import { parseSvgFile } from "../../utils/parseSvgFile";
import { svgToModel } from "../../utils/svgToModel";
import { ChangePrintMemoryRequest } from "../../proto/compiled";
import { PrinterProgram, PrinterTaskType, PrinterTasks } from "../../print-tasks/printer-program";
import "../PrintOptions/PrintOptions";
import "../ModelList/ModelList";
import "../ModelParams/ModelParams";
import "../PrintBedViewStateControl/PrintBedViewStateControl";

import bwipjs from 'bwip-js';
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
import { OutputFolderChanged } from "../../state/actions/OutputFolderChanged";
import { CameraAccess } from "../../camera-access";
import { CameraType } from "../../CameraType";
import { getMicroscopeFeasibleRange } from "../../utils/getMicroscopeFeasibleRange";
import { printBedPositionToMicroscope } from "../../utils/printBedPositionToMicroscope";

let cameraOffset = {
    x: 165.4 - 13.14,
    y: 38.78 - 23.89,
    z: 23.35
};

let lowestZoomCameraOffset = {
    x: 161.2 - 13.81,
    y: 13.3 - 5.41,
    z: 36
};

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
    private moveAxisPos: HTMLSpanElement;
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
            const PrintEncoderProgram: PrinterProgram = {
                tasks: this.generateEncoderProgramSteps()
            };
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
            encoderModeSettings.fireEveryTicks = this.store.state.printState.printingParams.fireEveryTicks;
            encoderModeSettings.printFirstLineAfterEncoderTick = this.store.state.printState.slicingState.currentRasterization[0].result.track.printFirstLineAfterEncoderTick
            encoderModeSettings.sequentialFires = this.store.state.printState.printingParams.sequentialFires;
            encoderModeSettings.startPaused = false;
            encoderModeSettings.linesToPrint = this.store.state.printState.slicingState.currentRasterization[0].result.track.linesToPrint;
            changeEncoderModeSettingsRequest.encoderModeSettings = encoderModeSettings;
            await this.printerUsb.sendChangeEncoderModeSettingsRequest(changeEncoderModeSettingsRequest);
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
        abortableEventListener(this.querySelector("#move-camera-nozzle0"), "click", async (ev) => {
            ev.preventDefault();
            let cameraOffset = this.store.state.printState.printerParams.printBedToCamera;
            let movementRange = this.store.state.printState.printerParams.movementRange;
            let pos = printBedPositionToMicroscope({ x: 0, y: 0 }, 0, cameraOffset, movementRange);
            using movementExecutor = this.movementStage.getMovementExecutor("print");
            await movementExecutor.moveAbsoluteAndWait(pos.microscopePos.x, pos.microscopePos.y, pos.microscopePos.z, 2000);
        }, this.abortController.signal);
        // abortableEventListener(this.querySelector("#move-stage-to"), "click", async (ev) => {
        //     ev.preventDefault();
        //     await this.movementStage.movementExecutor.moveAbsoluteXAndWait(this.store.state.printState.slicingState.moveAxisPos, 1000);
        // }, this.abortController.signal);
        abortableEventListener(this.querySelector("#test-set-voltage"), "click", async (ev) => {
            ev.preventDefault();
            let request = new ChangeWaveformControlSettingsRequest();
            let settings = new WavefromControlSettings();
            request.settings = settings;
            settings.voltageMv = 35.6 * 1000;
            await this.printerUsb.sendChangeWaveformControlSettingsRequestAndWait(request);
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#write-data"), "click", async (ev) => {
            ev.preventDefault();
            if (this.store.state.printState.slicingState.currentRasterization[0].result.track == null) {
                console.error("No track data to write");
                return;
            }
            let data = this.store.state.printState.slicingState.currentRasterization[0].result.track.data;
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
        abortableEventListener(this.querySelector("#nozzle-priming"), "click", async (ev) => {
            ev.preventDefault();
            await this.printerUsb.sendNozzlePrimingRequestAndWait();
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#select-output-folder"), "click", async (ev) => {
            ev.preventDefault();
            try {
                let outputFolder = await window.showDirectoryPicker({
                    mode: "readwrite",
                    startIn: "documents"
                });
                this.store.postAction(new OutputFolderChanged(outputFolder));
                // let c = CameraAccess.getInstance(CameraType.Microscope);
                // await c.performAutoFocus(0.5, 0.5);
                // await CameraAccess.getInstance(CameraType.Microscope).saveImage("test");

            } catch (e) {
                console.error(e);
            }
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#generate-voltage-test"), "click", async (ev) => {
            ev.preventDefault();
            let from = 35.6;
            let to = 28;
            let step = 0.3;
            let position = {
                x: 2,
                y: 12
            };
            let nr = 0;
            for (let v = from; v > to; v -= step) {
                let voltage = Math.round(v * 100) / 100;
                let modelPosition = {
                    x: (nr % 3) * 10 + position.x,
                    y: Math.floor(nr / 3) * 5 + position.y
                };
                let id = `square-${nr}V`;
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
                let photoPoint = {
                    x : modelPosition.x+1.5,
                    y : modelPosition.y+1.5
                };
                this.store.postAction(new ModelAdded(model));
                this.store.postAction(new ModelParamsChanged(id, {
                    modelGroupId: group,
                    position: [modelPosition.x, modelPosition.y]
                }));
                this.store.postAction(new ModelGroupParamsChanged(group, {
                    waveform: {
                        voltage: voltage
                    },
                    photoPoints: [photoPoint]
                }));
                nr++;
            }
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#test-nozzle-pattern"), "click", async (ev) => {
            ev.preventDefault();
            let moveAxisPos = 10;
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
        abortableEventListener(this.querySelector("#test-code"), "click", async (ev) => {
            ev.preventDefault();
            let code: any = bwipjs.raw("qrcode", "30x30 square 50 layers 60°C 28V 144 dpi skip_n 0 offset 3", {});
            const dotsPerPixel = 16;
            const dpMM = 1 / getNozzleDistance(this.store.state.printState.printerParams).x;
            const pixelWidth = Math.sqrt(dotsPerPixel) * 1 / dpMM;
            let polygons: Polygon[] = [];
            for (let i = 0; i < code[0].pixx; i++) {
                for (let j = 0; j < code[0].pixy; j++) {
                    if (code[0].pixs[j * code[0].pixx + i] == 1) {
                        polygons.push({
                            points: [
                                [i * pixelWidth, j * pixelWidth],
                                [(i + 1) * pixelWidth, j * pixelWidth],
                                [(i + 1) * pixelWidth, (j + 1) * pixelWidth],
                                [i * pixelWidth, (j + 1) * pixelWidth]
                            ],
                            type: PolygonType.Contour
                        });
                    }
                }
            }
            let model: NewModel = {
                fileName: "test",
                layers: [
                    {
                        polygons: polygons
                    }
                ]
            };
            let bb = getModelBoundingBox(model);
            model.layers = model.layers.map(l => {
                return {
                    ...l,
                    polygons: l.polygons.map(p => {
                        return {
                            ...p,
                            points: mirrorY(p.points, bb)
                        };
                    })
                };
            });
            let duplicateLayers = 19;
            for (let i = 0; i < duplicateLayers; i++) {
                model.layers = [...model.layers, model.layers[0]];
            }
            this.store.postAction(new ModelAdded(model));
        }, this.abortController.signal);
        this.update(this.store.state, Object.keys(this.store.state || {}) as StateChanges);
    }

    private generateEncoderProgramSteps() {
        let height = this.store.state.printState.printingParams.firstLayerHeight;
        let steps: PrinterTasks[] = [
            {
                type: PrinterTaskType.HeatBed,
                temperature: this.store.state.printState.printingParams.bedTemperature
            },
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
                        x: 175,
                        y: 0,
                        z: 25
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
        if (c.includes("programRunnerState")) {
            this.programRunnerState.textContent = JSON.stringify(s.programRunnerState, null, 2);
        }
        if (c.includes("currentProgram")) {
            // this.currentProgram.textContent = JSON.stringify(s.currentProgram, null, 2);
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
