import { deg2Rad } from "../utils/deg2Rad";
import { PrinterSystemState, SlicingStatus, State } from "./State";

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
                printAxis: {
                    dpi: 720,
                    ticks: 4000
                }
            },
            numNozzles: 128,
            printheadSwathePerpendicular: 17.417,
            printheadAngleRads: deg2Rad(30),
        },
        printingParams: {
            fireEveryTicks: 4,
            printFirstLineAfterEncoderTick: 1,
            sequentialFires: 1,
            firstLayerHeight: 1.5,
            encoderMargin: 2
        },
        slicingState: {
            moveAxisPos: 0,
            track: null,
            currentLayerPlan: null,
            completePlan: null,
            slicingStatus: SlicingStatus.None
        },
        viewLayer: 0,
        modelParams: {}
    },
    models: [],
    currentFileState: null,
    selectedModelId: null
};