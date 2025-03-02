import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class OutputFolderChanged implements Action {
    constructor(public folder: FileSystemDirectoryHandle) { }
    readonly type = ActionType.OutputFolderChanged;
}
