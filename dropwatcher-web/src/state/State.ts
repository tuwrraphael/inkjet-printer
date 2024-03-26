import { PrinterProgram, PrinterTask, ProgramRunnerState } from "../print-tasks/printer-program";

export enum PrinterSystemState {
    Unspecified = 0,
    Startup = 1,
    Idle = 2,
    Error = 3,
    Dropwatcher = 4
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
    },
    movementStageState: {
        connected: boolean;
        x: number;
        y: number;
        z: number;
        e: number;
    }
    currentProgram: PrinterProgram,
    programRunnerState : ProgramRunnerState
}

export type StateChanges = (keyof State)[];