import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class RouteChanged implements Action {
    constructor(public route: string) { }
    readonly type = ActionType.RouteChanged;
}
