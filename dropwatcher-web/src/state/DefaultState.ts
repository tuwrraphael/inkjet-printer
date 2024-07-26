import { deg2Rad } from "../utils/deg2Rad";
import { PrinterSystemState, SlicingStatus, State, ValvePosition } from "./State";

export const DefaultState: State =
{
    printerSystemState: {
        usbConnected: false,
        state: PrinterSystemState.Unspecified,
        errors: {
            flags: 0
        },
        pressureControl: null,
        printControl: null,
        waveformControl: null,
        valves: {
            valve1: ValvePosition.Port1Port2,
            valve2: ValvePosition.Port1Port3,
            valve3: ValvePosition.Port2Port3
        }
    },
    movementStageState: {
        connected: false,
        pos: null,
        e: undefined,
        bedTemperature: undefined
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
            printheadAngleRads: deg2Rad(90 - 63.75),
            //[2, 7, 8, 118, 119, 120, 121, 122, 123, 124, 125, 126, 55, 56]
            // [0, 1, 2, 3, 5, 6, 7, 8, 9, 33, 34, 35, 36, 37, 98, 99, 100, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 85, 86, 87, 55, 56]
            blockedNozzles: [
                ...Array.from({ length: 47 + 1 - 32 }, (_, i) => i + 32),
                ...Array.from({ length: 47 + 1 - 32 }, (_, i) => i + 32),
                ...Array.from({ length: 79 + 1 - 64 }, (_, i) => i + 64),
                96, 97, 98, 99, 100, 102, 105, 106, 107, 108, 109, 112,
                ...Array.from({ length: 95 + 1 - 80 }, (_, i) => i + 80),
                ...Array.from({ length: 63 + 1 - 48 }, (_, i) => i + 48),
                ...Array.from({ length: 31 + 1 - 24 }, (_, i) => i + 24),
            ]
        },
        printingParams: {
            fireEveryTicks: 4,
            sequentialFires: 1,
            firstLayerHeight: 1.5,
            encoderMargin: 2,
            bedTemperature: 0,
            dryingTimeSeconds: 0,
            waveform: {
                voltage: 28
            },
            skipNozzles: 1,
            offsetLayers: {
                printAxis: {
                    everyOtherLayerByTicks: 2,
                },
                moveAxis: {
                    everyOtherLayerByNozzles: 1
                }
            }
        },
        slicingState: {
            currentRasterization: null,
            printPlan: null,
            slicingStatus: SlicingStatus.None
        },
        currentPrintingTrack: null,
        modelParams: {},
        modelGroupPrintingParams: {
        },
        customTracks: []
    },
    models: [],
    currentFileState: null,
    printBedViewState: {
        viewLayer: 0,
        selectedModelId: null,
        viewMode: {
            mode: "layerPlan"
        }
    },
    inkControlAction: {
        currentAction: null,
        currentStep : null,
        actionsRunning: false
    }
};