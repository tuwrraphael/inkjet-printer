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
import { PrintBedSimulation, PrintBedSimulationTagName } from "../PrintBedSimulation/PrintBedSimulation";
import { ModelAdded } from "../../state/actions/ModelAdded";
import { parseSvgFile } from "../../utils/parseSvgFile";
import { svgToModel } from "../../utils/svgToModel";
import { SlicePositionChanged } from "../../state/actions/SlicePositionChanged";
import { SlicePositionIncrement } from "../../state/actions/SlicePositionIncrement";
import { ChangePrintMemoryRequest } from "../../proto/compiled";
import { PrinterProgram, PrinterTaskType, PrinterTasks } from "../../print-tasks/printer-program";
import "../PrintOptions/PrintOptions";
import "../ModelList/ModelList";
import "../ModelParams/ModelParams";

import bwipjs from 'bwip-js';
import { getNozzleDistance } from "../../slicer/getNozzleDistance";
import { getModelBoundingBox } from "../../utils/getModelBoundingBox";
import { mirrorY } from "../../utils/mirrorY";
import { TrackRasterization } from "../../slicer/TrackRasterization";
import { SetCustomTracks } from "../../state/actions/SetCustomTracks";
import { getPrintheadSwathe } from "../../slicer/getPrintheadSwathe";
import { start } from "repl";
import { setNozzleForRow } from "../../slicer/setNozzleDataView";
import { ChangeWaveformControlSettingsRequest } from "../../proto/compiled";
import { WavefromControlSettings } from "../../proto/compiled";

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
            encoderModeSettings.printFirstLineAfterEncoderTick = this.store.state.printState.slicingState.track.printFirstLineAfterEncoderTick
            encoderModeSettings.sequentialFires = this.store.state.printState.printingParams.sequentialFires;
            encoderModeSettings.startPaused = false;
            encoderModeSettings.linesToPrint = this.store.state.printState.slicingState.track.linesToPrint;
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
            await this.movementStage.movementExecutor.home();
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#go-start"), "click", async (ev) => {
            ev.preventDefault();
            await this.movementStage.sendGcodeAndWaitForFinished("G0 Y175 F4000");
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#go-end"), "click", async (ev) => {
            ev.preventDefault();
            await this.movementStage.sendGcodeAndWaitForFinished("G1 Y0 F4000");
        }, this.abortController.signal);
        abortableEventListener(this.moveAxisPos, "change", async (ev) => {
            ev.preventDefault();
            let moveAxisPos = parseInt(this.moveAxisPos.value);
            this.store.postAction(new SlicePositionChanged(moveAxisPos));
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#slice-first-track"), "click", async (ev) => {
            ev.preventDefault();
            console.log(this.store.state.printState.slicingState.currentLayerPlan);
            this.store.postAction(new SlicePositionChanged(this.store.state.printState.slicingState.currentLayerPlan.tracks[0].startMoveAxisPosition || 0));
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#slice-next-track"), "click", async (ev) => {
            ev.preventDefault();
            this.store.postAction(new SlicePositionIncrement(1));
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#move-stage-to"), "click", async (ev) => {
            ev.preventDefault();
            await this.movementStage.movementExecutor.moveAbsoluteXAndWait(this.store.state.printState.slicingState.moveAxisPos, 1000);
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#sync-from-stage"), "click", async (ev) => {
            ev.preventDefault();
            if (null == this.store.state.movementStageState.pos?.x) {
                return;
            }
            this.store.postAction(new SlicePositionChanged(this.store.state.movementStageState.pos.x));
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#test-set-voltage"), "click", async (ev) => {
            ev.preventDefault();
            let request = new ChangeWaveformControlSettingsRequest();
            let settings = new WavefromControlSettings();
            request.settings = settings;
            settings.voltage = 34.8 * 1000;
            await this.printerUsb.sendChangeWaveformControlSettingsRequest(request);
        }, this.abortController.signal);
        abortableEventListener(this.querySelector("#write-data"), "click", async (ev) => {
            ev.preventDefault();
            if (this.store.state.printState.slicingState.track == null) {
                console.error("No track data to write");
                return;
            }
            let data = this.store.state.printState.slicingState.track.data;
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
            await this.printerUsb.sendNozzlePrimingRequest();
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
        abortableEventListener(this.querySelector("#test-code"), "click", async (ev) => {
            ev.preventDefault();
            let code: any = bwipjs.raw("qrcode", "Hello World!", {});
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
            let duplicateLayers = 2;
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
                temperature: 45
            },
            {
                type: PrinterTaskType.Home,
            },
            {
                type: PrinterTaskType.Move,
                movement: {
                    x: 0,
                    y: this.store.state.printState.printerParams.buildPlate.height,
                    z: height
                },
                feedRate: 10000
            },
            {
                type: PrinterTaskType.PrimeNozzle
            },
            {
                type: PrinterTaskType.Wait,
                durationMs: 5000
            },
            {
                type: PrinterTaskType.Move,
                movement: {
                    x: 0, y: 0, z: height
                },
                feedRate: 10000
            },
            {
                type: PrinterTaskType.ZeroEncoder
            }
        ];
        let maxLayersModels = this.store.state.models.map(m => m.layers.length).reduce((a, b) => Math.max(a, b), 0);
        console.log(maxLayersModels);
        let maxLayersCustomTracks = this.store.state.printState.customTracks.reduce((a, b) => Math.max(a, b.layer + 1), 0);
        let maxLayers = Math.max(maxLayersModels, maxLayersCustomTracks);
        let completePlan = this.store.state.printState.slicingState.completePlan || [];
        console.log(completePlan);
        for (let i = 0; i < maxLayers; i++) {
            let layerPlan = completePlan[i];
            if (null != layerPlan) {
                for (let j = 0; j < layerPlan.tracks.length; j++) {
                    steps.push({
                        type: PrinterTaskType.PrintTrack,
                        fireEveryTicks: this.store.state.printState.printingParams.fireEveryTicks,
                        sequentialFires: this.store.state.printState.printingParams.sequentialFires,
                        layer: i,
                        moveAxisPos: layerPlan.tracks[j].startMoveAxisPosition
                    });
                }
            }
            let layerCustomTracks = this.store.state.printState.customTracks.filter(t => t.layer == i);
            if (layerCustomTracks.length > 0) {
                steps.push({
                    type: PrinterTaskType.PrintCustomTracks,
                    customTracks: layerCustomTracks,
                    fireEveryTicks: this.store.state.printState.printingParams.fireEveryTicks,
                    sequentialFires: this.store.state.printState.printingParams.sequentialFires
                });
            }
            if (i < maxLayers - 1) {
                steps.push({
                    type: PrinterTaskType.Move,
                    movement: { z: 15 },
                    feedRate: 500
                });
                steps.push({
                    type: PrinterTaskType.Wait,
                    durationMs: 30000
                });
                steps.push({
                    type: PrinterTaskType.Move,
                    movement: { z: height },
                    feedRate: 500
                });
                steps.push({
                    type: PrinterTaskType.Move,
                    movement: {
                        x: 0,
                        y: this.store.state.printState.printerParams.buildPlate.height,
                        z: height
                    },
                    feedRate: 10000
                });
                steps.push({
                    type: PrinterTaskType.PrimeNozzle
                });
                steps.push({
                    type: PrinterTaskType.Wait,
                    durationMs: 5000
                });
            }
        }
        if (completePlan.length > 0) {
            steps.push({
                type: PrinterTaskType.Move,
                movement: {
                    x: completePlan[0].tracks[0].startMoveAxisPosition + lowestZoomCameraOffset.x,
                    y: completePlan[0].tracks[0].startPrintAxisPosition + lowestZoomCameraOffset.y,
                    z: lowestZoomCameraOffset.z,
                },
                feedRate: 10000
            });
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
            this.moveAxisPos.value = "" + s.printState.slicingState.moveAxisPos;
        }
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const PrintTagName = "app-print";
customElements.define(PrintTagName, PrintComponent);
