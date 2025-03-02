import { Action } from "./Action";
import { ActionType } from "./ActionType";

export class MovementStageConnectionChanged implements Action {
    constructor(public connected: boolean) { }
    readonly type = ActionType.MovementStageConnectionChanged;
}