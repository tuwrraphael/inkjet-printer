import { CameraViewState } from "../State";
import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class ChangeCameraViewParams implements Action {
    readonly type = ActionType.ChangeCameraViewParams;
    constructor(public state: Partial<Pick<CameraViewState, "selectedCamera" | "showCrosshair">>) { }
}
