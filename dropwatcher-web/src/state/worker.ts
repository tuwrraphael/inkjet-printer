import { ActionType } from "./actions/ActionType";
import { PrinterSystemState, State, PressureControlAlgorithm, PressureControlDirection, PolygonType, Model, Polygon, Point, NewModel, SlicingStatus } from "./State";

import { PrinterUSBConnectionStateChanged } from "./actions/PrinterUSBConnectionStateChanged";
import { PrinterSystemStateResponseReceived } from "./actions/PrinterSystemStateResponseReceived";
import { InitializeWorker } from "./actions/InitializeWorker";
import {
    PrinterSystemState as ProtoPrinterSystemState,
    PressureControlDirection as ProtoPressureControlDirection,
    PressureControlAlgorithm as ProtoPressureControlAlgorithm
} from "../proto/compiled";
import { MovementStageConnectionChanged } from "./actions/MovementStageConnectionChanged";
import { MovementStagePositionChanged } from "./actions/MovementStagePositionChanged";
import { ProgramRunnerStateChanged } from "./actions/ProgramRunnerStateChanged";
import { DropwatcherNozzlePosChanged } from "./actions/DropwatcherNozzlePosChanged";
import { NozzleDataChanged } from "./actions/NozzleDataSet";
import { DropwatcherParametersChanged } from "./actions/DropwatcherParametersSet";
import { CameraStateChanged } from "./actions/CameraStateChanged";
import { ModelAdded } from "./actions/ModelAdded";
import { ViewLayerChanged } from "./actions/ViewLayerChanged";
import { ModelPositionChanged } from "./actions/ModelPositionChanged";
import { TrackSlicer } from "../slicer/TrackSlicer";
import { SlicePositionChanged } from "./actions/SlicePositionChanged";
import { SlicePositionIncrement } from "./actions/SlicePositionIncrement";
import { getPrintheadSwathe } from "../slicer/getPrintheadSwathe";
import { PrintingParamsChanged } from "./actions/PrintOptionsChanged";
import { getModelBoundingBox } from "../utils/getModelBoundingBox";

type Actions = PrinterUSBConnectionStateChanged
    | PrinterSystemStateResponseReceived
    | InitializeWorker
    | MovementStageConnectionChanged
    | MovementStagePositionChanged
    | ProgramRunnerStateChanged
    | NozzleDataChanged
    | DropwatcherParametersChanged
    | CameraStateChanged
    | DropwatcherNozzlePosChanged
    | ModelAdded
    | ViewLayerChanged
    | ModelPositionChanged
    | SlicePositionChanged
    | SlicePositionIncrement
    | PrintingParamsChanged
    ;
let state: State;
let initialized = false;

const maxPressureHistory = 120;

function updateState(updateFn: (oldState: State) => Partial<State>) {
    if (initialized) {
        let update = updateFn(state);
        state = {
            ...state,
            ...update
        };
        self.postMessage([update, Object.keys(update)]);
    } else {
        console.error("updateState: Worker not initialized");
    }
}

function mapPrinterSystemState(s: ProtoPrinterSystemState): PrinterSystemState {
    switch (s) {
        case ProtoPrinterSystemState.PrinterSystemState_UNSPECIFIED:
            return PrinterSystemState.Unspecified;
        case ProtoPrinterSystemState.PrinterSystemState_IDLE:
            return PrinterSystemState.Idle;
        case ProtoPrinterSystemState.PrinterSystemState_ERROR:
            return PrinterSystemState.Error;
        case ProtoPrinterSystemState.PrinterSystemState_STARTUP:
            return PrinterSystemState.Startup;
        case ProtoPrinterSystemState.PrinterSystemState_DROPWATCHER:
            return PrinterSystemState.Dropwatcher;
        case ProtoPrinterSystemState.PrinterSystemState_PRINT:
            return PrinterSystemState.Print;
        default:
            return PrinterSystemState.Unspecified;
    }

}

function mapPressureControlDirection(d: ProtoPressureControlDirection): PressureControlDirection {
    switch (d) {
        case ProtoPressureControlDirection.PressureControlDirection_UNSPECIFIED:
            return PressureControlDirection.Unspecified;
        case ProtoPressureControlDirection.PressureControlDirection_VACUUM:
            return PressureControlDirection.Vacuum;
        case ProtoPressureControlDirection.PressureControlDirection_PRESSURE:
            return PressureControlDirection.Pressure;
        default:
            return PressureControlDirection.Unspecified;
    }
}

function mapPressureControlAlgorithm(a: ProtoPressureControlAlgorithm): PressureControlAlgorithm {
    switch (a) {
        case ProtoPressureControlAlgorithm.PressureControlAlgorithm_UNSPECIFIED:
            return PressureControlAlgorithm.Unspecified;
        case ProtoPressureControlAlgorithm.PressureControlAlgorithm_TARGET_PRESSURE:
            return PressureControlAlgorithm.TargetPressure;
        case ProtoPressureControlAlgorithm.PressureControlAlgorithm_FEED_WITH_LIMIT:
            return PressureControlAlgorithm.FeedwithLimit;
        default:
            return PressureControlAlgorithm.Unspecified;
    }
}

