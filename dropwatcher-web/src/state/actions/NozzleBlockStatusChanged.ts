import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class NozzleBlockStatusChanged implements Action {
    constructor(public nozzleId: number, public blocked: boolean) { }
    readonly type = ActionType.NozzleBlockStatusChanged;
}
