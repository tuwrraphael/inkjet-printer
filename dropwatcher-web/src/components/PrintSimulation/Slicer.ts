import pointInPolygon from "robust-point-in-polygon";
import { Polygon, Point, PrinterParams, PrintingParams, PolygonType, numNozzles } from "./PrintSimulation";

export class Slicer {
    private polygons: { polygon: Polygon; transformedCoordinates: Point[]; boundingBox: { minX: number; minY: number; maxX: number; maxY: number; }; }[];
    contourBoundingBoxes: { minX: number; minY: number; maxX: number; maxY: number; }[];

    constructor(polygons: Polygon[],
        private printerParams: typeof PrinterParams,
        private printingParams: PrintingParams) {
        this.polygons = [...polygons].reverse().map(p => {
            return {
                polygon: p,
                transformedCoordinates: p.points,
                boundingBox: this.getBoundingBox(p.points)
            };
        });
        this.contourBoundingBoxes = this.polygons.filter(p => p.polygon.type === PolygonType.Contour).map(p => p.boundingBox);
        console.log(this.contourBoundingBoxes);
    }

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

    getSwathe(x: number): Uint32Array {
        let lines = Math.ceil((this.printerParams.encoderTicksY - this.printingParams.printFirstLineAfterEncoderTick) / this.printingParams.fireEveryTicks) * this.printingParams.fireEveryTicks;
        console.log(`Lines: ${lines}`);
        let swathe = new Uint32Array(lines * 4);
        swathe.fill(0);
        let encoderMMperDot = 25.4 / this.printerParams.encoderDPI;
        let tickAccumulator = this.printingParams.fireEveryTicks - 1;
        let line = 0;
        for (let tick = this.printingParams.printFirstLineAfterEncoderTick; tick < this.printerParams.encoderTicksY; tick++) {
            tickAccumulator = (tickAccumulator + 1) % this.printingParams.fireEveryTicks;
            if (tickAccumulator == 0) {
                for (let fire = 0; fire < this.printingParams.sequentialFires; fire++) {
                    for (let nozzle = 0; nozzle < numNozzles; nozzle++) {
                        let nozzleX = x + ((numNozzles - 1) - nozzle) * this.printerParams.nozzleDistance;
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
