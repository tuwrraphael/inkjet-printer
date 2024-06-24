import { ModelParams } from "../State";
import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class ModelParamsChanged implements Action {
    constructor(public id: string, public params: Partial<ModelParams>) { }
    readonly type = ActionType.ModelParamsChanged;
}
