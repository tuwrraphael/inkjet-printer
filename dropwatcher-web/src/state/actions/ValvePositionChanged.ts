import { ValveState } from "../State";
import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class ValvePositionChanged implements Action {
    constructor(public state: Partial<ValveState>) { }
    readonly type = ActionType.ValvePositionsChanged;
}
