import { CameraType } from "../../CameraType";
import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class SaveImage implements Action {
    constructor(public image: Blob, public camera: CameraType, public fileName: string, public folder: string = null) { }
    readonly type = ActionType.SaveImage;
}
