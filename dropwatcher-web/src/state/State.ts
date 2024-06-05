import { PrinterProgram, PrinterTask, ProgramRunnerState } from "../print-tasks/printer-program";

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
}

export interface PrintControlEncoderModeSettings {
    sequentialFires: number;
    fireEveryTicks: number;
    printFirstLineAfterEncoderTick: number;
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
    }
}

export type StateChanges = (keyof State)[];