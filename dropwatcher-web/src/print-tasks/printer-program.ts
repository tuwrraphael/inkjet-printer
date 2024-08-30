import { LayerPlan } from "../slicer/LayerPlan";
import { PrintingParams } from "../slicer/PrintingParams";
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
    PrintLayer,
    PrintCustomTracks,
    HeatBed,
    CheckNozzles,
    Pause
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
    primingPosition: {
        x: number;
        y: number;
        z: number;
    };
}

export interface PrintLayerTask extends PrinterTask {
    readonly type: PrinterTaskType.PrintLayer;
    layerPlan: LayerPlan;
    layerNr: number;
    dryingPosition: {
        x: number;
        y: number;
        z: number;
    };
    z: number;
}

export interface CheckNozzlesTask extends PrinterTask {
    readonly type: PrinterTaskType.CheckNozzles;
    startNozzle: number;
    layerNr: number;
    nozzleTestSurfaceHeight: number;
    safeTravelHeight: number;
}

export interface PrinterTaskPrintCustomTracksTask extends PrinterTask {
    readonly type: PrinterTaskType.PrintCustomTracks;
    customTracks: CustomTrack[];
    printingParams: PrintingParams;
    z: number;
}


export interface PrinterTaskZeroEncoder extends PrinterTask {
    readonly type: PrinterTaskType.ZeroEncoder;
}

export interface PrinterTaskWait extends PrinterTask {
    readonly type: PrinterTaskType.Wait;
    durationMs: number;
}

export interface PrinterTaskPause extends PrinterTask {
    readonly type: PrinterTaskType.Pause;
    message: string;
}

export type PrinterTasks = PrinterTaskHome
    | PrinterTaskPrimeNozzle
    | PrinterTaskSetTargetPressure
    | PrinterTaskSetNozzleData
    | PrinterTaskRequestFire
    | PrinterTaskMove
    | PrinterTaskHome
    | PrintLayerTask
    | PrinterTaskZeroEncoder
    | PrinterTaskWait
    | PrinterTaskPrintCustomTracksTask
    | PrinterTaskHeadBed
    | CheckNozzlesTask
    | PrinterTaskPause
    ;


export enum PrinterProgramState {
    Initial,
    Running,
    Canceled,
    Done,
    Paused,
    Failed
}

export interface PrinterProgram {
    tasks: PrinterTasks[];
}

export interface ProgramRunnerState {
    state: PrinterProgramState;
    currentTaskIndex: number;
    message: string;
}