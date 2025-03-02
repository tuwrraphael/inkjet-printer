import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class OpenFile implements Action {
    constructor(public handle: FileSystemFileHandle) { }
    readonly type = ActionType.OpenFile;
}
