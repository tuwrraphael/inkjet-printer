export const enum PrinterTaskType {
    Home,
    PrimeNozzle,
    SetTargetPressure,
    SetNozzleData,
    RequestFire,
    Move,
    ResetEncoder
}

export interface PrinterTask {
    readonly type: PrinterTaskType;
}

export interface PrinterTaskHome extends PrinterTask {
    readonly type: PrinterTaskType.Home;
}

export interface PrinterTaskPrimeNozzle extends PrinterTask {
    readonly type: PrinterTaskType.PrimeNozzle;
    feedTime: number;
    feedLimitPressure: number;
    feedLimitPwm: number;
}

export interface PrinterTaskSetTargetPressure extends PrinterTask {
    readonly type: PrinterTaskType.SetTargetPressure;
    targetPressure: number;
}
export interface PrinterTaskSetNozzleData extends PrinterTask {
    readonly type: PrinterTaskType.SetNozzleData;
    data: Uint32Array;
}

export interface PrinterTaskRequestFire extends PrinterTask {
    readonly type: PrinterTaskType.RequestFire;
}

export interface PrinterTaskResetEncoder extends PrinterTask {
    readonly type: PrinterTaskType.ResetEncoder;
    fireEveryTicks: number;
    printFirstLineAfterEncoderTick: number;
    sequentialFires: number;
}

export interface PrinterTaskMove extends PrinterTask {
    readonly type: PrinterTaskType.Move;
    x: number;
    y: number;
    z: number;
    feedRate: number;
}

export type PrinterTasks = PrinterTaskHome
    | PrinterTaskPrimeNozzle
    | PrinterTaskSetTargetPressure
    | PrinterTaskSetNozzleData
    | PrinterTaskRequestFire
    | PrinterTaskMove
    | PrinterTaskHome
    | PrinterTaskResetEncoder
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