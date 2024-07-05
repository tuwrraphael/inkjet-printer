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
        printControl: null,
        waveformControl: null
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
            printheadAngleRads: deg2Rad(90 - 63.75),
            //[2, 7, 8, 118, 119, 120, 121, 122, 123, 124, 125, 126, 55, 56]
            blockedNozzles: [0, 1, 2, 3, 5, 6, 7, 8, 9, 33, 34, 35, 36, 37, 98, 99, 100, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 85, 86, 87, 55, 56]
        },
        printingParams: {
            fireEveryTicks: 4,
            sequentialFires: 1,
            firstLayerHeight: 1.5,
            encoderMargin: 2,
            bedTemperature: 0,
            dryingTime: 0,
            offsetLayers: {
                printAxis: {
                    everyOtherLayerByTicks: 2,
                },
                moveAxis: {
                    randomizedStart: 5,
                    everyOtherLayerByNozzleDistanceFactor: 0.5
                }
            }
        },
        slicingState: {
            moveAxisPos: 0,
            track: null,
            correctionTracks: [],
            currentLayerPlan: null,
            completePlan: null,
            slicingStatus: SlicingStatus.None
        },
        viewLayer: 0,
        modelParams: {},
        modelGroupPrintingParams: {},
        customTracks: []
    },
    models: [],
    currentFileState: null,
    selectedModelId: null
};