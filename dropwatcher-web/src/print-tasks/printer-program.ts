import { CustomTrack } from "../state/State";

export const enum PrinterTaskType {
    Home,
    PrimeNozzle,
    SetTargetPressure,
    SetNozzleData,
    RequestFire,
    Move,
    ZeroEncoder,
    Wait,
    PrintTrack,
    PrintCustomTracks,
    HeatBed
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

export interface PrinterTaskMove extends PrinterTask {
    readonly type: PrinterTaskType.Move;
    movement: { x: number, y: number } | { z: number } | { x: number, y: number, z: number };
    feedRate: number;
}

export interface PrinterTaskHeadBed extends PrinterTask {
    readonly type: PrinterTaskType.HeatBed;
    temperature: number;
}

export interface PrintTrackTask extends PrinterTask {
    readonly type: PrinterTaskType.PrintTrack;
    moveAxisPos: number;
    layer: number;
    sequentialFires: number;
    fireEveryTicks: number;
}

export interface PrinterTaskPrintCustomTracksTask extends PrinterTask {
    readonly type: PrinterTaskType.PrintCustomTracks;
    customTracks: CustomTrack[];
    sequentialFires: number;
    fireEveryTicks: number;
}


export interface PrinterTaskZeroEncoder extends PrinterTask {
    readonly type: PrinterTaskType.ZeroEncoder;
}

export interface PrinterTaskWait extends PrinterTask {
    readonly type: PrinterTaskType.Wait;
    durationMs: number;
}

export type PrinterTasks = PrinterTaskHome
    | PrinterTaskPrimeNozzle
    | PrinterTaskSetTargetPressure
    | PrinterTaskSetNozzleData
    | PrinterTaskRequestFire
    | PrinterTaskMove
    | PrinterTaskHome
    | PrintTrackTask
    | PrinterTaskZeroEncoder
    | PrinterTaskWait
    | PrinterTaskPrintCustomTracksTask
    | PrinterTaskHeadBed
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