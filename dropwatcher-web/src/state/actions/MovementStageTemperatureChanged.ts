import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class MovementStageTemperatureChanged implements Action {
    constructor(public temps: { current: number, target: number }) { }
    readonly type = ActionType.MovementStageTemperatureChanged;
}
