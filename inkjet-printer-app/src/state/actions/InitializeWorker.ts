import { State } from "../State";
import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class InitializeWorker implements Action {
    constructor(public state: State) { }
    readonly type = ActionType.InitializeWorker;
}
