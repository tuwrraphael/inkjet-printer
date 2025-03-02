import { InkControlActionState } from "../State";
import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class InkControlActionChanged implements Action {
    constructor(public state: Partial<InkControlActionState>) { }
    readonly type = ActionType.InkControlActionChanged;
}
