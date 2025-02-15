import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class MovementStageTemperatureChanged implements Action {
    constructor(public temps: { bed: { current: number, target: number }, dryer: { current: number, target: number } }) {
    }
    readonly type = ActionType.MovementStageTemperatureChanged;
}
