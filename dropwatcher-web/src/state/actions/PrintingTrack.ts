import { TrackRasterizationResult } from "../../slicer/TrackSlicer";
import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class PrintingTrack implements Action {
    constructor(public layer: number, public trackRasterizationResult: TrackRasterizationResult, public moveAxisPos : number) { }
    readonly type = ActionType.PrintingTrack;
}
