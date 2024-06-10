import { NewModel } from "../State";
import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class ModelAdded implements Action {
    constructor(public model: NewModel) { }
    readonly type = ActionType.ModelAdded;
}

export class ViewLayerChanged implements Action {
    constructor(public layer: number) { }
    readonly type = ActionType.ViewLayerChanged;
}
