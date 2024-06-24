import pointInPolygon from "robust-point-in-polygon";
import { Model, ModelParams, Point, Polygon, PolygonType } from "../state/State";
import { getNozzleDistance } from "./getNozzleDistance";
import { getBoundingBox } from "../utils/getBoundingBox";

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
}

interface SliceModelInfo {
    polygons: {
        polygon: Polygon;
        transformedCoordinates: Point[];
        boundingBox: {
            min:Point;
            max:Point;
        }
    }[],
    contourBoundingBoxes: { min: Point; max: Point; }[];
};

export class TrackSlicer {
    private map: Map<string, SliceModelInfo> = new Map();

    constructor(private models: Model[],
        private modelParamsDict: { [id: string]: ModelParams },
        private layer: number,
        private printerParams: PrinterParams,
        private printingParams: PrintingParams) {
        for (let model of models) {
            let polygons = [...model.layers[layer]?.polygons || []].reverse().map(p => {
                let transformedCoordinates = this.transformCoordinates(p.points, modelParamsDict[model.id]);
                return {
                    polygon: p,
                    transformedCoordinates: transformedCoordinates,
                    boundingBox: getBoundingBox(transformedCoordinates)
                };
            });
            let contourBoundingBoxes = polygons.filter(p => p.polygon.type === PolygonType.Contour).map(p => p.boundingBox);
            this.map.set(model.id, { polygons, contourBoundingBoxes });
        }
    }

    private transformCoordinates(points: Point[], modelParams: ModelParams): Point[] {
        return points.map(([x, y]) => {
            return [x + modelParams.position[0], y + modelParams.position[1]];
        });
    }

    getTrack(x: number): Uint32Array {
        let nozzleDistance = getNozzleDistance(this.printerParams);
        let lines = Math.ceil((this.printerParams.encoder.printAxis.ticks - this.printingParams.printFirstLineAfterEncoderTick) / this.printingParams.fireEveryTicks) * this.printingParams.sequentialFires;
        console.log(lines);
        let swathe = new Uint32Array(lines * 4);
        swathe.fill(0);
        let encoderMMperDot = 25.4 / this.printerParams.encoder.printAxis.dpi;
        let tickAccumulator = this.printingParams.fireEveryTicks - 1;
        let line = 0;
        for (let tick = this.printingParams.printFirstLineAfterEncoderTick; tick < this.printerParams.encoder.printAxis.ticks; tick++) {
            tickAccumulator = (tickAccumulator + 1) % this.printingParams.fireEveryTicks;
            if (tickAccumulator == 0) {
                for (let fire = 0; fire < this.printingParams.sequentialFires; fire++) {
                    for (let nozzle = 0; nozzle < this.printerParams.numNozzles; nozzle++) {
                        let nozzleX = x + ((this.printerParams.numNozzles - 1) - nozzle) * nozzleDistance;
                        let nozzleY = tick * encoderMMperDot + (fire / this.printingParams.sequentialFires) * encoderMMperDot * this.printingParams.fireEveryTicks;
                        if (this.insideLayer([nozzleX, nozzleY])) {
                            let patternid = Math.floor(nozzle / 32);
                            let bitid = nozzle % 32;
                            swathe[line * 4 + patternid] |= (1 << (bitid));
                        }
                    }
                }
                line++;
            }
        }
        return swathe;
    }

    insideLayer(point: [number, number]) {
        for (let [modelId, sliceModelInfo] of this.map) {
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
        return false;
    }
}

