import { Model, ModelParams } from "../state/State";
import { PrintingParams } from "./PrintingParams";
import { PrinterParams } from "./PrinterParams";
import { PrintPlanner } from "./PrintPlanner";
import * as Comlink from "comlink"

export class Slicer {
    private printPlanner: PrintPlanner;

    private printerParams: PrinterParams;
    private printingParams: PrintingParams;
    private models: Model[];
    private modelParams: { [id: string]: ModelParams };

    async rasterizeTrack(layer: number, moveAxisPos: number) {
        if (this.printPlanner) {
            let track = this.printPlanner.getTrackRasterizer(layer).rasterize(moveAxisPos);
            return track;
        }
        return null;
    }
    async setParams(printerParams: PrinterParams, printingParams: PrintingParams, models: Model[], modelParams: { [id: string]: ModelParams }) {
        this.printerParams = printerParams;
        this.printingParams = printingParams;
        this.models = models;
        this.modelParams = modelParams;
        this.printPlanner = new PrintPlanner(models, modelParams, printerParams, printingParams);
    }

    refreshPrintPlanner() {
        this.printPlanner = new PrintPlanner(this.models, this.modelParams, this.printerParams, this.printingParams);
    }

    async getCompletePlan() {
        if (this.printPlanner) {
            return this.printPlanner.getCompletePlan();
        }
        return null;
    }
}

const slicer = new Slicer();

console.log("SlicerWorker loaded2", module.hot);
if (module.hot) {
    module.hot.accept();
    module.hot.accept("./PrintPlanner", () => {
        slicer.refreshPrintPlanner();
    });
}


Comlink.expose(slicer);