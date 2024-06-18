import pointInPolygon from "robust-point-in-polygon";
import { Model, ModelParams, Point, Polygon, PolygonType } from "../state/State";
import { getNozzleDistance } from "./getNozzleDistance";

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
}

export class TrackSlicer {
    private polygons: {
        polygon: Polygon;
        transformedCoordinates: Point[];
        boundingBox: {
            minX: number; minY: number; maxX: number; maxY: number;
        };
    }[];
    contourBoundingBoxes: { minX: number; minY: number; maxX: number; maxY: number; }[];

    constructor(private model: Model,
        private modelParams: ModelParams,
        private layer: number,
        private printerParams: PrinterParams,
        private printingParams: PrintingParams) {
        this.polygons = [...model.layers[layer]?.polygons || []].reverse().map(p => {
            let transformedCoordinates = this.transformCoordinates(p.points);
            return {
                polygon: p,
                transformedCoordinates: transformedCoordinates,
                boundingBox: this.getBoundingBox(transformedCoordinates)
            };
        });
        this.contourBoundingBoxes = this.polygons.filter(p => p.polygon.type === PolygonType.Contour).map(p => p.boundingBox);
    }

    private transformCoordinates(points: Point[]): Point[] {
        return points.map(([x, y]) => {
            return [x + this.modelParams.position[0], y + this.modelParams.position[1]];
        });
    }

    // private mirrorY(points: Point[]) : Point[] {
    //     let height = (this.model.boundingBox.max[1] - this.model.boundingBox.min[1]);
    //     return points.map(([x, y]) => {
    //         return [x,height - y];
    //     });
    // }

    private getBoundingBox(points: Point[]) {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        for (let [x, y] of points) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        }
        return {
            minX, minY, maxX, maxY
        };
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
        if (!this.contourBoundingBoxes.some(bb => {
            return point[0] >= bb.minX && point[0] <= bb.maxX && point[1] >= bb.minY && point[1] <= bb.maxY;
        })) {
            return false;
        }
        for (let polygon of this.polygons) {
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
}

