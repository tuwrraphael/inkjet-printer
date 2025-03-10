import { Model, ModelParams, Point, PolygonType } from "../state/State";
import { getBoundingBox } from "../utils/getBoundingBox";
import { getPrintheadSwathe } from "./getPrintheadSwathe";
import { PointInPolygonTrackRasterizer } from "./PointInPolygonTrackRasterizer";
import { TrackRasterizer } from "./TrackRasterizer";
import { SliceModelInfo } from "./SliceModelInfo";
import { TrackPlan } from "./TrackPlan";
import { LayerPlan, ModelGroupPlan, PrintPlan } from "./LayerPlan";
import { PrintingParams } from "./PrintingParams";
import { PrinterParams } from "./PrinterParams";
import { ModelGroupPrintingParams } from "./ModelGroupPrintingParams";
import { ScanlineTrackRasterizer } from "./ScanlineTrackRasterizer";
import { SplitMix32 } from "./splitmix32";
export class PrintPlanner {

    private layerMap: Map<number, {
        modelmap: Map<string, SliceModelInfo>;
        plan: LayerPlan;
    }> = new Map();
    private maxLayers: number;
    private rng = new SplitMix32(4211531641);
    private layerOffsetRandomNr = new Map<number, number>();
    private rasterizerRandomState = new Map<number, number>();
    constructor(private models: Model[],
        private modelParamsDict: { [id: string]: ModelParams; },
        private printerParams: PrinterParams,
        private printingParams: PrintingParams,
        private modelGroupParamsDict: { [id: string]: ModelGroupPrintingParams; }) {
        this.maxLayers = Math.max(...models.map(m => m.layers.length));
        for (let i = 0; i < this.maxLayers; i++) {
            this.layerOffsetRandomNr.set(i, this.rng.next());
        }
        for (let i = 0; i < this.maxLayers; i++) {
            this.rng.next();
            this.rasterizerRandomState.set(i, this.rng.state);
        }
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
            let modelParams = this.modelParamsDict[model.id];
            modelmap.set(model.id, { polygons, contourBoundingBoxes, modelGroupId: modelParams.modelGroupId });
        }
        this.layerMap.set(layer, {
            modelmap, plan: {
                modelGroupPlans: Array.from(this.estimateModelGroupPlans(modelmap, this.layerOffsetRandomNr.get(layer))),
            }
        });
        return this.layerMap.get(layer);
    }

    private *estimateModelGroupPlans(modelmap: Map<string, SliceModelInfo>, randomNr: number): IterableIterator<ModelGroupPlan> {
        let modelGroupIds = new Set(Array.from(modelmap.values()).map(m => m.modelGroupId));
        for (let modelGroupId of modelGroupIds) {
            let modelGroupParams = this.modelGroupParamsDict[modelGroupId] || null;
            let printingParams = { ...this.printingParams, ...modelGroupParams };
            let modelMap = new Map(Array.from(modelmap.entries()).filter(([id, sliceInfo]) => modelGroupId === sliceInfo.modelGroupId));
            let tracks = this.estimateModelGroupTracks(modelMap, randomNr);
            if (tracks.length > 0) {
                yield {
                    modelGroupId: modelGroupId,
                    tracks: tracks,
                    printingParams: printingParams
                };
            }
        }
    }

    private estimateModelGroupTracks(modelmap: Map<string, SliceModelInfo>, randomNr: number): TrackPlan[] {
        if (modelmap.size === 0) {
            return [];
        }
        let minY = this.printerParams.buildPlate.height;
        let minX = this.printerParams.buildPlate.width;
        let maxX = 0;
        let maxY = 0;
        for (let [id, sliceModelInfo] of modelmap) {
            minY = Math.min(minY, sliceModelInfo.contourBoundingBoxes.reduce((acc, p) => { return Math.min(acc, p.min[1]); }, minY));
            maxY = Math.max(maxY, sliceModelInfo.contourBoundingBoxes.reduce((acc, p) => { return Math.max(acc, p.max[1]); }, maxY));
            minX = Math.min(minX, sliceModelInfo.contourBoundingBoxes.reduce((acc, p) => { return Math.min(acc, p.min[0]); }, minX));
            maxX = Math.max(maxX, sliceModelInfo.contourBoundingBoxes.reduce((acc, p) => { return Math.max(acc, p.max[0]); }, maxX));
        }
        minX = Math.floor(minX * 100) / 100;
        maxX = Math.ceil(maxX * 100) / 100;
        let swathe = getPrintheadSwathe(this.printerParams);
        let increment = swathe.x;
        let encoderMMperDot = 25.4 / this.printerParams.encoder.printAxis.dpi;
        let tracks: TrackPlan[] = [];
        minX = Math.max(0, minX);
        let offset = this.printingParams.randomizeTracks ? randomNr * Math.min(swathe.x, minX) * -1 : 0;
        offset = Math.floor(offset * 100) / 100;
        minX += offset;
        for (let moveAxisPosition = minX; moveAxisPosition < maxX; moveAxisPosition += increment) {
            // todo optimize minY, maxY
            let printFirstLineAfterEncoderTick = Math.max(1, Math.floor(minY / encoderMMperDot));
            let printLastLineAfterEncoderTick = Math.ceil(maxY / encoderMMperDot);
            let startPrintAxisPosition = Math.max(0, (printFirstLineAfterEncoderTick) * encoderMMperDot - this.printingParams.encoderMargin - swathe.y);
            let endPrintAxisPosition = Math.min(this.printerParams.buildPlate.height, (printLastLineAfterEncoderTick) * encoderMMperDot + this.printingParams.encoderMargin);
            tracks.push({
                endPrintAxisPosition: endPrintAxisPosition,
                moveAxisPosition: moveAxisPosition,
                startPrintAxisPosition: startPrintAxisPosition,
            });
        }
        return tracks;
    }

    getTrackRasterizer(modelGroupId: string, layerNr: number): TrackRasterizer {
        let layer = this.getLayer(layerNr);
        let modelGroupParams = this.modelGroupParamsDict[modelGroupId] || null;
        let modelMap = new Map(Array.from(layer.modelmap.entries()).filter(([id, sliceInfo]) => modelGroupId === sliceInfo.modelGroupId));
        // return new ScanlineTrackRasterizer(modelMap, this.modelParamsDict, this.printerParams, this.printingParams, modelGroupParams, layerNr);
        let rasterizerRng = () => new SplitMix32(this.rasterizerRandomState.get(layerNr)).next();
        return new PointInPolygonTrackRasterizer(modelMap, this.modelParamsDict, this.printerParams, this.printingParams, modelGroupParams, layerNr, rasterizerRng);
    }

    getPrintPlan(): PrintPlan {
        let layerPlans = [];
        for (let i = 0; i < this.maxLayers; i++) {
            let layer = this.getLayer(i);
            layerPlans.push(layer.plan);
        }
        return {
            layers: layerPlans
        };
    }

    getLayerPlan(layerNr: number): LayerPlan {
        return this.getLayer(layerNr).plan;
    }
}