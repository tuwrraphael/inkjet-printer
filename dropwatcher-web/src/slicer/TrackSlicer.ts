import pointInPolygon from "robust-point-in-polygon";
import { Model, ModelParams, Point, Polygon, PolygonType } from "../state/State";
import { getNozzleDistance } from "./getNozzleDistance";
import { getBoundingBox } from "../utils/getBoundingBox";
import { getPrintheadSwathe } from "./getPrintheadSwathe";

export interface PrinterParams {
    numNozzles: number;
    printheadSwathePerpendicular: number;
    printheadAngleRads: number;
    buildPlate: {
        width: number;
        height: number;
    };
    encoder: {
        printAxis: {
            dpi: number;
            ticks: number;
        };
    };
}

export interface PrintingParams {
    fireEveryTicks: number;
    printFirstLineAfterEncoderTick: number;
    sequentialFires: number;
    firstLayerHeight: number;
    encoderMargin: number;
}

interface SliceModelInfo {
    polygons: {
        polygon: Polygon;
        transformedCoordinates: Point[];
        boundingBox: {
            min: Point;
            max: Point;
        }
    }[],
    contourBoundingBoxes: { min: Point; max: Point; }[];
};

export interface TrackPlan {
    printFirstLineAfterEncoderTick: number;
    printLastLineAfterEncoderTick: number,
    startMoveAxisPosition: number;
    startPrintAxisPosition: number;
    endPrintAxisPosition: number;
    linesToPrint: number;
}

export interface LayerPlan {
    tracks: TrackPlan[];
    increment: number;
}


export class PrintPlanner {

    private layerMap: Map<number, {
        modelmap: Map<string, SliceModelInfo>;
        plan: LayerPlan;
    }> = new Map();
    private maxLayers: number;
    constructor(private models: Model[],
        private modelParamsDict: { [id: string]: ModelParams },
        private printerParams: PrinterParams,
        private printingParams: PrintingParams) {
        this.maxLayers = Math.max(...models.map(m => m.layers.length));
    }

    private transformCoordinates(points: Point[], modelParams: ModelParams): Point[] {
        return points.map(([x, y]) => {
            return [x + modelParams.position[0], y + modelParams.position[1]];
        });
    }

    private getLayer(layer: number) {
        if (this.layerMap.has(layer)) {
            return this.layerMap.get(layer);
        }
        let modelmap = new Map<string, SliceModelInfo>();
        for (let model of this.models) {
            let polygons = [...model.layers[layer]?.polygons || []].reverse().map(p => {
                let transformedCoordinates = this.transformCoordinates(p.points, this.modelParamsDict[model.id]);
                return {
                    polygon: p,
                    transformedCoordinates: transformedCoordinates,
                    boundingBox: getBoundingBox(transformedCoordinates)
                };
            });
            let contourBoundingBoxes = polygons.filter(p => p.polygon.type === PolygonType.Contour).map(p => p.boundingBox);
            modelmap.set(model.id, { polygons, contourBoundingBoxes });
        }
        this.layerMap.set(layer, { modelmap, plan: this.createPlan(modelmap) });
        return this.layerMap.get(layer);
    }

    private createPlan(modelmap: Map<string, SliceModelInfo>): LayerPlan {
        let minY = this.printerParams.buildPlate.height;
        let minX = this.printerParams.buildPlate.width;
        let maxX = 0;
        let maxY = 0;
        for (let [id, sliceModelInfo] of modelmap) {
            minY = Math.min(minY, sliceModelInfo.contourBoundingBoxes.reduce((acc, p) => { return Math.min(acc, p.min[1]) }, minY));
            maxY = Math.max(maxY, sliceModelInfo.contourBoundingBoxes.reduce((acc, p) => { return Math.max(acc, p.max[1]) }, maxY));
            minX = Math.min(minX, sliceModelInfo.contourBoundingBoxes.reduce((acc, p) => { return Math.min(acc, p.min[0]) }, minX));
            maxX = Math.max(maxX, sliceModelInfo.contourBoundingBoxes.reduce((acc, p) => { return Math.max(acc, p.max[0]) }, maxX));
        }
        minX = Math.floor(minX * 100) / 100;
        maxX = Math.ceil(maxX * 100) / 100;
        let increment = getPrintheadSwathe(this.printerParams).x;
        let encoderMMperDot = 25.4 / this.printerParams.encoder.printAxis.dpi;
        let tracks: TrackPlan[] = [];
        for (let moveAxisPosition = minX; moveAxisPosition < maxX; moveAxisPosition += increment) {
            // todo optimize minY, maxY
            let printFirstLineAfterEncoderTick = Math.max(1, Math.floor(minY / encoderMMperDot));
            let printLastLineAfterEncoderTick = Math.ceil(maxY / encoderMMperDot);
            let numLines = Math.ceil((printLastLineAfterEncoderTick - printFirstLineAfterEncoderTick) / this.printingParams.fireEveryTicks) * this.printingParams.sequentialFires;
            let startPrintAxisPosition = Math.max(0, (printFirstLineAfterEncoderTick) * encoderMMperDot - this.printingParams.encoderMargin);
            let endPrintAxisPosition = Math.min(this.printerParams.buildPlate.height, (printLastLineAfterEncoderTick) * encoderMMperDot + this.printingParams.encoderMargin);
            tracks.push({
                endPrintAxisPosition: endPrintAxisPosition,
                linesToPrint: numLines,
                printFirstLineAfterEncoderTick: printFirstLineAfterEncoderTick,
                printLastLineAfterEncoderTick: printLastLineAfterEncoderTick,
                startMoveAxisPosition: moveAxisPosition,
                startPrintAxisPosition: startPrintAxisPosition,
            });
        }
        return {
            increment: increment,
            tracks: tracks
        };
    }

