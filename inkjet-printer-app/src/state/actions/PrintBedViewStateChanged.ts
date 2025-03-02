import { PrintBedViewState } from "../State";
import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class PrintBedViewStateChanged implements Action {
    constructor(public state: Partial<PrintBedViewState>) { }
    readonly type = ActionType.PrintBedViewStateChanged;
}
