import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class SaveToCurrentFile implements Action {
    constructor() { }
    readonly type = ActionType.SaveToCurrentFile;
}
