import pointInPolygon from "robust-point-in-polygon";
import { ModelParams, PolygonType } from "../state/State";
import { getNozzleDistance } from "./getNozzleDistance";
import { PrinterParams } from "./PrinterParams";
import { PrintingParams } from "./PrintingParams";
import { TrackRasterization } from "./TrackRasterization";
import { SliceModelInfo } from "./SliceModelInfo";
import { ModelGroupPrintingParams } from "./ModelGroupPrintingParams";
import { get } from "http";

type BlockedNozzleJets = Set<number>;

export interface CorrectionTrack {
    moveAxisPos: number;
    track: TrackRasterization;
}

export interface TrackRasterizationResult {
    track: TrackRasterization;
    correctionTracks: CorrectionTrack[];
}

export class TrackRasterizer {

    constructor(private map: Map<string, SliceModelInfo>,
        private modelParamsDict: { [id: string]: ModelParams },
        private printerParams: PrinterParams,
        private generalPrintingParams: PrintingParams,
        private modelGroupParams: ModelGroupPrintingParams,
        private layerNr: number) {
    }

    private get printingParams(): PrintingParams {
        return {
            ...this.generalPrintingParams,
            ...this.modelGroupParams
        }
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
                    if (this.insideLayer([nozzleX, nozzleY], nozzle)) {
                        return tick;
                    }
                }
            }
        }
        return null;
    }

    private rasterizeArea(moveAxisPos: number, nozzles: null | number[] = null, startTick: number) {
        let nozzleDistance = getNozzleDistance(this.printerParams);
        let encoderMMperDot = 25.4 / this.printerParams.encoder.printAxis.dpi;

        let line = 0;
        let lastLineWithData = -1;
        let data = new Uint32Array(this.printerParams.encoder.printAxis.ticks * this.printingParams.sequentialFires * 4);
        let blockedNozzleJets = new Set<number>();
        let printLastLineAfterEncoderTick = this.printerParams.encoder.printAxis.ticks;

        data.fill(0);

        for (let tick = startTick; tick < this.printerParams.encoder.printAxis.ticks; tick++) {
            let fireNow = ((tick - startTick) % this.printingParams.fireEveryTicks == 0);
            if (fireNow) {
                for (let fire = 0; fire < this.printingParams.sequentialFires; fire++) {
                    for (let nozzle = 0; nozzle < this.printerParams.numNozzles; nozzle++) {

                        if (nozzles && !nozzles.includes(nozzle)) {
                            continue;
                        }

                        let baseX = moveAxisPos;
                        let baseY = tick * encoderMMperDot + (fire / this.printingParams.sequentialFires) * encoderMMperDot * this.printingParams.fireEveryTicks;
                        let nozzleX = baseX + ((this.printerParams.numNozzles - 1) - nozzle) * nozzleDistance.x;
                        let nozzleY = baseY + ((this.printerParams.numNozzles - 1) - nozzle) * nozzleDistance.y;
                        if (!blockedNozzleJets.has(nozzle) && this.insideLayer([nozzleX, nozzleY], nozzle)) {
                            let isNozzleBlocked = this.printerParams.blockedNozzles.includes(nozzle);
                            if (isNozzleBlocked) {
                                blockedNozzleJets.add(nozzle);
                            } else {
                                let patternid = Math.floor(nozzle / 32);
                                let bitid = nozzle % 32;
                                data[line * 4 + patternid] |= (1 << (bitid));
                            }
                            printLastLineAfterEncoderTick = tick;
                            lastLineWithData = line;
                        }
                    }
                }
                line++;
            }
        }
        data = data.slice(0, (lastLineWithData + 1) * 4);
        return {
            printLastLineAfterEncoderTick: printLastLineAfterEncoderTick,
            linesToPrint: lastLineWithData + 1,
            data: data,
            blockedNozzleJets: blockedNozzleJets
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

        let res = this.rasterizeArea(moveAxisPos, null, printFirstLineAfterEncoderTick);

        let printAxisMovements = this.getPrintAxisMovements(printFirstLineAfterEncoderTick, res.printLastLineAfterEncoderTick);

        let correctionTracks = Array.from(this.findCorrectionTracks(moveAxisPos, res.blockedNozzleJets));
        let track = {
            data: res.data,
            linesToPrint: res.linesToPrint,
            printFirstLineAfterEncoderTick: printFirstLineAfterEncoderTick + offsetThisLayer,
            printLastLineAfterEncoderTick: res.printLastLineAfterEncoderTick,
            startPrintAxisPosition: printAxisMovements.startPrintAxisPosition,
            endPrintAxisPosition: printAxisMovements.endPrintAxisPosition
        }
        return {
            track: track,
            correctionTracks: correctionTracks
        };
    }

    private * findCorrectionTracks(moveAxisPos: number, blockedNozzleJets: BlockedNozzleJets): Iterable<CorrectionTrack> {
        let correctedNozzles = this.findCorrectionMovements(moveAxisPos, blockedNozzleJets);
        let movements = this.selectCorrectionMovements(blockedNozzleJets, correctedNozzles);
        let nozzleDistance = getNozzleDistance(this.printerParams);
        for (let m of movements) {
            let movementByNozzles = m[0];
            let pos = movementByNozzles * nozzleDistance.x + moveAxisPos;
            let correctedNozzles = m[1];
            let correctingNoozzles = correctedNozzles.map(nozzle => nozzle + movementByNozzles);
            let printFirstLineAfterEncoderTick = this.findFirstTickInsideModel(pos, correctingNoozzles);
            let res = this.rasterizeArea(pos, correctingNoozzles, printFirstLineAfterEncoderTick);
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

