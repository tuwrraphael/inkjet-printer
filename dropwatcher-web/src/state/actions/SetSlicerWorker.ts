import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class SetSlicerWorker implements Action {
    constructor(public messagePort: MessagePort) { }
    readonly type = ActionType.SetSlicerWorker;
}
