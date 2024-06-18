import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class SlicePositionChanged implements Action {
    constructor(public moveAxisPos: number) { }
    readonly type = ActionType.SlicePositionChanged;
}

