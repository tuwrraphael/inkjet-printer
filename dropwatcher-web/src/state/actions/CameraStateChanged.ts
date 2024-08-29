import { CameraType } from "../../CameraType";
import { Action } from "./Action";
import { ActionType } from "./ActionType";

export class CameraStateChanged implements Action {
    constructor(public state: {
        cameraOn?: boolean;
        exposureTime?: number;
        canChangeExposure?: {
            min: number;
            max: number;
            step: number;
        };
    }, public cameraType: CameraType) { }
    readonly type = ActionType.CameraStateChanged;
}
