import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class ViewLayerChanged implements Action {
    constructor(public layer: number) { }
    readonly type = ActionType.ViewLayerChanged;
}
