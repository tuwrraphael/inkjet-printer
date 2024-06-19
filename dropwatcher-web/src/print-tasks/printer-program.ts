export const enum PrinterTaskType {
    Home,
    PrimeNozzle,
    SetTargetPressure,
    SetNozzleData,
    RequestFire,
    Move,
    ResetEncoder,
    MoveAndSliceNext,
    IncrementLayer,
    WriteTrack,
    ZeroEncoder,
    Wait,
    PrintTrack
}

export interface PrinterTask {
    readonly type: PrinterTaskType;
}

export interface PrinterTaskHome extends PrinterTask {
    readonly type: PrinterTaskType.Home;
}

export interface PrinterTaskPrimeNozzle extends PrinterTask {
    readonly type: PrinterTaskType.PrimeNozzle;
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

export interface PrinterTaskMoveAndSliceNext extends PrinterTask {
    readonly type: PrinterTaskType.MoveAndSliceNext;
}

export interface PrinterTaskIncrementLayer extends PrinterTask {
    readonly type: PrinterTaskType.IncrementLayer;
    zero: boolean;
}

export interface PrinterTaskWriteTrack extends PrinterTask {
    readonly type: PrinterTaskType.WriteTrack;
}

export interface PrinterTaskZeroEncoder extends PrinterTask {
    readonly type: PrinterTaskType.ZeroEncoder;
}

export interface PrinterTaskWait extends PrinterTask {
    readonly type: PrinterTaskType.Wait;
    durationMs: number;
}

export interface PrinterTaskPrintTrack extends PrinterTask {
    readonly type: PrinterTaskType.PrintTrack;
    moveLimit : number;
}

export type PrinterTasks = PrinterTaskHome
    | PrinterTaskPrimeNozzle
    | PrinterTaskSetTargetPressure
    | PrinterTaskSetNozzleData
    | PrinterTaskRequestFire
    | PrinterTaskMove
    | PrinterTaskHome
    | PrinterTaskResetEncoder
    | PrinterTaskMoveAndSliceNext
    | PrinterTaskIncrementLayer
    | PrinterTaskWriteTrack
    | PrinterTaskZeroEncoder
    | PrinterTaskWait
    | PrinterTaskPrintTrack
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