let modelIds = 0;

let trackSlicer: TrackSlicer = null;

async function updateSlicerParams() {
    updateState(oldState => ({
        printState: {
            ...oldState.printState,
            slicingState: {
                ...oldState.printState.slicingState,
                track: null,
                slicingStatus: SlicingStatus.None
            }
        }
    }));
    if (state.models.length < 1) {
        return;
    }
    updateState(oldState => ({
        printState: {
            ...oldState.printState,
            slicingState: {
                ...oldState.printState.slicingState,
                slicingStatus: SlicingStatus.InProgress
            }
        }
    }));
    trackSlicer = new TrackSlicer(state.models, state.printState.modelParams, state.printState.viewLayer, state.printState.printerParams, state.printState.printingParams);
    let track = trackSlicer.getTrack(state.printState.slicingState.moveAxisPos);
    updateState(oldState => ({
        printState: {
            ...oldState.printState,
            slicingState: {
                ...oldState.printState.slicingState,
                track: track,
                slicingStatus: SlicingStatus.Done
            }
        }
    }));
}

async function modelAdded(msg: ModelAdded) {
    let bb = getModelBoundingBox(msg.model);
    let model: Model = {
        fileName: msg.model.fileName,
        layers: msg.model.layers,
        boundingBox: bb,
        id: `${modelIds++}`
    };
    updateState(oldState => ({
        models: [...oldState.models, model],
        printState: {
            ...oldState.printState,
            modelParams: {
                ...oldState.printState.modelParams,
                [model.id]: {
                    position: [10, 10]
                }
            }
        }
    }));
    updateSlicerParams();
}

function reslice() {
    if (null == trackSlicer) {
        return;
    }
    updateState(oldState => ({
        printState: {
            ...oldState.printState,
            slicingState: {
                ...oldState.printState.slicingState,
                slicingStatus: SlicingStatus.InProgress
            }
        }
    }));
    let track = trackSlicer.getTrack(state.printState.slicingState.moveAxisPos);
    updateState(oldState => ({
        printState: {
            ...oldState.printState,
            slicingState: {
                ...oldState.printState.slicingState,
                track: track,
                slicingStatus: SlicingStatus.Done
            }
        }
    }));
}

function slicePositionIncrement(msg: SlicePositionIncrement) {
    let swathe = getPrintheadSwathe(state.printState.printerParams);
    updateState(oldState => ({
        printState: {
            ...oldState.printState,
            slicingState: {
                ...oldState.printState.slicingState,
                moveAxisPos: oldState.printState.slicingState.moveAxisPos + (swathe * msg.increment),
                slicingStatus: SlicingStatus.None,
                track: null
            }
        }
    }));
    reslice();
}

function slicePositionChanged(msg: SlicePositionChanged) {
    updateState(oldState => ({
        printState: {
            ...oldState.printState,
            slicingState: {
                ...oldState.printState.slicingState,
                moveAxisPos: msg.moveAxisPos,
                slicingStatus: SlicingStatus.None,
                track: null
            }
        }
    }));
    reslice();
}

