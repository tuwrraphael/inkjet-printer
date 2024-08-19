import pointInPolygon from "robust-point-in-polygon";
import { ModelParams, Point, Polygon, PolygonType } from "../state/State";
import { getNozzleDistance } from "./getNozzleDistance";
import { PrinterParams } from "./PrinterParams";
import { PrintingParams } from "./PrintingParams";
import { SliceModelInfo } from "./SliceModelInfo";
import { ModelGroupPrintingParams } from "./ModelGroupPrintingParams";
import { getPrintingParams } from "./getPrintingParams";
import { TrackRasterizer } from "./TrackRasterizer";
import { CorrectionTrack } from "./CorrectionTrack";
import { TrackRasterizationResult } from "./TrackRasterizationResult";
import { getPrintheadSwathe } from "./getPrintheadSwathe";
import { PointInPolygonTrackRasterizer } from "./PointInPolygonTrackRasterizer";
import { is } from "date-fns/locale";

type BlockedNozzleJets = Set<number>;

export class ScanlineTrackRasterizer implements TrackRasterizer {

    constructor(private map: Map<string, SliceModelInfo>,
        private modelParamsDict: { [id: string]: ModelParams },
        private printerParams: PrinterParams,
        private generalPrintingParams: PrintingParams,
        private modelGroupParams: ModelGroupPrintingParams,
        private layerNr: number) {
    }

    private get printingParams(): PrintingParams {
        return getPrintingParams(
            this.generalPrintingParams,
            this.modelGroupParams
        );
    }

    private findFirstTickInsideModel(moveAxisPos: number, nozzles: null | number[] = null) {
        let nozzleDistance = getNozzleDistance(this.printerParams);
        let encoderMMperDot = 25.4 / this.printerParams.encoder.printAxis.dpi;

        for (let tick = 0; tick < this.printerParams.encoder.printAxis.ticks; tick++) {
            for (let fire = 0; fire < this.printingParams.sequentialFires; fire++) {
                for (let nozzle = 0; nozzle < this.printerParams.numNozzles; nozzle++) {
                    if (nozzles && !nozzles.includes(nozzle)) {
                        continue;
                    }
                    let baseX = moveAxisPos;
                    let baseY = tick * encoderMMperDot + (fire / this.printingParams.sequentialFires) * encoderMMperDot * this.printingParams.fireEveryTicks;
                    let nozzleX = baseX + ((this.printerParams.numNozzles - 1) - nozzle) * nozzleDistance.x;
                    let nozzleY = baseY + ((this.printerParams.numNozzles - 1) - nozzle) * nozzleDistance.y;
                    if (this.insideLayer([nozzleX, nozzleY])) {
                        return tick;
                    }
                }
            }
        }
        return null;
    }

    private getContainingBoundingBox(): { min: Point; max: Point; } {
        let min: Point = [Infinity, Infinity];
        let max: Point = [-Infinity, -Infinity];
        for (let [modelId, sliceModelInfo] of this.map) {
            for (let bb of sliceModelInfo.contourBoundingBoxes) {
                min = [Math.min(min[0], bb.min[0]), Math.min(min[1], bb.min[1])];
                max = [Math.max(max[0], bb.max[0]), Math.max(max[1], bb.max[1])];
            }
        }
        return { min: min, max: max };
    }

