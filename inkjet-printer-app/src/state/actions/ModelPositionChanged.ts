import { Point } from "../State";
import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class ModelPositionChanged implements Action {
    constructor(public id: string, public position: Point) { }
    readonly type = ActionType.ModelPositionChanged;
}
