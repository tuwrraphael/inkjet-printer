import { PrintingParams } from "../../slicer/TrackSlicer";
import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class PrintingParamsChanged implements Action {
    constructor(public printingParams: Partial<PrintingParams>) { }
    readonly type = ActionType.PrintingParamsChanged;
}
