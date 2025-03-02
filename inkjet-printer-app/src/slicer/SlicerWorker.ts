import { Model, ModelParams } from "../state/State";
import { PrintingParams } from "./PrintingParams";
import { PrinterParams } from "./PrinterParams";
import { PrintPlanner } from "./PrintPlanner";
import * as Comlink from "comlink"
import { ModelGroupPrintingParams } from "./ModelGroupPrintingParams";

export class Slicer {
    private printPlanner: PrintPlanner;

    private printerParams: PrinterParams;
    private printingParams: PrintingParams;
    private models: Model[];
    private modelParams: { [id: string]: ModelParams };
    private modelGroupParams: { [id: string]: ModelGroupPrintingParams; };

    async rasterizeTrack(modelGroupId: string, layer: number, moveAxisPos: number) {
        if (this.printPlanner) {
            let track = this.printPlanner.getTrackRasterizer(modelGroupId, layer).rasterize(moveAxisPos);
            return track;
        }
        return null;
    }
    async setParams(printerParams: PrinterParams,
        printingParams: PrintingParams,
        models: Model[],
        modelParams: { [id: string]: ModelParams },
        modelGroupParams: { [id: string]: ModelGroupPrintingParams }) {
        this.printerParams = printerParams;
        this.printingParams = printingParams;
        this.models = models;
        this.modelParams = modelParams;
        this.modelGroupParams = modelGroupParams;
        this.printPlanner = new PrintPlanner(models, modelParams, printerParams, printingParams, modelGroupParams);
    }

    refreshPrintPlanner() {
        this.printPlanner = new PrintPlanner(this.models, this.modelParams, this.printerParams, this.printingParams, this.modelGroupParams);
    }

    async getPrintPlan() {
        if (this.printPlanner) {
            return this.printPlanner.getPrintPlan();
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