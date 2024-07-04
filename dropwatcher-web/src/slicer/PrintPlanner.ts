import { Model, ModelParams, Point, PolygonType } from "../state/State";
import { getBoundingBox } from "../utils/getBoundingBox";
import { getPrintheadSwathe } from "./getPrintheadSwathe";
import { TrackRasterizer } from "./TrackRasterizer";
import { SliceModelInfo } from "./SliceModelInfo";
import { TrackPlan } from "./TrackPlan";
import { LayerPlan } from "./LayerPlan";
import { PrintingParams } from "./PrintingParams";
import { PrinterParams } from "./PrinterParams";



export class PrintPlanner {

    private layerMap: Map<number, {
        modelmap: Map<string, SliceModelInfo>;
        plan: LayerPlan;
    }> = new Map();
    private maxLayers: number;
    constructor(private models: Model[],
        private modelParamsDict: { [id: string]: ModelParams; },
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
            minY = Math.min(minY, sliceModelInfo.contourBoundingBoxes.reduce((acc, p) => { return Math.min(acc, p.min[1]); }, minY));
            maxY = Math.max(maxY, sliceModelInfo.contourBoundingBoxes.reduce((acc, p) => { return Math.max(acc, p.max[1]); }, maxY));
            minX = Math.min(minX, sliceModelInfo.contourBoundingBoxes.reduce((acc, p) => { return Math.min(acc, p.min[0]); }, minX));
            maxX = Math.max(maxX, sliceModelInfo.contourBoundingBoxes.reduce((acc, p) => { return Math.max(acc, p.max[0]); }, maxX));
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

console.log("Hi 67")

if (module.hot) {
    module.hot.accept("./PrintPlanner", () => {
        console.log("PrintPlanner hot reload");
    });
}