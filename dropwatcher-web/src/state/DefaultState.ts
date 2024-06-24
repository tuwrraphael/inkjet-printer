import { PrinterSystemState, SlicingStatus, State } from "./State";

const printheadSwathePerpendicular = 17.417;
const printheadAngleRads = 0;
const numNozzles = 128;
const printheadSwathe = printheadSwathePerpendicular * Math.cos(printheadAngleRads);

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
            printheadAngleRads: 0
        },
        printingParams: {
            fireEveryTicks: 4,
            printFirstLineAfterEncoderTick: 1,
            sequentialFires: 1,
            firstLayerHeight: 1.5
        },
        slicingState: {
            moveAxisPos: 0,
            track: null,
            slicingStatus: SlicingStatus.None
        },
        viewLayer: 0,
        modelParams: {}
    },
    models: [],
    currentFileState: null,
    selectedModelId: null
};