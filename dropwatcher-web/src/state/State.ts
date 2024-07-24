import { PrinterProgram, PrinterTask, ProgramRunnerState } from "../print-tasks/printer-program";
import { LayerPlan, PrintPlan } from "../slicer/LayerPlan";
import { TrackRasterization } from "../slicer/TrackRasterization";
import { PrintingParams } from "../slicer/PrintingParams";
import { ModelGroupPrintingParams } from "../slicer/ModelGroupPrintingParams";
import { PrinterParams } from "../slicer/PrinterParams";
import { CorrectionTrack, TrackRasterizationResult } from "../slicer/TrackRasterizer";
import { PrintBedViewStateChanged } from "./actions/PrintBedViewStateChanged";

export enum PrinterSystemState {
    Unspecified = 0,
    Startup = 1,
    Idle = 2,
    Error = 3,
    Dropwatcher = 4,
    Print = 5,
    KeepAlive,
}
export enum PressureControlDirection {
    Unspecified = 0,
    Vacuum = 1,
    Pressure = 2
}

export enum PressureControlAlgorithm {
    Unspecified = 0,
    TargetPressure = 1,
    FeedwithLimit = 2,
    None = 3
}

export interface StagePos {
    x: number;
    y: number;
    z: number;
}

export enum PrintControlEncoderMode {
    Unspecified = 0,
    Off = 1,
    On = 2,
    Paused = 3
}

export interface PrintControlState {
    encoderModeSettings: PrintControlEncoderModeSettings;
    encoderValue: number;
    expectedEncoderValue: number;
    lastPrintedLine: number;
    lostLinesCount: number;
    printedLines: number;
    nozzlePrimingActive: boolean;
    encoderMode: PrintControlEncoderMode;
    lostLinesBySlowData: number;
}

export interface PrintControlEncoderModeSettings {
    sequentialFires: number;
    fireEveryTicks: number;
    printFirstLineAfterEncoderTick: number;
}

export enum PolygonType {
    Contour,
    Hole
}
export type Point = [number, number];

export interface Polygon {
    type: PolygonType;
    points: Point[];
}

export interface NewModel {
    layers: {
        polygons: Polygon[];
    }[];
    fileName: string;
    id?:string;
}

export interface Model {
    id: string;
    layers: {
        polygons: Polygon[];
    }[];
    fileName: string;
    boundingBox: {
        min: Point;
        max: Point;
    }
};

export interface ModelParams {
    position: Point;
    modelGroupId: string;
}

export enum SlicingStatus {
    None,
    InProgress,
    Done
}

export interface CustomTrack {
    layer: number;
    moveAxisPos: number;
    track: TrackRasterization;
}

export interface PressureControlPumpParameters {
    targetPressure: number;
    direction: PressureControlDirection
    feedTime: number;
    feedPwm: number;
    maxPressureLimit: number;
    minPressureLimit: number;
    algorithm: PressureControlAlgorithm;
}

export interface PressureControlState {
    pressure: { mbar: number, timestamp: Date }[];
    enabled: boolean;
    done: boolean;
    inkPump: PressureControlPumpParameters;
    cappingPump: PressureControlPumpParameters;
}

export interface WaveformControl {
    voltageMv: number | null;
    setVoltageMv: number | null;
}

export type PrintBedViewMode = {
    mode: "layerPlan"
} | { mode: "rasterization", modelGroup: string, trackIncrement: number, evenOddView: boolean }
    | { mode: "printingTrack", moveAxisPosition: number };

export interface PrintBedViewState {
    selectedModelId: string | null;
    viewLayer: number;
    viewMode: PrintBedViewMode;
}

export interface TrackRasterizationPreview {
    result: TrackRasterizationResult;
    moveAxisPosition: number;
}

export interface State {
    printerSystemState: {
        usbConnected: boolean;
        state: PrinterSystemState;
        errors: {
            flags: number;
        }
        pressureControl?: PressureControlState;
        printControl: PrintControlState;
        waveformControl: WaveformControl;
    },
    movementStageState: {
        connected: boolean;
        pos: StagePos;
        e: number;
        bedTemperature: {
            current: number;
            target: number;
        };
    }
    currentProgram: PrinterProgram,
    programRunnerState: ProgramRunnerState,
    dropwatcherState: {
        nozzleData: Uint32Array;
        delayNanos: number;
        flashOnTimeNanos: number;
        cameraOn: boolean;
        exposureTime: number;
        canChangeExposure: {
            min: number;
            max: number;
            step: number;
        };
        nozzlePos: {
            first: StagePos,
            last: StagePos
        }
    },
    printState: {
        printerParams: PrinterParams;
        printingParams: PrintingParams;
        slicingState: {
            currentRasterization: TrackRasterizationPreview[];
            printPlan: PrintPlan;
            slicingStatus: SlicingStatus;
        };
        currentPrintingTrack: {
            track: TrackRasterization;
            moveAxisPosition: number;
        };
        modelParams: { [id: string]: ModelParams };
        modelGroupPrintingParams: {
            [id: string]: ModelGroupPrintingParams
        };
        customTracks: CustomTrack[];
    },
    models: Model[],
    currentFileState: {
        currentFile: FileSystemFileHandle,
        saving: boolean,
        lastSaved: Date | null
    } | null,
    printBedViewState: PrintBedViewState;
}

export type StateChanges = (keyof State)[];