import { Action } from "./Action";
import { ActionType } from "./ActionType";

export class DropwatcherParametersChanged implements Action {
    constructor(public delayNanos: number, public flashOnTimeNanos: number) { }
    readonly type = ActionType.DropwatcherParametersChanged;
}