import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class NozzleDataChanged implements Action {
    constructor(public data: Uint32Array) { }
    readonly type = ActionType.NozzleDataChanged;
}
