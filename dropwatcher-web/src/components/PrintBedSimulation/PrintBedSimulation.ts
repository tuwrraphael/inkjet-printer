import { Model, Point, PolygonType, State, StateChanges } from "../../state/State";
import { Store } from "../../state/Store";
import { abortableEventListener } from "../../utils/abortableEventListener";
import template from "./PrintBedSimulation.html";
import "./PrintBedSimulation.scss";
import { ViewLayerChanged } from "../../state/actions/ModelAdded";
import { PrinterParams, PrintingParams, TrackSlicer } from "../../slicer/TrackSlicer";

let maxCanvasSize = 4096;
let simmargin = 10;

let check = 10;

let modelCanvasSize = 2084;

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

export class PrintBedSimulation extends HTMLElement {

    private rendered = false;
    private printCanvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private abortController: AbortController;
    private store: Store;
    private bedWidth: number;
    private bedHeight: number;
    private dotsPerMM: number;
    private encoderYAxis: { dpi: number; ticks: number; };
    private zoom: number;
    private initialized = false;
    private pan: { x: number; y: number; };
    private printCanvasInfo: HTMLDivElement;
    private models: Model[];
    private viewLayer = -1;
    private modelCanvasMap = new Map<Model, HTMLCanvasElement>();
    private rangeInput: HTMLInputElement;
    private layerDisplay: HTMLSpanElement;
    track: Uint32Array;
    printerParams: PrinterParams;
    printingParams: PrintingParams;

