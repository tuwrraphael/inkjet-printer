import { StagePos } from "../State";
import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class DropwatcherNozzlePosChanged implements Action {
    constructor(public firstNozzlePos: StagePos | null, public lastNozzlePos: StagePos | null) {
    }
    readonly type = ActionType.DropwatcherNozzlePosChanged;
}
