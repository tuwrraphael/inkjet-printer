import { Action } from "./Action";
import { ActionType } from "./ActionType";

export class TestAction implements Action {
    constructor(public term: string) { }
    readonly type = ActionType.TestAction;
}

