import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class PrinterUSBConnectionStateChanged implements Action {
    constructor(public connected: boolean) { }
    readonly type = ActionType.PrinterUSBConnectionStateChanged;
}
