import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class ModelSelected implements Action {
    constructor(public modelId: string) { }
    readonly type = ActionType.ModelSelected;
}
