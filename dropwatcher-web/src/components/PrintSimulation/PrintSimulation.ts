import template from "./PrintSimulation.html";
import "./PrintSimulation.scss";
import { abortableEventListener } from "../../utils/abortableEventListener";
import pointInPolygon from "robust-point-in-polygon";
import { ROTATE_180, THRESH_OTSU, THRESH_TRIANGLE, bool } from "@techstark/opencv-js";
import { Slicer } from "./Slicer";

const printheadSwathePerpendicular = 17.417;
const printheadAngleRads = 0;
export const numNozzles = 128;
const printheadSwathe = printheadSwathePerpendicular * Math.cos(printheadAngleRads);

export const PrinterParams = {
    encoderTicksY: 5000,
    encoderDPI: 720,
    buildPlate: {
        width: 175,
        height: 175
    },
    printheadSwathe: printheadSwathe,
    nozzleDistance: printheadSwathe / (numNozzles - 1)
};


let maxCanvasSize = 16384;
let simmargin = 10;

let SimParams = {
    dotsPerMM: maxCanvasSize / (PrinterParams.buildPlate.width + 2 * simmargin),
    margin: simmargin,
};

export enum PolygonType {
    Contour,
    Hole
}
export type Point = [number, number];

export interface Polygon {
    type: PolygonType;
    points: Point[];
}

export interface PrintingParams {
    fireEveryTicks: number;
    printFirstLineAfterEncoderTick: number;
    sequentialFires: number;
}



export class PrintSimulation extends HTMLElement {

    private rendered = false;
    private printCanvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private abortController: AbortController;
    constructor() {
        super();
    }

    connectedCallback() {
        if (!this.rendered) {
            this.rendered = true;
            this.innerHTML = template;
            this.printCanvas = this.querySelector("#print-canvas");
            this.ctx = this.printCanvas.getContext("2d");
        }
        this.abortController = new AbortController();

        this.setCanvasSize();
        this.drawBuildPlateOutline();
        this.drawEncoderTicks();
        // this.drawCircle(0, 0, 5);
        this.processSvg().catch(console.error).then(() => {
            // this.fillBed(fn => true);
        });

    }

    mirrorPolygonY(points: [number, number][]): [number, number][] {
        return points.map(([x, y]) => [x, -y]);
    }

    fromBedCoordinates(points: [number, number][]): [number, number][] {
        return (points.map(([x, y]) => [SimParams.margin + x, SimParams.margin + PrinterParams.buildPlate.height - y]));
    }

    async processSvg() {
        let position = {
            x: 0,
            y: 0
        };
        const res = await fetch(new URL("../../assets/3dbenchy.svg", import.meta.url));
        if (!res.ok) {
            throw new Error("SVG could not be downloaded");
        }
        const doc = new DOMParser().parseFromString(await res.text(), "text/xml");
        const layer = 0;
        const el = doc.querySelector("#layer" + layer);
        const polygonTypeMap: { [key: string]: PolygonType } = {
            "contour": PolygonType.Contour,
            "hole": PolygonType.Hole
        };
        let polygons: Polygon[] = [];
        for (let polygon of el.querySelectorAll("polygon")) {
            let type = polygon.getAttribute("slic3r:type");
            if (polygonTypeMap.hasOwnProperty(type) === false) {
                throw new Error(`Unsupported type ${type}`);
            }
            let points: Point[] = polygon.getAttribute("points").split(" ").map((point) => {
                let [x, y] = point.split(",");
                return [
                    parseFloat(x) + position.x,
                    parseFloat(y) + position.y
                ];
            });
            this.drawPolygon(this.fromBedCoordinates(points), type === "contour" ? "green" : "white");
            polygons.push({ type: polygonTypeMap[type], points });
        }
        abortableEventListener(this.printCanvas, "click", ev => {
            let rect = this.printCanvas.getBoundingClientRect();
            let x = (ev.clientX - rect.left) / (rect.right - rect.left) * (PrinterParams.buildPlate.width + 2 * SimParams.margin);
            let y = (ev.clientY - rect.top) / (rect.bottom - rect.top) * (PrinterParams.buildPlate.height + 2 * SimParams.margin);
            let bedX = x - SimParams.margin;
            let bedY = PrinterParams.buildPlate.height - y + SimParams.margin;
            console.log(bedX, bedY);
        }, this.abortController.signal);

        let printParams = {
            fireEveryTicks: 4,
            printFirstLineAfterEncoderTick: 1,
            sequentialFires: 1
        };

        let slicer = new Slicer(polygons, PrinterParams, printParams);
        let x = 15;
        let swathe = slicer.getSwathe(x);
        console.log(swathe);
        this.drawSwathe(x, swathe, printParams);
    }

