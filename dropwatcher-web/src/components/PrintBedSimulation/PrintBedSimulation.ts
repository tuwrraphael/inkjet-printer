import { CustomTrack, Model, ModelParams, Point, PolygonType, PrintBedViewMode, StagePos, State, StateChanges, TrackRasterizationPreview } from "../../state/State";
import { Store } from "../../state/Store";
import { abortableEventListener } from "../../utils/abortableEventListener";
import template from "./PrintBedSimulation.html";
import "./PrintBedSimulation.scss";
import { PrintBedViewStateChanged } from "../../state/actions/PrintBedViewStateChanged";
import { TrackRasterization } from "../../slicer/TrackRasterization";
import { PrintingParams } from "../../slicer/PrintingParams";
import { PrinterParams } from "../../slicer/PrinterParams";
import { ModelPositionChanged } from "../../state/actions/ModelPositionChanged";
import { getNozzleDistance } from "../../slicer/getNozzleDistance";
import { ModelSelected } from "../../state/actions/ModelSelected";
import { LayerPlan, PrintPlan } from "../../slicer/LayerPlan";
import { ModelGroupParamsChanged } from "../../state/actions/ModelParamsChanged";
import { getPrintheadSwathe } from "../../slicer/getPrintheadSwathe";
import { getMicroscopePosition } from "../../utils/getMicroscopePosition";
import { MovementStage } from "../../movement-stage";
import { printBedPositionToMicroscope } from "../../utils/printBedPositionToMicroscope";

let maxCanvasSize = 4096;
let simmargin = 10;

let modelColors = [
    "#FFDFBA", // pastel orange
    "#BAE1FF", // pastel blue
    "#D8BAFF", // pastel purple
    "#FFBAF3", // pastel lavender
    "#BAFFFA", // pastel mint
    "#FFD8BA", // pastel peach
    "#BAFFBA",  // pastel lime
    "#FFB3BA", // pastel pink
    "#FFFFBA", // pastel yellow
    "#BAFFC9", // pastel green
];

let printPlanTrackColors = [
    "#780000",
    "#bc6c25",
    "#283618",
    "#023047",
    "#00f5d4",
];

const zoomLevels = [1.0, 1.10, 1.25, 1.50, 2.0, 3.0, 4.0, 5.0, 6.0, 8.0, 10.0, 12.0, 15.0, 20.0, 25.0, 30.0, 40.0, 50.0, 60.0, 80.0, 100.0];

export enum PrintBedClickAction {
    None,
    PlacePhotoPoint,
    MoveCamera
}

export class PrintBedSimulation extends HTMLElement {

    private rendered = false;
    private printCanvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private abortController: AbortController;
    private store: Store;
    private bedWidth: number;
    private bedHeight: number;
    private dotsPerMM: number;
    private encoderPrintAxis: { dpi: number; ticks: number; };
    private zoom: number;
    private currentZoomLevel = 0;
    private initialized = false;
    private pan: { x: number; y: number; };
    private printCanvasInfo: HTMLDivElement;
    private models: Model[];
    private viewLayer = -1;
    private modelCanvasMap = new Map<Model, HTMLCanvasElement>();
    private rangeInput: HTMLInputElement;
    private layerDisplay: HTMLSpanElement;
    private modelPositionMap: WeakMap<Model, { x: number, y: number }> = new WeakMap();
    private printerParams: PrinterParams;
    private printingParams: PrintingParams;
    private resizeObserver: ResizeObserver;
    private modelParams: { [id: string]: ModelParams; };
    private printCanvasDevicePixelContentBoxSize: { inlineSize: number; blockSize: number; };
    private nextRenderNeedsModelRedraw = false;
    private modelMoving: Model = null;
    private customTracks: CustomTrack[];
    private printPlan: PrintPlan;
    private viewedLayerPlan: LayerPlan;
    private viewMode: PrintBedViewMode;
    private currentPrintingTrack: { track: TrackRasterization; moveAxisPosition: number; };
    private currentRasterization: TrackRasterizationPreview[];
    private printbedClickAction: PrintBedClickAction = PrintBedClickAction.None;
    private feasiblePhotoArea: { min: [number, number]; max: [number, number]; };
    private stagePos: StagePos;
    private printbedToCamera: { x: number; y: number; z: number; };
    private movementStage: MovementStage;

