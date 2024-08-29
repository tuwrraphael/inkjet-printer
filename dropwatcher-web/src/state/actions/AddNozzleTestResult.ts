import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class AddNozzleTestResult implements Action {
    constructor(public nozzle: number, public drops: {
        x: number;
        y: number;
        diameter: number;
    }[]) { }
    readonly type = ActionType.AddNozzleTestResult;
}
