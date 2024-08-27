import { PrinterProgram, PrinterTask, ProgramRunnerState } from "../print-tasks/printer-program";
import { LayerPlan, PrintPlan } from "../slicer/LayerPlan";
import { TrackRasterization } from "../slicer/TrackRasterization";
import { PrintingParams } from "../slicer/PrintingParams";
import { ModelGroupPrintingParams } from "../slicer/ModelGroupPrintingParams";
import { PrinterParams } from "../slicer/PrinterParams";
import { TrackRasterizationResult } from "../slicer/TrackRasterizationResult";
import { CorrectionTrack } from "../slicer/CorrectionTrack";
import { PrintBedViewStateChanged } from "./actions/PrintBedViewStateChanged";
import { CameraType } from "../CameraType";

export enum PrinterSystemState {
    Unspecified = 0,
    Startup = 1,
    Idle = 2,
    Error = 3,
    Dropwatcher = 4,
    Print = 5,
    KeepAlive,
    PrinterSystemState_PRINT,
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
    id?: string;
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
    clockPeriodNs: number | null;
}

export type PrintBedViewMode = {
    mode: "layerPlan"
} | { mode: "rasterization", modelGroup: string, trackIncrement: number, evenOddView: boolean }
    | { mode: "printingTrack", moveAxisPosition: number };

export interface PrintBedViewState {
    selectedModelId: string | null;
    viewLayerFrom: number;
    viewLayerTo: number;
    viewMode: PrintBedViewMode;
}

export interface TrackRasterizationPreview {
    result: TrackRasterizationResult;
    moveAxisPosition: number;
}

export enum ValvePosition {
    AllConnected = 0,
    Port1Port2 = 1,
    Port2Port3 = 2,
    Port1Port3 = 3
}

export interface InkControlActionState {

    currentAction: string;
    currentStep: number;
    actionsRunning: boolean;
}

export interface ValveState {
    valve1: ValvePosition;
    valve2: ValvePosition;
    valve3: ValvePosition;
}

export interface InspectImage {
    file: FileSystemFileHandle,
    metadata: {
    }
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
        valves: ValveState;
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
    cameras: {
        [type: string]: {
            cameraOn: boolean;
            exposureTime: number;
            canChangeExposure: {
                min: number;
                max: number;
                step: number;
            };
            image: {
                width: number;
                height: number;
            }
        }
    }
    dropwatcherState: {
        nozzleData: Uint32Array;
        delayNanos: number;
        flashOnTimeNanos: number;
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
    inspect: {
        outputFolder: FileSystemDirectoryHandle,
        images: InspectImage[],
        selectedImageFileName: string | null
    },
    printBedViewState: PrintBedViewState;
    inkControlAction: InkControlActionState;
    nozzlePerformance: {
        testResults: {
            timestamp: Date;
            nozzle: number;
            analysis: {
                dropCount: number;
                sizeAverage: number;
                sizeStdDev: number;
            }
        }[]
    },
    currentRoute: string;
}

export type StateChanges = (keyof State)[];