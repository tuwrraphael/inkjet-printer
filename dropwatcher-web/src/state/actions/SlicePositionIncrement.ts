import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class SlicePositionIncrement implements Action {
    constructor(public increment: number) { }
    readonly type = ActionType.SlicePositionIncrement;
}
