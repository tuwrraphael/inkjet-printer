import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class ToggleCameraView implements Action {
    readonly type = ActionType.ToggleCameraView;
}

