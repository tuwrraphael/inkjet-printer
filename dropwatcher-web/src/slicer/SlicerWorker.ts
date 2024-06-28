import { Model, ModelParams } from "../state/State";
import { PrintPlanner, PrinterParams, PrintingParams } from "./TrackSlicer";
import * as Comlink from "comlink"

export class Slicer {
    private printPlanner: PrintPlanner;

    async rasterizeTrack(layer: number, moveAxisPos: number) {
        if (this.printPlanner) {
            let track = this.printPlanner.getTrackRasterizer(layer).rasterize(moveAxisPos);
            return track;
        }
        return null;
    }
    async setParams(printerParams: PrinterParams, printingParams: PrintingParams, models: Model[], modelParams: { [id: string]: ModelParams }) {
        this.printPlanner = new PrintPlanner(models, modelParams, printerParams, printingParams);
    }

    async getCompletePlan() {
        if (this.printPlanner) {
            return this.printPlanner.getCompletePlan();
        }
        return null;
    }
}

Comlink.expose(new Slicer());