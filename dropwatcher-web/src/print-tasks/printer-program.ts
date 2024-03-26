export const enum PrinterTaskType {
    Home,
    PrimeNozzle,
    SetTargetPressure
}

export interface PrinterTask {
    readonly type: PrinterTaskType;
}

export class PrinterTaskHome implements PrinterTask {
    readonly type = PrinterTaskType.Home;
}

export class PrinterTaskPrimeNozzle implements PrinterTask {
    readonly type = PrinterTaskType.PrimeNozzle;
    constructor(public feedTime: number,
        public feedLimitPressure: number,
        public feedLimitPwm: number) {

    }
}

export class PrinterTaskSetTargetPressure implements PrinterTask {
    readonly type = PrinterTaskType.SetTargetPressure;
    constructor(public targetPressure: number) {

    }
}

export type PrinterTasks = PrinterTaskHome
    | PrinterTaskPrimeNozzle
    | PrinterTaskSetTargetPressure
    ;


export enum PrinterProgramState {
    Running,
    Canceled,
    Done
}

export interface PrinterProgram {
    tasks: PrinterTasks[];
}

export interface ProgramRunnerState {
    state: PrinterProgramState;
    currentTaskIndex: number;
}