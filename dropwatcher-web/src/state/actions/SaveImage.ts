import { CameraType } from "../../CameraType";
import { InspectImageType } from "../State";
import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class SaveImage implements Action {
    constructor(public image: Blob, public camera: CameraType, public fileName: string, public imageType: InspectImageType) { }
    readonly type = ActionType.SaveImage;
}
