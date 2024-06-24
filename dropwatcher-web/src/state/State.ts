import { PrinterProgram, PrinterTask, ProgramRunnerState } from "../print-tasks/printer-program";
import { PrinterParams, PrintingParams } from "../slicer/TrackSlicer";

export enum PrinterSystemState {
    Unspecified = 0,
    Startup = 1,
    Idle = 2,
    Error = 3,
    Dropwatcher = 4,
    Print = 5,
}
export enum PressureControlDirection {
    Unspecified = 0,
    Vacuum = 1,
    Pressure = 2
}

export enum PressureControlAlgorithm {
    Unspecified = 0,
    TargetPressure = 1,
    FeedwithLimit = 2
}

export interface StagePos {
    x: number;
    y: number;
    z: number;
}

export interface PrintControlState {
    encoderModeSettings: PrintControlEncoderModeSettings;
    encoderValue: number;
    expectedEncoderValue: number;
    lastPrintedLine: number;
    lostLinesCount: number;
    printedLines: number;
    nozzlePrimingActive: boolean;
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
    skipNozzles: number;
}

export enum SlicingStatus {
    None,
    InProgress,
    Done
}


export interface State {
    printerSystemState: {
        usbConnected: boolean;
        state: PrinterSystemState;
        errors: {
            flags: number;
        }
        pressureControl?: {
            pressure: { mbar: number, timestamp: Date }[];
            enabled: boolean;
            done: boolean;
            parameters: {
                targetPressure: number;
                direction: PressureControlDirection
                feedTime: number;
                feedPwm: number;
                limitPressure: number;
                algorithm: PressureControlAlgorithm;
            }
        },
        printControl: PrintControlState
    },
    movementStageState: {
        connected: boolean;
        pos: StagePos;
        e: number;
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
        printerParams: PrinterParams,
        printingParams: PrintingParams,
        slicingState: {
            moveAxisPos: number;
            track: Uint32Array;
            slicingStatus: SlicingStatus;
        }
        viewLayer: number,
        modelParams: { [id: string]: ModelParams }
    },
    models: Model[],
    currentFileState: {
        currentFile: FileSystemFileHandle,
        saving: boolean,
        lastSaved: Date | null
    } | null,
    selectedModelId : string | null
}

export type StateChanges = (keyof State)[];