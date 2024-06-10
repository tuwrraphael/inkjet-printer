import { PrinterSystemState, State } from "./State";

export const DefaultState: State =
{
    printerSystemState: {
        usbConnected: false,
        state: PrinterSystemState.Unspecified,
        errors: {
            flags: 0
        },
        pressureControl: null,
        printControl: null
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
    },
    printState: {
        printerParams: {
            buildPlate: {
                width: 175,
                height: 175
            },
            encoder: {
                yAxis: {
                    dpi: 720,
                    ticks: 5000
                }
            }
        },
        models: [],
        viewLayer: 0
    }
};