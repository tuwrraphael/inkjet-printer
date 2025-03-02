import { PrinterProgram, ProgramRunnerState } from "../../print-tasks/printer-program";
import { Action } from "./Action";
import { ActionType } from "./ActionType";


export class ProgramRunnerStateChanged implements Action {
    constructor(public state: ProgramRunnerState, public program: PrinterProgram) { }
    readonly type = ActionType.ProgramRunnerStateChanged;
}