    constructor() {
        super();
        this.store = Store.getInstance();
        this.movementStage = MovementStage.getInstance();
        this.zoom = 1.0;
        this.pan = { x: 0, y: 0 };
    }

    connectedCallback() {
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
            this.printCanvas = this.querySelector("#print-canvas");
            this.printCanvasInfo = this.querySelector("#print-canvas-info");
            this.layerDisplay = this.querySelector("#layer-display");
            this.rangeInput = this.querySelector("#layer-range");
            this.ctx = this.printCanvas.getContext("2d");
            this.resizeObserver = new ResizeObserver((entries, observer) => this.onResized(entries, observer));
        }
        this.abortController = new AbortController();
        this.store.subscribe((s, c) => this.update(s, c), this.abortController.signal);
        this.update(this.store.state, null);
        abortableEventListener(this.printCanvas, "mousedown", (ev) => {
            ev.preventDefault();
            if (this.printbedClickAction != PrintBedClickAction.None) {
                let mouseUp = (ev: MouseEvent) => {
                    document.removeEventListener("mouseup", mouseUp);
                    let { x, y } = this.bedPositionFromMouseEvent(ev);
                    if (this.printbedClickAction == PrintBedClickAction.MoveCamera) {
                        let pos = printBedPositionToMicroscope({ x: x, y: y }, 0, this.printbedToCamera, this.store.state.printState.printerParams.movementRange);
                        if (pos.feasible) {
                            using movementExecutor = this.movementStage.getMovementExecutor("printbed");
                            movementExecutor.moveAbsoluteAndWait(pos.microscopePos.x, pos.microscopePos.y, pos.microscopePos.z, 10000);
                        }
                    }
                    else if (!(x < this.feasiblePhotoArea.min[0] || x > this.feasiblePhotoArea.max[0] || y < this.feasiblePhotoArea.min[1] || y > this.feasiblePhotoArea.max[1])) {
                        this.store.postAction(new ModelGroupParamsChanged(this.store.state.printState.modelParams[this.store.state.printBedViewState.selectedModelId].modelGroupId, {
                            photoPoints: [{ x, y }]
                        }));
                    }
                    this.printbedClickAction = PrintBedClickAction.None;
                    this.render();
                };
                document.addEventListener("mouseup", mouseUp);
            } else {
                let rect = this.printCanvas.getBoundingClientRect();
                let canvasFactor = rect.width / this.printCanvas.width;
                let mouseDownX = ev.clientX;
                let mouseDownY = ev.clientY;
                let mouseDownBedPos = this.bedPositionFromMouseEvent(ev);
                let middleButton = ev.button === 1;
                let model = this.bedPositionOnModel(mouseDownBedPos);
                let modelParams: ModelParams;
                let modelOrigin: { x: number, y: number };
                if (model) {
                    this.modelMoving = model;
                    modelParams = this.modelParams[model.id];
                    modelOrigin = { x: modelParams.position[0], y: modelParams.position[1] };
                    this.store.postAction(new ModelSelected(model.id));
                }
                let mouseMove = (ev: MouseEvent) => {
                    if (this.modelMoving && !middleButton) {
                        let snapToGrid = ev.shiftKey;
                        let movedPos = this.bedPositionFromMouseEvent(ev);
                        let newModelPos = { x: modelOrigin.x + (movedPos.x - mouseDownBedPos.x), y: modelOrigin.y + (movedPos.y - mouseDownBedPos.y) };
                        if (snapToGrid) {
                            newModelPos.x = Math.round(newModelPos.x);
                            newModelPos.y = Math.round(newModelPos.y);
                        }
                        this.modelPositionMap.set(model, newModelPos);
                        this.render();
                        this.printCanvasInfo.innerText = `Move Model to X: ${newModelPos.x.toFixed(2)} mm, Y: ${newModelPos.y.toFixed(2)} mm`;
                        return;
                    }
                    if (Math.abs(this.zoom - 1.0) < 0.01) {
                        return;
                    }
                    this.pan.x += (ev.clientX - mouseDownX) / canvasFactor;
                    this.pan.y += (ev.clientY - mouseDownY) / canvasFactor;

                    mouseDownX = ev.clientX;
                    mouseDownY = ev.clientY;
                    this.render();
                };
                let mouseUp = (ev: MouseEvent) => {
                    document.removeEventListener("mousemove", mouseMove);
                    document.removeEventListener("mouseup", mouseUp);
                    if (this.modelMoving) {
                        this.modelMoving = null;
                        let updatedPos = this.modelPositionMap.get(model);
                        const minimumMovement = 0.1;
                        if (Math.abs(updatedPos.x - modelParams.position[0]) > minimumMovement || Math.abs(updatedPos.y - modelParams.position[1]) > minimumMovement) {
                            this.store.postAction(new ModelPositionChanged(model.id, [updatedPos.x, updatedPos.y]));
                        }
                    }
                };
                document.addEventListener("mousemove", mouseMove);
                document.addEventListener("mouseup", mouseUp);
            }
        }, this.abortController.signal);
        abortableEventListener(this.printCanvas, "mousemove", (ev) => {
            let { x, y } = this.bedPositionFromMouseEvent(ev);
            if (!this.modelMoving) {
                this.printCanvasInfo.innerText = `X: ${x.toFixed(2)} mm, Y: ${y.toFixed(2)} mm`;
            }
        }, this.abortController.signal);
        abortableEventListener(this.printCanvas, "wheel", (ev) => {
            if (!ev.ctrlKey) {
                return;
            }
            ev.preventDefault();
            let rect = this.printCanvas.getBoundingClientRect();
            let canvasFactor = rect.width / this.printCanvas.width;
            let advanceZoomLevels = -ev.deltaY / rect.height * 5;
            if (advanceZoomLevels > 0) {
                advanceZoomLevels = Math.ceil(advanceZoomLevels);
            } else {
                advanceZoomLevels = Math.floor(advanceZoomLevels);
            }
            let newZoomLevel = Math.max(0, Math.min(zoomLevels.length - 1, this.currentZoomLevel + advanceZoomLevels));
            let newZoom = zoomLevels[newZoomLevel];

            let newDotsPerMM = this.dotsPerMM * newZoom / this.zoom;



            let newPanX = -1 * (newDotsPerMM * (((ev.clientX - rect.left - (this.pan.x * canvasFactor)))) / this.dotsPerMM - ev.clientX + rect.left) / canvasFactor;
            let newPanY = -1 * (newDotsPerMM * (((ev.clientY - rect.top - (this.pan.y * canvasFactor)))) / this.dotsPerMM - ev.clientY + rect.top) / canvasFactor;
            this.pan.x = newPanX;
            this.pan.y = newPanY;

            this.zoom = newZoom;
            this.currentZoomLevel = newZoomLevel;
            if (Math.abs(this.zoom - 1.0) < 0.01) {
                this.pan = { x: 0, y: 0 };
            }
            this.nextRenderNeedsModelRedraw = true;
            this.render();
        }, this.abortController.signal);
        abortableEventListener(this.rangeInput, "input", (ev) => {
            this.layerDisplay.innerText = `${parseInt(this.rangeInput.value) + 1}`;
        }, this.abortController.signal);
        abortableEventListener(this.rangeInput, "change", (ev) => {
            this.store.postAction(new PrintBedViewStateChanged({
                viewLayer: parseInt(this.rangeInput.value)
            }));
        }, this.abortController.signal);
        this.resizeObserver.observe(this.printCanvas, { box: "device-pixel-content-box" });
    }

    onResized(entries: ResizeObserverEntry[], observer: ResizeObserver): void {
        const entry = Array.from(entries).find((entry) => entry.target === this.printCanvas);
        if (!entry) {
            return;
        }
        this.printCanvasDevicePixelContentBoxSize = {
            inlineSize: entry.devicePixelContentBoxSize[0].inlineSize,
            blockSize: entry.devicePixelContentBoxSize[0].blockSize
        };
        this.nextRenderNeedsModelRedraw = true;
        this.render();
    }

    private bedPositionFromMouseEvent(ev: MouseEvent) {
        let rect = this.printCanvas.getBoundingClientRect();
        let canvasFactor = rect.width / this.printCanvas.width;
        return {
            x: (((ev.clientX - rect.left - (this.pan.x * canvasFactor))) / canvasFactor) / this.dotsPerMM - simmargin,
            y: this.bedHeight - ((((ev.clientY - rect.top - (this.pan.y * canvasFactor))) / canvasFactor) / this.dotsPerMM - simmargin)
        };
    }

    private bedPositionOnModel({ x, y }: { x: number, y: number }): Model | null {
        let reversed = [...this.models].reverse();
        for (let model of reversed) {

            let modelWidth = model.boundingBox.max[0] - model.boundingBox.min[0];
            let modelHeight = model.boundingBox.max[1] - model.boundingBox.min[1];
            let modelParams = this.modelParams[model.id];
            let modelOrigin = {
                x: modelParams.position[0],
                y: modelParams.position[1]
            };
            if (x >= modelOrigin.x && x <= modelOrigin.x + modelWidth && y >= modelOrigin.y && y <= modelOrigin.y + modelHeight) {
                return model;
            }
        }
        return null;
    }

    private getFeasiblePhotoPointArea(s: State): { min: [number, number], max: [number, number] } {
        let minX = 0;
        let maxX = s.printState.printerParams.buildPlate.width - this.store.state.printState.printerParams.printBedToCamera.x;
        let minY = 0;
        let maxY = s.printState.printerParams.buildPlate.height - this.store.state.printState.printerParams.printBedToCamera.y;
        console.log({ min: [minX, minY], max: [maxX, maxY] });
        return { min: [minX, minY], max: [maxX, maxY] };


    }

    setClickAction(action: PrintBedClickAction) {
        this.printbedClickAction = action;
        this.render();
    }

    private update(s: State, c: StateChanges) {
        let keysOfInterest: (keyof State)[] = ["models", "printState", "printBedViewState", "movementStageState"];
        if (s && (null == c || keysOfInterest.some(k => c.includes(k)))) {
            this.bedWidth = s.printState.printerParams.buildPlate.width;
            this.bedHeight = s.printState.printerParams.buildPlate.height;
            this.encoderPrintAxis = s.printState.printerParams.encoder.printAxis;
            this.models = s.models;
            this.modelParams = s.printState.modelParams;
            for (let model of this.models) {
                let modelParams = s.printState.modelParams[model.id];
                this.modelPositionMap.set(model, { x: modelParams.position[0], y: modelParams.position[1] });
            }
            let layerChanged = this.viewLayer != s.printBedViewState.viewLayer;
            this.viewLayer = s.printBedViewState.viewLayer;
            this.layerDisplay.innerText = `${1 + this.viewLayer}`;
            this.rangeInput.value = this.viewLayer.toString();
            let maxLayerNum = 0;
            for (let model of this.models) {
                maxLayerNum = Math.max(maxLayerNum, model.layers.length);
            }
            this.rangeInput.max = Math.max(this.viewLayer, (maxLayerNum - 1)).toString();
            this.initialized = true;
            this.printerParams = s.printState.printerParams;
            this.printingParams = s.printState.printingParams;
            this.customTracks = s.printState.customTracks;
            this.currentRasterization = s.printState.slicingState.currentRasterization;
            this.printPlan = s.printState.slicingState.printPlan;
            this.viewedLayerPlan = this.printPlan ? this.printPlan.layers[this.viewLayer] : null;
            this.viewMode = s.printBedViewState.viewMode;
            this.currentPrintingTrack = s.printState.currentPrintingTrack;
            if (layerChanged || c.includes("models")) {
                this.nextRenderNeedsModelRedraw = true;
            }
            this.feasiblePhotoArea = this.getFeasiblePhotoPointArea(s);
            this.stagePos = s.movementStageState.pos;
            this.printbedToCamera = s.printState.printerParams.printBedToCamera;
            this.render();
        }
    }

    private mmToDots(mm: number) {
        return mm * this.dotsPerMM;
    }

    private getCanvasPosition(mmX: number, mmY: number) {
        return {
            x: this.mmToDots(mmX) + this.pan.x,
            y: this.mmToDots(mmY) + this.pan.y
        };
    }

    private buildPlatePositionToCanvasPosition(mmX: number, mmY: number) {
        return this.getCanvasPosition(mmX + simmargin, this.bedHeight - mmY + simmargin);
    }

    private setCanvasSize() {
        if (!this.printCanvasDevicePixelContentBoxSize
            || this.printCanvasDevicePixelContentBoxSize.inlineSize == 0
            || this.printCanvasDevicePixelContentBoxSize.blockSize == 0
        ) {
            return false;
        }
        let width = Math.min(this.printCanvasDevicePixelContentBoxSize.inlineSize, maxCanvasSize);
        let height = Math.min(this.printCanvasDevicePixelContentBoxSize.blockSize, maxCanvasSize);
        let displayWidthMM = (this.bedWidth + 2 * simmargin) / this.zoom;
        let displayHeightMM = (this.bedHeight + 2 * simmargin) / this.zoom;
        if (width / displayWidthMM < height / displayHeightMM) {
            this.dotsPerMM = width / displayWidthMM;
        } else {
            this.dotsPerMM = height / displayHeightMM;
        }
        this.printCanvas.width = width;
        this.printCanvas.height = height;
        return true;
    }

    private drawBuildPlateOutline() {
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = this.mmToDots(0.2);
        let start = this.getCanvasPosition(simmargin, simmargin);
        let end = this.getCanvasPosition(simmargin + this.bedWidth, simmargin + this.bedHeight);
        this.ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
    }

    private drawEncoderTicks() {
        let lineLength = 5;
        let margin = 2;
        let encoderLineSpacing = 25.4 / this.encoderPrintAxis.dpi;
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = this.mmToDots(0.005);
        let end = this.getCanvasPosition(simmargin - margin, 0);
        for (let i = 0; i < this.encoderPrintAxis.ticks; i++) {
            let start = this.getCanvasPosition(simmargin - lineLength - margin, simmargin + this.bedHeight - i * encoderLineSpacing);
            this.ctx.beginPath();
            this.ctx.moveTo(start.x, start.y);
            this.ctx.lineTo(end.x, start.y);
            this.ctx.stroke();
        }
    }

    private fillBuildPlateWithBackgroundLines() {
        let spacing = 10;
        this.ctx.strokeStyle = "lightgray";
        this.ctx.lineWidth = this.mmToDots(0.1);
        for (let x = 0; x < this.bedWidth; x += spacing) {
            let start = this.buildPlatePositionToCanvasPosition(x, 0);
            let end = this.buildPlatePositionToCanvasPosition(x, this.bedHeight);
            this.ctx.beginPath();
            this.ctx.setLineDash([this.mmToDots(0.5), this.mmToDots(0.5)]);
            this.ctx.moveTo(start.x, start.y);
            this.ctx.lineTo(end.x, end.y);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.bedHeight; y += spacing) {
            let start = this.buildPlatePositionToCanvasPosition(0, y);
            let end = this.buildPlatePositionToCanvasPosition(this.bedWidth, y);
            this.ctx.beginPath();
            this.ctx.setLineDash([this.mmToDots(0.5), this.mmToDots(0.5)]);
            this.ctx.moveTo(start.x, start.y);
            this.ctx.lineTo(end.x, end.y);
            this.ctx.stroke();
        }
        this.ctx.setLineDash([]);
    }

    private mirrorY(points: Point[], height: number): Point[] {
        return points.map(([x, y]) => {
            return [x, height - y];
        });
    }

    private drawPolygon(ctx: CanvasRenderingContext2D,
        points: [number, number][], fillColor: string,
        scale: number) {
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        let start = { x: points[0][0] * scale, y: points[0][1] * scale };
        ctx.moveTo(start.x, start.y);
        for (let i = 1; i < points.length; i++) {
            let point = { x: points[i][0] * scale, y: points[i][1] * scale };
            ctx.lineTo(point.x, point.y);
        }
        ctx.closePath();
        ctx.fill();
    }

    private drawModel(model: Model, fillColor: string, redraw: boolean) {
        let modelWidth = model.boundingBox.max[0] - model.boundingBox.min[0];
        let modelHeight = model.boundingBox.max[1] - model.boundingBox.min[1];
        if (model.layers.length <= this.viewLayer) {
            return;
        }
        if (!this.modelCanvasMap.has(model) || redraw) {

            let modelCanvas = this.modelCanvasMap.get(model) || document.createElement("canvas");
            this.modelCanvasMap.set(model, modelCanvas);
            modelCanvas.width = Math.min(modelWidth * this.dotsPerMM, maxCanvasSize);
            let scale = modelCanvas.width / modelWidth;
            modelCanvas.height = scale * modelHeight;
            let ctx = modelCanvas.getContext("2d");
            ctx.fillStyle = "transparent";
            ctx.fillRect(0, 0, modelCanvas.width, modelCanvas.height);
            let currentLayer = model.layers[this.viewLayer];

            for (let polygon of currentLayer.polygons) {
                let transformed = this.mirrorY(polygon.points, modelHeight);
                if (polygon.type == PolygonType.Contour) {
                    ctx.globalCompositeOperation = "source-over";
                    this.drawPolygon(ctx, transformed, fillColor, scale);
                } else {
                    ctx.globalCompositeOperation = "destination-out";
                    this.drawPolygon(ctx, transformed, fillColor, scale);
                }
            }
        }
        let modelCanvas = this.modelCanvasMap.get(model);
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = this.mmToDots(0.2);
        let modelPosition = this.modelPositionMap.get(model);
        let modelOrigin = this.buildPlatePositionToCanvasPosition(modelPosition.x, modelPosition.y + modelHeight);
        if (this.modelMoving == model) {
            this.ctx.strokeRect(
                modelOrigin.x,
                modelOrigin.y,
                this.mmToDots(modelWidth),
                this.mmToDots(modelHeight)
            );
        }
        this.ctx.drawImage(
            modelCanvas,
            modelOrigin.x,
            modelOrigin.y,
            this.mmToDots(modelWidth),
            this.mmToDots(modelHeight)
        );
    }

    private drawOrigin() {
        let origin = this.buildPlatePositionToCanvasPosition(0, 0);
        this.ctx.strokeStyle = "red";
        this.ctx.lineWidth = this.mmToDots(0.2);
        this.ctx.beginPath();
        this.ctx.arc(origin.x, origin.y, this.mmToDots(1), 0, 2 * Math.PI);
        this.ctx.stroke();
        for (let i = 0; i < 4; i++) {
            let x = i % 2 == 0 ? 1 : -1;
            let y = i < 2 ? 1 : -1;
            let lineStart = this.buildPlatePositionToCanvasPosition(0, 0);
            let lineEnd = this.buildPlatePositionToCanvasPosition(x, y);
            this.ctx.beginPath();
            this.ctx.moveTo(lineStart.x, lineStart.y);
            this.ctx.lineTo(lineEnd.x, lineEnd.y);
            this.ctx.stroke();
        }
    }

    private drawTrack(moveAxisPos: number,
        track: TrackRasterization,
        printerParams: PrinterParams,
        printingParams: PrintingParams,
        dotColor: string = "black",
        outlineColor: string = "coral"
    ) {
        let nozzleDistance = getNozzleDistance(printerParams);
        let encoderMMperDot = 25.4 / printerParams.encoder.printAxis.dpi;
        let line = 0;
        for (let tick = 0; tick <= printerParams.encoder.printAxis.ticks; tick++) {
            if (tick < track.printFirstLineAfterEncoderTick) {
                continue;
            }
            if (line >= track.linesToPrint) {
                break;
            }
            let printNow = (tick - track.printFirstLineAfterEncoderTick) % printingParams.fireEveryTicks == 0;
            if (printNow) {
                for (let fire = 0; fire < printingParams.sequentialFires; fire++) {
                    for (let nozzle = 0; nozzle < printerParams.numNozzles; nozzle++) {
                        let nozzleBlocked = printerParams.blockedNozzles.includes(nozzle);
                        let patternid = Math.floor(nozzle / 32);
                        let bitid = nozzle % 32;
                        if (track.data[line * 4 + patternid] & (1 << bitid)) {
                            let baseX = moveAxisPos;
                            let baseY = tick * encoderMMperDot + (fire / printingParams.sequentialFires) * encoderMMperDot * printingParams.fireEveryTicks;
                            let nozzleX = baseX + ((printerParams.numNozzles - 1) - nozzle) * nozzleDistance.x;
                            let nozzleY = baseY + ((printerParams.numNozzles - 1) - nozzle) * nozzleDistance.y;
                            let pos = this.buildPlatePositionToCanvasPosition(nozzleX, nozzleY);
                            this.ctx.fillStyle = nozzleBlocked ? "red" : dotColor;
                            this.ctx.beginPath();
                            this.ctx.arc(pos.x, pos.y, this.mmToDots(0.1), 0, 2 * Math.PI);
                            this.ctx.fill();
                        }
                    }
                }
                line++;
            }
        }
        this.drawTrackOutline(moveAxisPos, track, outlineColor);
    }

    private drawTrackOutline(moveAxisPos: number,
        track: {
            startPrintAxisPosition: number,
            endPrintAxisPosition: number
        },
        color = "coral") {
        let nozzleDistance = getNozzleDistance(this.printerParams);

        let firstNozzlePos = this.buildPlatePositionToCanvasPosition(
            moveAxisPos + (this.printerParams.numNozzles - 1) * nozzleDistance.x,
            track.startPrintAxisPosition + (this.printerParams.numNozzles - 1) * nozzleDistance.y
        );
        let lastNozzlePos = this.buildPlatePositionToCanvasPosition(
            moveAxisPos,
            track.startPrintAxisPosition
        );
        let firstNozzlePosAfterTrack = this.buildPlatePositionToCanvasPosition(
            moveAxisPos + (this.printerParams.numNozzles - 1) * nozzleDistance.x,
            track.endPrintAxisPosition + (this.printerParams.numNozzles - 1) * nozzleDistance.y
        );
        let lastNozzlePosAfterTrack = this.buildPlatePositionToCanvasPosition(
            moveAxisPos,
            track.endPrintAxisPosition
        );
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = this.mmToDots(0.1);
        this.ctx.setLineDash([this.mmToDots(0.5), this.mmToDots(0.5)]);
        this.ctx.beginPath();
        this.ctx.moveTo(firstNozzlePos.x, firstNozzlePos.y);
        this.ctx.lineTo(lastNozzlePos.x, lastNozzlePos.y);
        this.ctx.lineTo(lastNozzlePosAfterTrack.x, lastNozzlePosAfterTrack.y);
        this.ctx.lineTo(firstNozzlePosAfterTrack.x, firstNozzlePosAfterTrack.y);
        this.ctx.closePath();
        this.ctx.stroke();

        this.ctx.setLineDash([0, 0]);
    }

    private drawLayerPlan(layerPlan: LayerPlan) {
        for (let o of layerPlan.modelGroupPlans) {
            for (let track of o.tracks) {
                this.drawTrackOutline(track.moveAxisPosition, track, printPlanTrackColors[layerPlan.modelGroupPlans.indexOf(o) % printPlanTrackColors.length]);
            }
        }
    }

    private drawPhotoPoints(layerPlan: LayerPlan) {
        for (let o of layerPlan.modelGroupPlans) {
            for (let p of o.printingParams.photoPoints) {
                let center = this.buildPlatePositionToCanvasPosition(p.x, p.y);
                let width = 2.975780963;
                let height = 1080 / 1920 * width;
                let x = center.x - this.mmToDots(width / 2);
                let y = center.y - this.mmToDots(height / 2);
                this.ctx.strokeStyle = "black";
                this.ctx.lineWidth = this.mmToDots(0.1);
                this.ctx.strokeRect(x, y, this.mmToDots(width), this.mmToDots(height));
            }
        }
    }

    private drawFeasiblePhotoArea() {
        let { min, max } = this.feasiblePhotoArea;
        let minPos = this.buildPlatePositionToCanvasPosition(min[0], min[1]);
        let maxPos = this.buildPlatePositionToCanvasPosition(max[0], max[1]);
        this.ctx.strokeStyle = "green";
        this.ctx.lineWidth = this.mmToDots(0.2);
        this.ctx.strokeRect(minPos.x, minPos.y, maxPos.x - minPos.x, maxPos.y - minPos.y);
    }

    private drawPrinthead() {
        let swathe = getPrintheadSwathe(this.printerParams);
        let nozzleDistance = getNozzleDistance(this.printerParams);
        let nozzlePos = this.buildPlatePositionToCanvasPosition(this.stagePos.x + swathe.x, this.stagePos.y + swathe.y);
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = this.mmToDots(0.2);
        this.ctx.beginPath();
        this.ctx.arc(nozzlePos.x, nozzlePos.y, this.mmToDots(0.5), 0, 2 * Math.PI);
        this.ctx.stroke();
        for (let nozzle = 0; nozzle < this.printerParams.numNozzles; nozzle++) {
            let nozzleX = this.stagePos.x + (this.printerParams.numNozzles - 1 - nozzle) * nozzleDistance.x;
            let nozzleY = this.stagePos.y + (this.printerParams.numNozzles - 1 - nozzle) * nozzleDistance.y;
            let pos = this.buildPlatePositionToCanvasPosition(nozzleX, nozzleY);
            this.ctx.fillStyle = "black";
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, this.mmToDots(0.05), 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }

    private drawCamera() {
        let pos = getMicroscopePosition(this.stagePos, this.printbedToCamera);
        console.log(pos);
        let center = this.buildPlatePositionToCanvasPosition(pos.x, pos.y);
        let width = 2.975780963;
        let height = 1080 / 1920 * width;
        let x = center.x - this.mmToDots(width / 2);
        let y = center.y - this.mmToDots(height / 2);
        this.ctx.strokeStyle = "blue";
        this.ctx.lineWidth = this.mmToDots(0.1);
        this.ctx.strokeRect(x, y, this.mmToDots(width), this.mmToDots(height));
    }



    private render() {
        if (!this.initialized) {
            return;
        }
        requestAnimationFrame(() => {
            let redrawModels = !this.modelMoving && this.nextRenderNeedsModelRedraw;
            if (!this.setCanvasSize()) {
                return 0;
            }
            this.ctx.clearRect(0, 0, this.printCanvas.width, this.printCanvas.height);
            this.fillBuildPlateWithBackgroundLines();
            this.drawBuildPlateOutline();
            this.drawEncoderTicks();
            for (let model of this.models) {
                let color = modelColors[this.models.indexOf(model) % modelColors.length];
                this.drawModel(model, color, redrawModels);
            }
            this.drawOrigin();
            if (this.viewMode.mode == "layerPlan") {
                if (this.viewedLayerPlan) {
                    this.drawLayerPlan(this.viewedLayerPlan);
                    this.drawPhotoPoints(this.viewedLayerPlan);
                }
            } else if (this.viewMode.mode == "rasterization") {
                if (null != this.viewedLayerPlan && null != this.currentRasterization) {
                    let trackNr = 0;
                    for (let r of this.currentRasterization) {
                        if (this.viewMode.evenOddView && trackNr % 2 != 0) {
                            this.drawTrack(r.moveAxisPosition, r.result.track, this.printerParams, r.result.printingParams, "rgba(128, 128, 128, 0.8)", "rgba(255, 127, 80, 0.8)");
                        } else {
                            this.drawTrack(r.moveAxisPosition, r.result.track, this.printerParams, r.result.printingParams, "rgba(0, 0, 0, 0.8)", "rgba(255, 127, 80, 0.8)");
                        }
                        for (let { track, moveAxisPos } of r.result.correctionTracks) {
                            if (this.viewMode.evenOddView && trackNr % 2 != 0) {
                                this.drawTrack(moveAxisPos, track, this.printerParams, r.result.printingParams, "rgba(144, 238, 144, 0.8)", "rgba(0, 128, 0, 0.8)");
                            } else {
                                this.drawTrack(moveAxisPos, track, this.printerParams, r.result.printingParams, "rgba(0, 128, 0, 0.8)", "rgba(0, 128, 0, 0.8)");
                            }
                        }
                        trackNr++;
                    }
                }
                for (let { layer, track, moveAxisPos } of this.customTracks.filter(l => l.layer == this.viewLayer)) {
                    this.drawTrack(moveAxisPos, track, this.printerParams, this.printingParams);
                }
            } else if (this.viewMode.mode == "printingTrack") {
                if (this.currentPrintingTrack) {
                    this.drawTrack(this.currentPrintingTrack.moveAxisPosition, this.currentPrintingTrack.track, this.printerParams, this.printingParams, "black", "black");
                }
            } else {
                throw new Error("Unknown view mode");
            }
            if (redrawModels) {
                this.nextRenderNeedsModelRedraw = false;
            }
            if (this.printbedClickAction == PrintBedClickAction.PlacePhotoPoint) {
                this.drawFeasiblePhotoArea();
            }
            if (null != this.stagePos) {
                this.drawPrinthead();
                this.drawCamera();
            }
        });
    }

    disconnectedCallback() {
        this.abortController.abort();
        this.resizeObserver.disconnect();
    }
}

export const PrintBedSimulationTagName = "print-bed-simulation";
customElements.define(PrintBedSimulationTagName, PrintBedSimulation);
