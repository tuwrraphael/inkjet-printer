import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class ImageSelected implements Action {
    constructor(public filename: string) { }
    readonly type = ActionType.ImageSelected;
}
