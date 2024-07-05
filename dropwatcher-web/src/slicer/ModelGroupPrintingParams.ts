import { PrintingParams } from "./PrintingParams";


export interface ModelGroupPrintingParams extends Pick<PrintingParams, "dryingTime" |
    "offsetLayers" |
    "fireEveryTicks" |
    "sequentialFires"
> {
}