    constructor() {
        super();
        this.store = Store.getInstance();
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
        }
        this.abortController = new AbortController();
        this.store.subscribe((s, c) => this.update(s, c), this.abortController.signal);
        this.update(this.store.state, null);
        let zoomConstant = 0.008;
        abortableEventListener(this.printCanvas, "mousedown", (ev) => {
            if (Math.abs(this.zoom - 1.0) < 0.01) {
                return;
            }
            ev.preventDefault();
            let mouseDownX = ev.clientX;
            let mouseDownY = ev.clientY;
            let canvasFactor = this.printCanvas.getBoundingClientRect().width / this.printCanvas.width;
            let mouseMove = (ev: MouseEvent) => {
                this.pan.x += (ev.clientX - mouseDownX) / canvasFactor;
                this.pan.y += (ev.clientY - mouseDownY) / canvasFactor;

                mouseDownX = ev.clientX;
                mouseDownY = ev.clientY;
                this.render(false);
            };
            let mouseUp = (ev: MouseEvent) => {
                document.removeEventListener("mousemove", mouseMove);
                document.removeEventListener("mouseup", mouseUp);
            };
            document.addEventListener("mousemove", mouseMove);
            document.addEventListener("mouseup", mouseUp);
        }, this.abortController.signal);
        abortableEventListener(this.printCanvas, "mousemove", (ev) => {
            let rect = this.printCanvas.getBoundingClientRect();
            let canvasFactor = rect.width / this.printCanvas.width;
            let x = (((ev.clientX - rect.left - (this.pan.x * canvasFactor)) / this.zoom) / canvasFactor) / this.dotsPerMM - simmargin;
            let y = this.bedHeight - ((((ev.clientY - rect.top - (this.pan.y * canvasFactor)) / this.zoom) / canvasFactor) / this.dotsPerMM - simmargin);
            this.printCanvasInfo.innerText = `X: ${x.toFixed(2)} mm, Y: ${y.toFixed(2)} mm`;
        }, this.abortController.signal);
        abortableEventListener(this.printCanvas, "wheel", (ev) => {
            if (!ev.ctrlKey) {
                return;
            }
            ev.preventDefault();
            let rect = this.printCanvas.getBoundingClientRect();
            let canvasFactor = rect.width / this.printCanvas.width;

            let newZoom = this.zoom + ev.deltaY * -zoomConstant;
            newZoom = Math.max(1.0, newZoom);

            let newPanX = -1 * ((((ev.clientX - rect.left - (this.pan.x * canvasFactor)) / this.zoom) * newZoom - ev.clientX + rect.left) / canvasFactor);
            let newPanY = -1 * ((((ev.clientY - rect.top - (this.pan.y * canvasFactor)) / this.zoom) * newZoom - ev.clientY + rect.top) / canvasFactor);
            this.pan.x = newPanX;
            this.pan.y = newPanY;

            this.zoom = newZoom;
            if (Math.abs(this.zoom - 1.0) < 0.01) {
                this.pan = { x: 0, y: 0 };
            }
            this.render(false);
        }, this.abortController.signal);
        abortableEventListener(this.rangeInput, "input", (ev) => {
            this.layerDisplay.innerText = this.rangeInput.value;
        }, this.abortController.signal);
        abortableEventListener(this.rangeInput, "change", (ev) => {
            this.store.postAction(new ViewLayerChanged(parseInt(this.rangeInput.value)));
        }, this.abortController.signal);
    }



    private update(s: State, c: StateChanges) {
        if (s && (!c || c.includes("printState"))) {
            this.bedWidth = s.printState.printerParams.buildPlate.width;
            this.bedHeight = s.printState.printerParams.buildPlate.height;
            this.dotsPerMM = maxCanvasSize / (this.bedWidth + 2 * simmargin);
            this.encoderYAxis = s.printState.printerParams.encoder.yAxis;
            this.models = s.printState.models;
            let layerChanged = this.viewLayer != s.printState.viewLayer;
            this.viewLayer = s.printState.viewLayer;
            this.layerDisplay.innerText = this.viewLayer.toString();
            this.rangeInput.value = this.viewLayer.toString();
            let maxLayerNum = 0;
            for (let model of this.models) {
                maxLayerNum = Math.max(maxLayerNum, model.layers.length);
            }
            this.rangeInput.max = (maxLayerNum - 1).toString();
            this.initialized = true;

            const printheadSwathePerpendicular = 17.417;
            const printheadAngleRads = 0;
            const numNozzles = 128;
            const printheadSwathe = printheadSwathePerpendicular * Math.cos(printheadAngleRads);

            if (this.models.length > 0) {
                this.printerParams = {
                    buildPlate: s.printState.printerParams.buildPlate,
                    encoder: s.printState.printerParams.encoder,
                    numNozzles: numNozzles,
                    nozzleDistance: printheadSwathe / (numNozzles - 1)
                };
                this.printingParams = {
                    fireEveryTicks: 4,
                    printFirstLineAfterEncoderTick: 1,
                    sequentialFires: 1
                };
                let trackSlicer = new TrackSlicer(this.models[0], this.viewLayer,
                    this.printerParams,
                    this.printingParams
                );
                this.track = trackSlicer.getTrack(check);
                console.log(this.track);
            }

            this.render(layerChanged);
        }
    }

    private mmToDots(mm: number) {
        return mm * this.dotsPerMM * this.zoom;
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
        this.printCanvas.width = this.mmToDots(this.bedWidth + 2 * simmargin) / this.zoom;
        this.printCanvas.height = this.mmToDots(this.bedHeight + 2 * simmargin) / this.zoom;
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
        let encoderLineSpacing = 25.4 / this.encoderYAxis.dpi;
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = this.mmToDots(0.005);
        let end = this.getCanvasPosition(simmargin, 0);
        for (let i = 0; i < this.encoderYAxis.ticks; i++) {
            let start = this.getCanvasPosition(simmargin - lineLength, simmargin + this.bedHeight - i * encoderLineSpacing);
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
        for (let x = simmargin; x < this.bedWidth + simmargin; x += spacing) {
            let start = this.getCanvasPosition(x, simmargin);
            let end = this.getCanvasPosition(x, this.bedHeight + simmargin);
            this.ctx.beginPath();
            this.ctx.setLineDash([this.mmToDots(0.5), this.mmToDots(0.5)]);
            this.ctx.moveTo(start.x, start.y);
            this.ctx.lineTo(end.x, end.y);
            this.ctx.stroke();
        }
        for (let y = simmargin; y < this.bedHeight + simmargin; y += spacing) {
            let start = this.getCanvasPosition(simmargin, y);
            let end = this.getCanvasPosition(this.bedWidth + simmargin, y);
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

    private drawModel(model: Model, fillColor: string, layerChanged: boolean) {
        let modelWidth = model.boundingBox.max[0] - model.boundingBox.min[0];
        let modelHeight = model.boundingBox.max[1] - model.boundingBox.min[1];
        if (!this.modelCanvasMap.has(model) || layerChanged) {
            let modelCanvas = this.modelCanvasMap.get(model) || document.createElement("canvas");
            this.modelCanvasMap.set(model, modelCanvas);
            modelCanvas.width = modelCanvasSize;
            modelCanvas.height = modelHeight / modelWidth * modelCanvasSize;
            let ctx = modelCanvas.getContext("2d");
            ctx.fillStyle = "transparent";
            ctx.fillRect(0, 0, modelCanvas.width, modelCanvas.height);
            let currentLayer = model.layers[this.viewLayer];
            let scale = modelCanvas.width / modelWidth;
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
        let modelOrigin = this.buildPlatePositionToCanvasPosition(model.position[0], model.position[1] + modelHeight);
        this.ctx.strokeRect(
            modelOrigin.x,
            modelOrigin.y,
            this.mmToDots(modelWidth),
            this.mmToDots(modelHeight)
        );
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

    private drawTrack(x: number,
        lineData: Uint32Array,
        printerParams: PrinterParams,
        printingParams: PrintingParams
    ) {
        let encoderMMperDot = 25.4 / printerParams.encoder.yAxis.dpi;
        let tickAccumulator = printingParams.fireEveryTicks - 1;
        let line = 0;
        for (let tick = printingParams.printFirstLineAfterEncoderTick; tick < printerParams.encoder.yAxis.ticks; tick++) {
            tickAccumulator = (tickAccumulator + 1) % printingParams.fireEveryTicks;
            if (tickAccumulator == 0) {
                for (let fire = 0; fire < printingParams.sequentialFires; fire++) {
                    for (let nozzle = 0; nozzle < printerParams.numNozzles; nozzle++) {
                        let patternid = Math.floor(nozzle / 32);
                        let bitid = nozzle % 32;
                        if (lineData[line * 4 + patternid] & (1 << bitid)) {
                            let nozzleX = x + ((printerParams.numNozzles - 1) - nozzle) * printerParams.nozzleDistance;
                            let nozzleY = tick * encoderMMperDot + (fire / printingParams.sequentialFires) * encoderMMperDot * printingParams.fireEveryTicks;
                            let pos = this.buildPlatePositionToCanvasPosition(nozzleX, nozzleY);
                            this.ctx.fillStyle = "black";
                            this.ctx.beginPath();
                            this.ctx.arc(pos.x, pos.y, this.mmToDots(0.02), 0, 2 * Math.PI);
                            this.ctx.fill();
                        }
                    }
                }
                line++;
            }
        }
    }

    private render(layerChanged: boolean) {
        if (!this.initialized) {
            return;
        }
        requestAnimationFrame(() => {
            this.setCanvasSize();
            this.ctx.clearRect(0, 0, this.printCanvas.width, this.printCanvas.height);
            this.fillBuildPlateWithBackgroundLines();
            this.drawBuildPlateOutline();
            this.drawEncoderTicks();
            for (let model of this.models) {
                let color = modelColors[this.models.indexOf(model) % modelColors.length];
                this.drawModel(model, color, layerChanged);
            }
            this.drawOrigin();
            if (this.track) {
                this.drawTrack(check, this.track, this.printerParams, this.printingParams);
            }
        });
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const PrintBedSimulationTagName = "print-bed-simulation";
customElements.define(PrintBedSimulationTagName, PrintBedSimulation);
