import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class MovementStagePositionChanged implements Action {
    constructor(public connected: boolean, public position: { x: number; y: number; z: number; e: number; }) { }
    readonly type = ActionType.MovementStagePositionChanged;
}
