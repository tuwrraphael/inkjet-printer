
import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class SaveToFile implements Action {
    constructor(public handle : FileSystemFileHandle) { }
    readonly type = ActionType.SaveToFile;
}

