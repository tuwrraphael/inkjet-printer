import { ActionType } from "./actions/ActionType";
import { PrinterSystemState, State, PressureControlAlgorithm, PressureControlDirection, PolygonType, Model, Polygon, Point, NewModel } from "./State";

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
import { ModelAdded, ViewLayerChanged } from "./actions/ModelAdded";

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

async function getBoundingBox(model: NewModel): Promise<{ min: Point, max: Point }> {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let layer of model.layers) {
        for (let polygon of layer.polygons) {
            for (let point of polygon.points) {
                minX = Math.min(minX, point[0]);
                minY = Math.min(minY, point[1]);
                maxX = Math.max(maxX, point[0]);
                maxY = Math.max(maxY, point[1]);
            }
        }
    }
    return { min: [minX, minY], max: [maxX, maxY] };

}

async function modelAdded(msg: ModelAdded) {
    let bb = await getBoundingBox(msg.model);
    updateState(oldState => ({
        printState: {
            ...oldState.printState,
            models: [...oldState.printState.models, {
                fileName: msg.model.fileName,
                layers: msg.model.layers,
                boundingBox: bb,
                position: [10, 10]
            }],
        }
    }));
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
                            printedLines: msg.response.printControl.printedLines || 0
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
            break;
    }
}
self.addEventListener("message", ev => {
    let msg: Actions = ev.data;
    handleMessage(msg).catch(err => console.error(err));
});