    private getIntersection(p1: Point, p2: Point, p3: Point, p4: Point): Point {
        let epsilon = 0.0001;
        let x1 = p1[0];
        let y1 = p1[1];
        let x2 = p2[0];
        let y2 = p2[1];
        let x3 = p3[0];
        let y3 = p3[1];
        let x4 = p4[0];
        let y4 = p4[1];
        let x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) /
            ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
        let y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) /
            ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));


        let isOnLine1 = x >= Math.min(x1, x2) - epsilon && x <= Math.max(x1, x2) + epsilon && y >= Math.min(y1, y2) - epsilon && y <= Math.max(y1, y2) + epsilon;
        let isOnLine2 = x >= Math.min(x3, x4) - epsilon && x <= Math.max(x3, x4) + epsilon && y >= Math.min(y3, y4) - epsilon && y <= Math.max(y3, y4) + epsilon;

        if (isOnLine1 && isOnLine2) {
            return [x, y];
        } else {
            return null;
        }
    }

    private getEdges(polygon: Point[]): [Point, Point][] {
        let edges: [Point, Point][] = [];
        let points = polygon;
        for (let i = 0; i < points.length; i++) {
            let p1 = points[i];
            let p2 = points[(i + 1) % points.length];
            if (p1[1] > p2[1]) {
                edges.push([p2, p1]);
            } else {
                edges.push([p1, p2]);
            }
        }
        // if (points[0][1] > points[points.length - 1][1]) {
        //     edges.push([points[points.length - 1], points[0]]);
        // } else {
        //     edges.push([points[0], points[points.length - 1]]);
        // }
        return edges;
    }


    private getIntersections(polygon: Point[], moveAxisPos: number, mmPerTick: number) {
        let edges = this.getEdges(polygon).sort((a, b) => b[0][1] - a[0][1]);
        let intersections = new Map<number, {
            intersection: Point,
            edge: [Point, Point],
            vectorToNextIntersection: Point,
            ny: number, // anzahl der scanlines, die geschnitten werden
        }[]>();
        let swathe = getPrintheadSwathe(this.printerParams);
        let edge: [Point, Point];
        for (edge of edges) {
            let highestPossibleIntersectionTick = Math.ceil((edge[0][1] + swathe.y) / mmPerTick);
            let lowestPossibleIntersectionTick = Math.min(0, Math.floor(edge[1][1] / mmPerTick)); // math.max!
            let scanline: { start: Point, end: Point } = { start: [moveAxisPos, highestPossibleIntersectionTick * mmPerTick], end: [moveAxisPos + swathe.x, highestPossibleIntersectionTick * mmPerTick + swathe.y] };
            let tick = highestPossibleIntersectionTick;
            while (scanline.start[1] > lowestPossibleIntersectionTick * mmPerTick) {

                let intersection = this.getIntersection(edge[0], edge[1], scanline.start, scanline.end);
                if (intersection) {
                    let nextScanline: { start: Point, end: Point } = { start: [moveAxisPos, (tick - 1) * mmPerTick], end: [moveAxisPos + swathe.x, (tick - 1) * mmPerTick + swathe.y] };

                    let ny = 0;
                    let vectorToNextIntersection: Point = [0, 0];
                    let nextIntersection = this.getIntersection(edge[0], edge[1], nextScanline.start, nextScanline.end);
                    if (nextIntersection) {
                        vectorToNextIntersection = [nextIntersection[0] - intersection[0], nextIntersection[1] - intersection[1]];
                        let nextIsOnEdge = false;
                        ny++;
                        let epsilon = 0.0001;
                        let next : Point = [nextIntersection[0], nextIntersection[1]];
                        do {
                            ny++;
                            next = [next[0] + vectorToNextIntersection[0], next[1] + vectorToNextIntersection[1]];
                            nextIsOnEdge = next[0] >= Math.min(edge[0][0], edge[1][0]) - epsilon && next[0] <= Math.max(edge[0][0], edge[1][0]) + epsilon && next[1] >= Math.min(edge[0][1], edge[1][1]) - epsilon && next[1] <= Math.max(edge[0][1], edge[1][1]) + epsilon;
                        } while (nextIsOnEdge);
                    }
                    let add = { intersection: intersection, edge: edge, vectorToNextIntersection: vectorToNextIntersection, ny: ny };
                    if (!intersections.has(tick)) {
                        intersections.set(tick, []);
                    }
                    intersections.get(tick).push(add);
                    break;
                }
                tick--;
                scanline.start[1] = tick * mmPerTick;
                scanline.end[1] = scanline.start[1] + swathe.y;
            }
        }
        return intersections;
    }

    private *getSpans(moveAxisPos: number): Iterable<{ tick: number, spans: { start: number, end: number }[] }> {
        let mmPerTick = 25.4 / this.printerParams.encoder.printAxis.dpi;

        let swathe = getPrintheadSwathe(this.printerParams);

        let intersections = Array.from(this.map.values()).map(sliceModelInfo => {
            return sliceModelInfo.polygons.map(polygon => {
                return this.getIntersections(polygon.transformedCoordinates, moveAxisPos, mmPerTick);
            });
        }).flat();


        let tick = this.printerParams.encoder.printAxis.ticks;
        let activeEdges: {
            intersection: Point,
            edge: [Point, Point],
            vectorToNextIntersection: Point,
            ny: number, // anzahl der scanlines, die geschnitten werden,
            insertedTick: number
        }[] = [];
        while (tick > 0) { // todo lower bound from intersections + ny
            for (let intersectionMap of intersections) {
                if (intersectionMap.has(tick)) {
                    let intersections = intersectionMap.get(tick);
                    for (let intersection of intersections) {
                        activeEdges.push({ ...intersection, insertedTick: tick });
                    }
                }
            }
            let sorted = activeEdges.sort((a, b) => a.intersection[0] - b.intersection[0]);
            let spans: { start: number, end: number }[] = [];
            let currentSpanStart = null;
            for (let activeEdge of sorted) {
                let x = activeEdge.intersection[0] + activeEdge.vectorToNextIntersection[0] * (activeEdge.insertedTick - tick);
                if (currentSpanStart == null) {
                    currentSpanStart = x;
                } else {
                    spans.push({ start: currentSpanStart, end: x });
                    currentSpanStart = null;
                }
                activeEdge.ny--;
            }
            if (currentSpanStart != null) {
                spans.push({ start: currentSpanStart, end: moveAxisPos + swathe.x });
            }
            if (spans.length > 0) {
                yield { tick: tick, spans: spans };
            }
            activeEdges = activeEdges.filter(activeEdge => activeEdge.ny > 0);
            tick--;
        }
    }


    private setNozzle(data: Uint32Array, line: number, nozzle: number) {
        let patternid = Math.floor(nozzle / 32);
        let bitid = nozzle % 32;
        data[line * 4 + patternid] |= (1 << (bitid));
    }

    private writeNozzleDataForSpan(data: Uint32Array, line: number, moveAxisPos: number, from: number, to: number) {
        let nozzleDistance = getNozzleDistance(this.printerParams);

        let startNozzle = Math.floor((from - moveAxisPos) / nozzleDistance.x);
        let endNozzle = Math.floor((to - moveAxisPos) / nozzleDistance.x);
        let startReverse = 127 - endNozzle;
        let endReverse = 127 - startNozzle;
        for (let nozzle = startReverse; nozzle <= endReverse; nozzle++) {
            this.setNozzle(data, line, nozzle);
        }
    }

    private rasterizeArea(moveAxisPos: number, nozzles: null | number[] = null) {

        let data: Uint32Array;

        let printLastLineAfterEncoderTick: number = null;
        let firstLineWithData: number = null;
        let offset: number = null;
        let spans = Array.from(this.getSpans(moveAxisPos));
        let mmPerTickPrintAxis = 25.4 / this.printerParams.encoder.printAxis.dpi;
        console.log("spans", spans.map(s => [s.tick, s.tick * mmPerTickPrintAxis, s.spans.map(s => [s.start, s.end])]));
        for (let span of spans) {
            if (printLastLineAfterEncoderTick == null) {
                printLastLineAfterEncoderTick = span.tick;
                offset = printLastLineAfterEncoderTick % this.printingParams.fireEveryTicks;
                data = new Uint32Array((printLastLineAfterEncoderTick - offset) / this.printingParams.fireEveryTicks * this.printingParams.sequentialFires * 4);
                data.fill(0);
            }
            let fireNow = (printLastLineAfterEncoderTick - span.tick) % this.printingParams.fireEveryTicks == 0;
            if (!fireNow) {
                continue;
            }
            for (let s of span.spans) {
                let line = ((span.tick - offset) / this.printingParams.fireEveryTicks) - 1;
                firstLineWithData = line;
                this.writeNozzleDataForSpan(data, line, moveAxisPos, s.start, s.end);
            }
        }
        // data = data.slice(firstLineWithData);
        return {
            printLastLineAfterEncoderTick: printLastLineAfterEncoderTick,
            linesToPrint: data.length / 4,
            data: data,
            blockedNozzleJets: new Set<number>()
        };
    }

    private getPrintAxisMovements(printFirstLineAfterEncoderTick: number, printLastLineAfterEncoderTick: number) {
        let encoderMMperDot = 25.4 / this.printerParams.encoder.printAxis.dpi;
        let startPrintAxisPosition = Math.max(0, (printFirstLineAfterEncoderTick) * encoderMMperDot - this.printingParams.encoderMargin);
        let endPrintAxisPosition = Math.min(this.printerParams.buildPlate.height, (printLastLineAfterEncoderTick) * encoderMMperDot + this.printingParams.encoderMargin);
        return {
            startPrintAxisPosition: startPrintAxisPosition,
            endPrintAxisPosition: endPrintAxisPosition
        };
    }

    rasterize(moveAxisPos: number): TrackRasterizationResult {
        let maxOffset = this.printingParams.fireEveryTicks - 1;
        let offset = Math.min(maxOffset, this.printingParams.offsetLayers.printAxis.everyOtherLayerByTicks || 0);
        let isOtherLayer = this.layerNr % 2 == 1;
        let offsetThisLayer = isOtherLayer ? offset : 0;

        let printFirstLineAfterEncoderTick = this.findFirstTickInsideModel(moveAxisPos) + offsetThisLayer;

        let useNozzles = new Array(this.printerParams.numNozzles).fill(0).map((_, i) => i).filter(nozzleId => {
            if (null == this.printingParams.skipNozzles) {
                return true;
            } else {
                let nozzleOffset = this.printingParams.offsetLayers.moveAxis.everyOtherLayerByNozzles || 0;
                let nozzleOffsetThisLayer = isOtherLayer ? nozzleOffset : 0;
                return (nozzleId + nozzleOffsetThisLayer) % (this.printingParams.skipNozzles + 1) == 0;
            }
        });

        let res = this.rasterizeArea(moveAxisPos, useNozzles);

        let printAxisMovements = this.getPrintAxisMovements(printFirstLineAfterEncoderTick, res.printLastLineAfterEncoderTick);

        let correctionTracks = Array.from(this.findCorrectionTracks(moveAxisPos, res.blockedNozzleJets, offsetThisLayer));
        let track = {
            data: res.data,
            linesToPrint: res.linesToPrint,
            printFirstLineAfterEncoderTick: 0,
            printLastLineAfterEncoderTick: res.printLastLineAfterEncoderTick,
            startPrintAxisPosition: printAxisMovements.startPrintAxisPosition,
            endPrintAxisPosition: printAxisMovements.endPrintAxisPosition
        }
        return {
            track: track,
            correctionTracks: correctionTracks,
            printingParams: this.printingParams
        };
    }

    private * findCorrectionTracks(moveAxisPos: number, blockedNozzleJets: BlockedNozzleJets, offsetThisLayer: number): Iterable<CorrectionTrack> {
        let correctedNozzles = this.findCorrectionMovements(moveAxisPos, blockedNozzleJets);
        let movements = this.selectCorrectionMovements(blockedNozzleJets, correctedNozzles);
        let nozzleDistance = getNozzleDistance(this.printerParams);
        for (let m of movements) {
            let movementByNozzles = m[0];
            let pos = movementByNozzles * nozzleDistance.x + moveAxisPos;
            let correctedNozzles = m[1];
            let correctingNoozzles = correctedNozzles.map(nozzle => nozzle + movementByNozzles);
            let printFirstLineAfterEncoderTick = this.findFirstTickInsideModel(pos, correctingNoozzles) + offsetThisLayer;
            let res = this.rasterizeArea(pos, correctingNoozzles);
            let printAxisMovements = this.getPrintAxisMovements(printFirstLineAfterEncoderTick, res.printLastLineAfterEncoderTick);
            yield {
                moveAxisPos: pos,
                track: {
                    data: res.data,
                    linesToPrint: res.linesToPrint,
                    printFirstLineAfterEncoderTick: printFirstLineAfterEncoderTick,
                    printLastLineAfterEncoderTick: res.printLastLineAfterEncoderTick,
                    startPrintAxisPosition: printAxisMovements.startPrintAxisPosition,
                    endPrintAxisPosition: printAxisMovements.endPrintAxisPosition
                }
            };
        }
    }

    private findCorrectionMovements(moveAxisPos: number, blockedNozzleJets: BlockedNozzleJets): Map<number, number[]> {
        let nozzleDistance = getNozzleDistance(this.printerParams);
        let correctedNozzles = new Map<number, number[]>();
        let blocked = Array.from(blockedNozzleJets.keys());
        for (let moveByNozzles = 1; moveByNozzles < this.printerParams.numNozzles; moveByNozzles++) {
            let movePositivePossible = moveAxisPos + moveByNozzles * nozzleDistance.x <= this.printerParams.buildPlate.width;
            let moveNegativePossible = moveAxisPos - moveByNozzles * nozzleDistance.x >= 0;
            if (movePositivePossible) {
                let correctingNozzles = blocked.map(nozzle => nozzle + moveByNozzles)
                    .filter(nozzle => !this.printerParams.blockedNozzles.includes(nozzle) && nozzle >= 0 && nozzle < this.printerParams.numNozzles);
                correctedNozzles.set(moveByNozzles, correctingNozzles.map(nozzle => nozzle - moveByNozzles));
            }
            if (moveNegativePossible) {
                let correctingNozzles = blocked.map(nozzle => nozzle - moveByNozzles)
                    .filter(nozzle => !this.printerParams.blockedNozzles.includes(nozzle) && nozzle >= 0 && nozzle < this.printerParams.numNozzles);
                correctedNozzles.set(-moveByNozzles, correctingNozzles.map(nozzle => nozzle + moveByNozzles));
            }
        }
        return correctedNozzles;
    }

    private selectCorrectionMovements(blockedNozzleJets: BlockedNozzleJets, correctionMovements: Map<number, number[]>) {
        let movements = [];
        let entries = Array.from(correctionMovements.entries()).filter(([movement, nozzles]) => nozzles.length > 0);
        while (entries.length > 0) {
            let bestCandidates = entries.sort(([movementA, b], [movementB, d]) => d.length - b.length);
            let best = bestCandidates.filter(([movement, nozzles]) => nozzles.length == bestCandidates[0][1].length)
                .sort(([movementA, b], [movementB, d]) => Math.abs(movementA) - Math.abs(movementB));
            let selected = best[0];
            console.log("selected", selected);
            movements.push(selected);
            entries = entries.map(([movement, nozzles]) => {
                let r: [number, number[]] = [movement, nozzles.filter(nozzle => !selected[1].includes(nozzle))];
                return r;
            }).filter(([movement, nozzles]) => nozzles.length > 0);
        }
        return movements;
    }

    private insideLayer(point: [number, number]) {
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

