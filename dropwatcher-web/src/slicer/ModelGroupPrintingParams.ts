import { PrintingParams } from "./PrintingParams";


export interface ModelGroupPrintingParams extends Partial<Pick<PrintingParams, "dryingTimeSeconds" |
    "offsetLayers" |
    "fireEveryTicks" |
    "sequentialFires" |
    "waveform" |
    "skipNozzles"
>> {
}