    getTrackRasterizer(layerNr: number): TrackRasterizer {
        let layer = this.getLayer(layerNr);
        return new TrackRasterizer(layer.modelmap, this.modelParamsDict, this.printerParams, this.printingParams, layerNr);
    }

    getCompletePlan(): LayerPlan[] {
        let plans = [];
        for (let i = 0; i < this.maxLayers; i++) {
            let layer = this.getLayer(i);
            plans.push(layer.plan);
        }
        console.log(plans);
        return plans;
    }

    getLayerPlan(layerNr: number): LayerPlan {
        return this.getLayer(layerNr).plan;
    }
}

export interface TrackRasterizationResult {
    data: Uint32Array;
    linesToPrint: number;
    printFirstLineAfterEncoderTick: number;
    printLastLineAfterEncoderTick: number;
    startPrintAxisPosition: number;
    endPrintAxisPosition: number;
}

export class TrackRasterizer {

    constructor(private map: Map<string, SliceModelInfo>,
        private modelParamsDict: { [id: string]: ModelParams },
        private printerParams: PrinterParams,
        private printingParams: PrintingParams,
        private layerNr: number) {
    }

    rasterize(moveAxisPos: number): TrackRasterizationResult {
        let maxOffset = this.printingParams.fireEveryTicks - 1;
        let offset = Math.min(maxOffset, this.modelParamsDict[Object.keys(this.modelParamsDict)[0]].iterativeOffset || 0);
        let offsetThisLayer = this.layerNr * offset % this.printingParams.fireEveryTicks;
        console.log("layer, offsetThisLayer, offset, maxOffset",this.layerNr, offsetThisLayer, offset, maxOffset);
        let nozzleDistance = getNozzleDistance(this.printerParams);
        let data = new Uint32Array(this.printerParams.encoder.printAxis.ticks * this.printingParams.sequentialFires * 4);
        data.fill(0);
        let encoderMMperDot = 25.4 / this.printerParams.encoder.printAxis.dpi;
        let line = 0;
        let lastLineWithData = -1;
        let printFirstLineAfterEncoderTick = 0;
        let printLastLineAfterEncoderTick = this.printerParams.encoder.printAxis.ticks;
        for (let tick = 0; tick < this.printerParams.encoder.printAxis.ticks; tick++) {
            let fireNow = printFirstLineAfterEncoderTick == 0 || ((tick - printFirstLineAfterEncoderTick) % this.printingParams.fireEveryTicks == 0);
            if (fireNow) {
                for (let fire = 0; fire < this.printingParams.sequentialFires; fire++) {
                    for (let nozzle = 0; nozzle < this.printerParams.numNozzles; nozzle++) {
                        let nozzleX = moveAxisPos + ((this.printerParams.numNozzles - 1) - nozzle) * nozzleDistance.x;
                        let nozzleY = tick * encoderMMperDot + (fire / this.printingParams.sequentialFires) * encoderMMperDot * this.printingParams.fireEveryTicks;
                        if (this.insideLayer([nozzleX, nozzleY], nozzle)) {
                            if (printFirstLineAfterEncoderTick == 0) {
                                // first line found
                                line = 0;
                                printFirstLineAfterEncoderTick = tick;
                            }
                            printLastLineAfterEncoderTick = tick;
                            let patternid = Math.floor(nozzle / 32);
                            let bitid = nozzle % 32;
                            data[line * 4 + patternid] |= (1 << (bitid));
                            lastLineWithData = line;
                        }
                    }
                }
                line++;
            }
        }

        data = data.slice(0, (lastLineWithData + 1) * 4);
        console.log(lastLineWithData);
        let startPrintAxisPosition = Math.max(0, (printFirstLineAfterEncoderTick) * encoderMMperDot - this.printingParams.encoderMargin);
        let endPrintAxisPosition = Math.min(this.printerParams.buildPlate.height, (printLastLineAfterEncoderTick) * encoderMMperDot + this.printingParams.encoderMargin);
        return {
            data: data,
            linesToPrint: (lastLineWithData + 1),
            printFirstLineAfterEncoderTick: printFirstLineAfterEncoderTick + offsetThisLayer,
            printLastLineAfterEncoderTick: printLastLineAfterEncoderTick,
            startPrintAxisPosition: startPrintAxisPosition,
            endPrintAxisPosition: endPrintAxisPosition
        }
    }

    private * eligibleForNozzle(nozzleId: number): Iterable<[string, SliceModelInfo]> {
        for (let [id, sliceModelInfo] of this.map) {
            let skipNozzles = (this.modelParamsDict[id].skipNozzles || 0) + 1;
            if (1 == skipNozzles || nozzleId % skipNozzles == 0) {
                yield [id, sliceModelInfo];
            }
        }
    }

    private insideLayer(point: [number, number], nozzleId: number) {
        for (let [modelId, sliceModelInfo] of this.eligibleForNozzle(nozzleId)) {
            if (!sliceModelInfo.contourBoundingBoxes.some(bb => {
                return point[0] >= bb.min[0] && point[0] <= bb.max[0] && point[1] >= bb.min[1] && point[1] <= bb.max[1];
            })) {
                continue;
            }
            for (let polygon of sliceModelInfo.polygons) {
                let polygonPoints = polygon.transformedCoordinates;
                if (polygon.polygon.type === PolygonType.Hole) {
                    let insideHole = pointInPolygon(polygonPoints.map(p => p), point) === -1;
                    if (insideHole) {
                        break;
                    }
                } else {
                    let inside = pointInPolygon(polygonPoints.map(p => p), point) <= 0;
                    if (inside) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}

