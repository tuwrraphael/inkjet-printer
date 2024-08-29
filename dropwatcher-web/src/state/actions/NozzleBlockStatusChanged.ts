import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class NozzleBlockStatusChanged implements Action {
    constructor(public state: { nozzleId: number, blocked: boolean }[]) { }
    readonly type = ActionType.NozzleBlockStatusChanged;
}
