import { PrinterSystemStateResponse } from "../../proto/compiled";
import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class PrinterSystemStateResponseReceived implements Action {
    constructor(public response: PrinterSystemStateResponse) { }
    readonly type = ActionType.PrinterSystemStateResponseReceived;
}

