import { CustomTrack } from "../State";
import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class SetCustomTracks implements Action {
    constructor(public customTracks: CustomTrack[]) { }
    readonly type = ActionType.SetCustomTracks;
}
