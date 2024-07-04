import { PrintingParams } from "../../slicer/PrintingParams";
import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class PrintingParamsChanged implements Action {
    constructor(public printingParams: Partial<PrintingParams>) { }
    readonly type = ActionType.PrintingParamsChanged;
}