    drawSwathe(x: number, lineData: Uint32Array, printingParams: PrintingParams) {
        let encoderMMperDot = 25.4 / PrinterParams.encoderDPI;
        let tickAccumulator = printingParams.fireEveryTicks - 1;
        let line = 0;
        for (let tick = printingParams.printFirstLineAfterEncoderTick; tick < PrinterParams.encoderTicksY; tick++) {
            tickAccumulator = (tickAccumulator + 1) % printingParams.fireEveryTicks;
            if (tickAccumulator == 0) {
                for (let fire = 0; fire < printingParams.sequentialFires; fire++) {
                    for (let nozzle = 0; nozzle < numNozzles; nozzle++) {
                        let patternid = Math.floor(nozzle / 32);
                        let bitid = nozzle % 32;
                        if (lineData[line * 4 + patternid] & (1 << bitid)) {
                            let nozzleX = x + ((numNozzles - 1) - nozzle) * PrinterParams.nozzleDistance;
                            let nozzleY = tick * encoderMMperDot + (fire / printingParams.sequentialFires) * encoderMMperDot * printingParams.fireEveryTicks;
                            this.drawCircle(nozzleX, nozzleY, 0.04);
                        }
                    }
                }
                line++;
            }
        }
    }

    insideLayer(polygons: { type: string, points: [number, number][] }[], point: [number, number]) {
        point = this.fromBedCoordinates([point])[0];

        for (let polygon of [...polygons].reverse()) {
            let polygonPoints = this.fromBedCoordinates(polygon.points);
            if (polygon.type === "hole") {
                let insideHole = pointInPolygon(polygonPoints.map(p => p), point) === -1;
                if (insideHole) {
                    return false;
                }
            } else {
                let inside = pointInPolygon(polygonPoints.map(p => p), point) <= 0;
                if (inside) {
                    return true;
                }
            }
        }
        return false;
    }

    fillBed(fn: (bedcoords: [number, number]) => boolean) {
        let origin: [number, number] = [0, 0];
        let target: [number, number] = [PrinterParams.buildPlate.width, PrinterParams.buildPlate.height];
        let originAbs = this.fromBedCoordinates([origin])[0];
        let targetAbs = this.fromBedCoordinates([target])[0];
        console.log(originAbs, targetAbs);
        for (let x = this.mmToDots(originAbs[0]); x < this.mmToDots(targetAbs[0]); x++) {
            for (let y = this.mmToDots(targetAbs[1]); y < this.mmToDots(originAbs[1]); y++) {


                let mmX = x / (this.printCanvas.width) * (PrinterParams.buildPlate.width + 2 * SimParams.margin);
                let mmY = y / (this.printCanvas.height) * (PrinterParams.buildPlate.height + 2 * SimParams.margin);
                let bedX = mmX - SimParams.margin;
                let bedY = PrinterParams.buildPlate.height - mmY + SimParams.margin;

                let bedCoords: [number, number] = [bedX, bedY];
                console.log(bedCoords);
                if (fn(bedCoords)) {
                    this.ctx.fillStyle = "black";
                    this.ctx.fillRect(x, y, 1, 1);
                }
            }
        }
    }

    drawCircle(bedX: number, bedY: number, radius: number) {
        this.ctx.fillStyle = "black";
        this.ctx.beginPath();
        this.ctx.arc(this.mmToDots(SimParams.margin + bedX), this.mmToDots(PrinterParams.buildPlate.height + SimParams.margin - bedY), this.mmToDots(radius), 0, 2 * Math.PI);
        this.ctx.fill();
    }

    drawPolygon(points: [number, number][], fillColor: string) {
        this.ctx.fillStyle = fillColor;
        this.ctx.beginPath();
        this.ctx.moveTo(this.mmToDots(points[0][0]), this.mmToDots(points[0][1]));
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(this.mmToDots(points[i][0]), this.mmToDots(points[i][1]));
        }
        this.ctx.closePath();
        this.ctx.fill();
    }

    mmToDots(mm: number) {
        return mm * SimParams.dotsPerMM;
    }

    setCanvasSize() {
        this.printCanvas.width = this.mmToDots(PrinterParams.buildPlate.width + 2 * SimParams.margin);
        this.printCanvas.height = this.mmToDots(PrinterParams.buildPlate.height + 2 * SimParams.margin);
    }

    drawBuildPlateOutline() {
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = this.mmToDots(0.2);
        this.ctx.strokeRect(this.mmToDots(SimParams.margin), this.mmToDots(SimParams.margin), this.mmToDots(PrinterParams.buildPlate.width), this.mmToDots(PrinterParams.buildPlate.height));
    }

    drawEncoderTicks() {
        let lineLength = 5;
        let margin = 2;
        let encoderLineSpacing = 25.4 / PrinterParams.encoderDPI;
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = this.mmToDots(0.005);
        for (let i = 0; i < PrinterParams.encoderTicksY; i++) {
            let y = this.mmToDots(SimParams.margin + PrinterParams.buildPlate.height - i * encoderLineSpacing);
            this.ctx.beginPath();
            this.ctx.moveTo(this.mmToDots(margin), y);
            this.ctx.lineTo(this.mmToDots(margin + lineLength), y);
            this.ctx.stroke();
        }
    }

    disconnectedCallback() {
        this.abortController.abort();
    }
}

export const PrintSimulationTagName = "print-simulation";
customElements.define(PrintSimulationTagName, PrintSimulation);