async function handleMessage(msg: Actions) {
    switch (msg.type) {
        case ActionType.PrinterUSBConnectionStateChanged:
            updateState(oldState => ({
                printerSystemState: {
                    ...oldState.printerSystemState,
                    usbConnected: msg.connected
                }
            }));
            break;
        case ActionType.PrinterSystemStateResponseReceived:


            updateState(oldState => {
                let pressure = [...oldState.printerSystemState.pressureControl?.pressure || [], { mbar: msg.response.pressureControl ? Number(msg.response.pressureControl.pressure || 0) : undefined, timestamp: new Date() }];
                if (pressure.length > maxPressureHistory) {
                    pressure = pressure.slice(pressure.length - maxPressureHistory);
                }
                return {
                    printerSystemState: {
                        ...oldState.printerSystemState,
                        state: mapPrinterSystemState(msg.response.state),
                        errors: {
                            flags: Number(msg.response.errorFlags || 0)
                        },
                        pressureControl: msg.response.pressureControl ? {
                            pressure: pressure,
                            done: msg.response.pressureControl ? Boolean(msg.response.pressureControl.done) : undefined,
                            enabled: msg.response.pressureControl ? Boolean(msg.response.pressureControl.enabled) : undefined,
                            parameters: msg.response.pressureControl?.parameters ? {
                                targetPressure: msg.response.pressureControl.parameters.targetPressure,
                                direction: msg.response.pressureControl.parameters.direction ? mapPressureControlDirection(msg.response.pressureControl.parameters.direction) : PressureControlDirection.Unspecified,
                                feedTime: msg.response.pressureControl.parameters.feedTime,
                                feedPwm: msg.response.pressureControl.parameters.feedPwm,
                                limitPressure: msg.response.pressureControl.parameters.limitPressure,
                                algorithm: msg.response.pressureControl.parameters.algorithm ? mapPressureControlAlgorithm(msg.response.pressureControl.parameters.algorithm) : PressureControlAlgorithm.Unspecified,
                                enabled: msg.response.pressureControl.parameters.enabled
                            } : null
                        } : null,
                        printControl: msg.response.printControl ? {
                            encoderModeSettings: {
                                fireEveryTicks: msg.response.printControl.encoderModeSettings.fireEveryTicks || 0,
                                printFirstLineAfterEncoderTick: msg.response.printControl.encoderModeSettings.printFirstLineAfterEncoderTick || 0,
                                sequentialFires: msg.response.printControl.encoderModeSettings.sequentialFires | 0
                            },
                            encoderValue: msg.response.printControl.encoderValue || 0,
                            expectedEncoderValue: msg.response.printControl.expectedEncoderValue || 0,
                            lastPrintedLine: msg.response.printControl.lastPrintedLine || 0,
                            lostLinesCount: msg.response.printControl.lostLinesCount || 0,
                            printedLines: msg.response.printControl.printedLines || 0,
                            nozzlePrimingActive: msg.response.printControl.nozzlePrimingActive || false,
                        } : null
                    }
                };
            });
            break;
        case ActionType.InitializeWorker:
            state = msg.state;
            initialized = true;
            console.log("Worker initialized", state);
            self.postMessage([state, Object.keys(state)]);
            break;
        case ActionType.MovementStageConnectionChanged:
            updateState(oldState => ({
                movementStageState: {
                    ...oldState.movementStageState,
                    connected: msg.connected,
                }
            }));
            break;
        case ActionType.MovementStagePositionChanged:
            updateState(oldState => ({
                movementStageState: {
                    ...oldState.movementStageState,
                    pos: {
                        x: msg.position.x,
                        y: msg.position.y,
                        z: msg.position.z
                    },
                    e: msg.position.e
                }
            }));
            break;
        case ActionType.ProgramRunnerStateChanged:
            updateState(oldState => ({
                programRunnerState: msg.state,
                currentProgram: msg.program
            }));
            break;
        case ActionType.DropwatcherParametersChanged:
            updateState(oldState => ({
                dropwatcherState: {
                    ...oldState.dropwatcherState,
                    delayNanos: msg.delayNanos,
                    flashOnTimeNanos: msg.flashOnTimeNanos
                }
            }));
            break;
        case ActionType.NozzleDataChanged:
            updateState(oldState => ({
                dropwatcherState: {
                    ...oldState.dropwatcherState,
                    nozzleData: msg.data
                }
            }));
            break;
        case ActionType.CameraStateChanged:
            updateState(oldState => ({
                dropwatcherState: {
                    ...oldState.dropwatcherState,
                    ...msg.state
                }
            }));
            break;
        case ActionType.DropwatcherNozzlePosChanged:
            updateState(oldState => ({
                dropwatcherState: {
                    ...oldState.dropwatcherState,
                    nozzlePos: {
                        first: msg.firstNozzlePos || oldState.dropwatcherState.nozzlePos.first,
                        last: msg.lastNozzlePos || oldState.dropwatcherState.nozzlePos.last
                    }
                }
            }));
            break;
        case ActionType.ModelAdded:
            modelAdded(msg);
            break;
        case ActionType.ViewLayerChanged:
            updateState(oldState => ({
                printState: {
                    ...oldState.printState,
                    viewLayer: msg.layer
                }
            }));
            updateSlicerParams();
            break;
        case ActionType.ModelPositionChanged:
            updateState(oldState => ({
                printState: {
                    ...oldState.printState,
                    modelParams: {
                        ...oldState.printState.modelParams,
                        [msg.id]: {
                            position: msg.position
                        }
                    }
                }
            }));
            updateSlicerParams();
            break;
        case ActionType.SlicePositionChanged:
            slicePositionChanged(msg);
            break;
        case ActionType.SlicePositionIncrement:
            slicePositionIncrement(msg);
            break;
        case ActionType.PrintingParamsChanged:
            updateState(oldState => ({
                printState: {
                    ...oldState.printState,
                    printingParams: {
                        ...oldState.printState.printingParams,
                        ...msg.printingParams
                    }
                }
            }));
            console.log("Printing params changed", msg);
            updateSlicerParams();
            break;
    }
}
self.addEventListener("message", ev => {
    let msg: Actions = ev.data;
    handleMessage(msg).catch(err => console.error(err));
});