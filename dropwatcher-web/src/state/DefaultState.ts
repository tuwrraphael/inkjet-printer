import { PrinterSystemState, State } from "./State";

export const DefaultState: State =
{
    printerSystemState: {
        usbConnected: false,
        state: PrinterSystemState.Unspecified,
        errors: {
            flags: 0
        }, pressureControl: null
    },
    movementStageState: {
        connected: false,
        pos: null,
        e: undefined
    },
    currentProgram: null,
    programRunnerState: {
        state: null,
        currentTaskIndex: null
    },
    dropwatcherState: {
        nozzleData: undefined,
        delayNanos: undefined,
        flashOnTimeNanos: undefined,
        cameraOn: false,
        exposureTime: undefined,
        canChangeExposure: undefined,
        nozzlePos: {
            first: null,
            last: null
        }
    }
};