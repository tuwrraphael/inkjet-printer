import * as Comlink from "comlink";

import { ActionType } from "./actions/ActionType";
import { PrinterSystemState, State, PressureControlAlgorithm, PressureControlDirection, Model, SlicingStatus, PrintControlEncoderMode, PressureControlPumpParameters, TrackRasterizationPreview, InspectImageType, InspectImage } from "./State";

import { PrinterUSBConnectionStateChanged } from "./actions/PrinterUSBConnectionStateChanged";
import { PrinterSystemStateResponseReceived } from "./actions/PrinterSystemStateResponseReceived";
import { InitializeWorker } from "./actions/InitializeWorker";
import {
    PrinterSystemState as ProtoPrinterSystemState,
    PressureControlDirection as ProtoPressureControlDirection,
    PressureControlAlgorithm as ProtoPressureControlAlgorithm,
    PressureControlPumpParameters as ProtoPressureControlPumpParameters,
    EncoderMode as ProtoEncoderMode,
    WaveformControlState
} from "../proto/compiled";
import { MovementStageConnectionChanged } from "./actions/MovementStageConnectionChanged";
import { MovementStagePositionChanged } from "./actions/MovementStagePositionChanged";
import { ProgramRunnerStateChanged } from "./actions/ProgramRunnerStateChanged";
import { DropwatcherNozzlePosChanged } from "./actions/DropwatcherNozzlePosChanged";
import { NozzleDataChanged } from "./actions/NozzleDataSet";
import { DropwatcherParametersChanged } from "./actions/DropwatcherParametersSet";
import { CameraStateChanged } from "./actions/CameraStateChanged";
import { OpenFile } from "./actions/OpenFile";
import { SaveToFile } from "./actions/SaveToFile";
import { ModelAdded } from "./actions/ModelAdded";
import { PrintBedViewStateChanged } from "./actions/PrintBedViewStateChanged";
import { ModelPositionChanged } from "./actions/ModelPositionChanged";
import { PrintingParamsChanged } from "./actions/PrintOptionsChanged";
import { getModelBoundingBox } from "../utils/getModelBoundingBox";
import { SaveToCurrentFile } from "./actions/SaveToCurrentFile";
import { ModelSelected } from "./actions/ModelSelected";
import { ImageSelected } from "./actions/ImageSelected";
import { ModelGroupParamsChanged, ModelParamsChanged } from "./actions/ModelParamsChanged";
import { SetSlicerWorker } from "./actions/SetSlicerWorker";
import { Slicer } from "../slicer/SlicerWorker";
import { PrintingTrack } from "./actions/PrintingTrack";
import { SetCustomTracks } from "./actions/SetCustomTracks";
import { moveAxisPositionFromPlanAndIncrement } from "../utils/moveAxisPositionFromPlanAndIncrement";
import { ModelGroupPrintingParams } from "../slicer/ModelGroupPrintingParams";
import { PrinterProgramState } from "../print-tasks/printer-program";
import { MovementStageTemperatureChanged } from "./actions/MovementStageTemperatureChanged";
import { InkControlActionChanged } from "./actions/InkControlActionChanged";
import { ValvePositionChanged } from "./actions/ValvePositionChanged";
import { OutputFolderChanged } from "./actions/OutputFolderChanged";
import { SaveImage } from "./actions/SaveImage";
import { CameraType } from "../CameraType";
import { RouteChanged } from "./actions/RouteChanged";
import { NozzleBlockStatusChanged } from "./actions/NozzleBlockStatusChanged";
import { timeStamp } from "console";
import { ToggleCameraView } from "./actions/ToggleCameraView";
import { ChangeCameraViewParams } from "./actions/ChangeCameraViewParams";

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
    | PrintBedViewStateChanged
    | ModelPositionChanged
    | PrintingParamsChanged
    | SaveToFile
    | OpenFile
    | SaveToCurrentFile
    | ModelSelected
    | ModelParamsChanged
    | SetSlicerWorker
    | PrintingTrack
    | SetCustomTracks
    | ModelGroupParamsChanged
    | MovementStageTemperatureChanged
    | InkControlActionChanged
    | ValvePositionChanged
    | OutputFolderChanged
    | SaveImage
    | ImageSelected
    | RouteChanged
    | NozzleBlockStatusChanged
    | ToggleCameraView
    | ChangeCameraViewParams
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
        case ProtoPrinterSystemState.PrinterSystemState_KEEP_ALIVE:
            return PrinterSystemState.KeepAlive;
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

function mapPressureControlParameters(p: ProtoPressureControlPumpParameters): PressureControlPumpParameters {
    return {
        algorithm: p.algorithm ? mapPressureControlAlgorithm(p.algorithm) : PressureControlAlgorithm.Unspecified,
        direction: p.direction ? mapPressureControlDirection(p.direction) : PressureControlDirection.Unspecified,
        feedPwm: p.feedPwm || 0,
        feedTime: p.feedTime || 0,
        maxPressureLimit: p.maxPressureLimit || 0,
        minPressureLimit: p.minPressureLimit || 0,
        targetPressure: p.targetPressure || 0
    };
}

function mapEncoderMode(a: ProtoEncoderMode): PrintControlEncoderMode {
    switch (a) {
        case ProtoEncoderMode.EncoderMode_UNSPECIFIED:
            return PrintControlEncoderMode.Unspecified;
        case ProtoEncoderMode.EncoderMode_OFF:
            return PrintControlEncoderMode.Off;
        case ProtoEncoderMode.EncoderMode_ON:
            return PrintControlEncoderMode.On;
        case ProtoEncoderMode.EncoderMode_PAUSED:
            return PrintControlEncoderMode.Paused;
        default:
            return PrintControlEncoderMode.Unspecified;
    }
}

function getNextModelId() {
    if (!state.models || state.models.length < 1) {
        return 0;
    }
    return Math.max(...state.models.map(m => Number(m.id))) + 1;
}

let slicer: Comlink.Remote<Slicer> = null;


async function rasterizeTrack() {
    if (state.printBedViewState.viewMode.mode != "rasterization") {
        return;
    }
    let viewMode = state.printBedViewState.viewMode;
    if (!state.printState.slicingState.printPlan) {
        return;
    }
    updateState(oldState => ({
        printState: {
            ...oldState.printState,
            slicingState: {
                ...oldState.printState.slicingState,
                slicingStatus: SlicingStatus.InProgress,
                currentRasterization: null
            }
        }
    }));
    let rasterizeLayers = Array.from(
        { length: (state.printBedViewState.viewLayerTo + 1) - state.printBedViewState.viewLayerFrom },
        (_, i) => state.printBedViewState.viewLayerFrom + i
    );
    console.log("Rasterizing layers", rasterizeLayers);
    let result = await Promise.all(rasterizeLayers.map(async layer => {
        let layerPlan = state.printState.slicingState.printPlan.layers[layer];
        let modelGroup = viewMode.modelGroup;
        let moveAxisPos = moveAxisPositionFromPlanAndIncrement(layerPlan, modelGroup, viewMode.trackIncrement);
        let r: TrackRasterizationPreview = {
            moveAxisPosition: moveAxisPos,
            result: await slicer.rasterizeTrack(modelGroup, layer, moveAxisPos)
        };
        return r;
    }));
    updateState(oldState => ({
        printState: {
            ...oldState.printState,
            slicingState: {
                ...oldState.printState.slicingState,
                currentRasterization: result,
                slicingStatus: SlicingStatus.Done
            }
        }
    }));
}

async function updateSlicerParams() {
    updateState(oldState => ({
        printState: {
            ...oldState.printState,
            slicingState: {
                ...oldState.printState.slicingState,
                currentRasterization: null,
                printPlan: null,
                slicingStatus: SlicingStatus.None,
            }
        }
    }));
    if (state.models.length < 1) {
        return;
    }
    if (slicer == null) {
        console.error("Slicer not set");
        return;
    }
    await slicer.setParams(
        state.printState.printerParams,
        state.printState.printingParams,
        state.models,
        state.printState.modelParams,
        state.printState.modelGroupPrintingParams
    );
    let completePlan = await slicer.getPrintPlan();


    updateState(oldState => ({
        printState: {
            ...oldState.printState,
            slicingState: {
                ...oldState.printState.slicingState,
                printPlan: completePlan,
            }
        }
    }));

    await rasterizeTrack();
}

async function modelAdded(msg: ModelAdded) {
    let bb = getModelBoundingBox(msg.model);
    let model: Model = {
        fileName: msg.model.fileName,
        layers: msg.model.layers,
        boundingBox: bb,
        id: msg.model.id || `${getNextModelId()}`
    };
    updateState(oldState => ({
        models: [...oldState.models, model],
        printState: {
            ...oldState.printState,
            modelParams: {
                ...oldState.printState.modelParams,
                [model.id]: {
                    position: [10, 10],
                    iterativeOffset: 0,
                    modelGroupId: null
                }
            }
        }
    }));
    await updateSlicerParams();
}

async function reslice() {
    if (null == slicer) {
        return;
    }
    await rasterizeTrack();
}

interface SaveableTree {
    models: typeof state.models;
    printState: {
        modelParams: typeof state.printState.modelParams;
        printingParams: typeof state.printState.printingParams;
        modelGroupPrintingParams: typeof state.printState.modelGroupPrintingParams;
    }
}

function createSaveableTree(): SaveableTree {
    return {
        models: state.models,
        printState: {
            modelParams: state.printState.modelParams,
            printingParams: state.printState.printingParams,
            modelGroupPrintingParams: state.printState.modelGroupPrintingParams
        }
    }
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
            mergeSystemStateResponse(msg);
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
        case ActionType.MovementStageTemperatureChanged:
            updateState(oldState => ({
                movementStageState: {
                    ...oldState.movementStageState,
                    bedTemperature: msg.temps.bed,
                    dryerTemperature: msg.temps.dryer
                }
            }));
            break;
        case ActionType.ProgramRunnerStateChanged:
            updateState(oldState => {
                let res: Partial<State> = {
                    programRunnerState: msg.state,
                    currentProgram: msg.program
                };
                if (oldState.programRunnerState?.state != PrinterProgramState.Running &&
                    msg.state.state == PrinterProgramState.Running) {
                    res.printBedViewState = {
                        ...oldState.printBedViewState,
                        viewMode: {
                            mode: "printingTrack",
                            moveAxisPosition: 0
                        }
                    };
                }
                return res;
            });
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
                cameras: {
                    ...oldState.cameras,
                    [msg.cameraType]: {
                        ...oldState.cameras[msg.cameraType],
                        ...msg.state
                    }
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
            await modelAdded(msg);
            break;
        case ActionType.PrintBedViewStateChanged:

            updateState(oldState => {
                let viewLayerChanged = (msg.state.viewLayerFrom !== undefined && state.printBedViewState.viewLayerFrom != msg.state.viewLayerFrom)
                    || (msg.state.viewLayerTo !== undefined && state.printBedViewState.viewLayerTo != msg.state.viewLayerTo);
                let news = {
                    printBedViewState: {
                        ...oldState.printBedViewState,
                        ...msg.state
                    }
                };
                if (viewLayerChanged && news.printBedViewState.viewMode.mode == "rasterization") {
                    news.printBedViewState.viewMode.trackIncrement = 0;
                }
                return news;
            });
            if (state.printBedViewState.viewMode.mode == "rasterization") {
                await reslice();
            }
            break;
        case ActionType.ModelPositionChanged:
            updateState(oldState => ({
                printState: {
                    ...oldState.printState,
                    modelParams: {
                        ...oldState.printState.modelParams,
                        [msg.id]: {
                            ...oldState.printState.modelParams[msg.id],
                            position: msg.position
                        }
                    }
                }
            }));
            await updateSlicerParams();
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
            await updateSlicerParams();
            break;
        case ActionType.SaveToFile:
            await saveToFile(msg.handle);
            break;
        case ActionType.OpenFile:
            await openFile(msg);
            break;
        case ActionType.SaveToCurrentFile:
            if (null == state.currentFileState.currentFile) {
                console.error("No current file to save to");
                return;
            }
            await saveToFile(state.currentFileState.currentFile);
            break;
        case ActionType.ModelSelected:
            updateState(oldState => ({
                printBedViewState: {
                    ...oldState.printBedViewState,
                    selectedModelId: msg.modelId
                }
            }));
            break;
        case ActionType.ModelParamsChanged:
            updateState(oldState => ({
                printState: {
                    ...oldState.printState,
                    modelParams: {
                        ...oldState.printState.modelParams,
                        [msg.id]: {
                            ...oldState.printState.modelParams[msg.id],
                            ...msg.params
                        }
                    }
                }
            }));
            await updateSlicerParams();
            break;
        case ActionType.SetSlicerWorker:
            slicer = Comlink.wrap<Slicer>(msg.messagePort);
            break;
        case ActionType.PrintingTrack:
            updateState(oldState => ({
                printState: {
                    ...oldState.printState,
                    currentPrintingTrack: {
                        track: msg.trackRasterizationResult,
                        moveAxisPosition: msg.moveAxisPos
                    }
                },
            }));
            if (state.printBedViewState.viewMode.mode == "printingTrack") {
                updateState(oldState => ({
                    printBedViewState: {
                        ...oldState.printBedViewState,
                        viewMode: {
                            mode: "printingTrack",
                            moveAxisPosition: msg.moveAxisPos
                        },
                        viewLayerFrom: msg.layer,
                        viewLayerTo: msg.layer
                    }
                }));
            }
            break;
        case ActionType.SetCustomTracks:
            updateState(oldState => ({
                printState: {
                    ...oldState.printState,
                    customTracks: msg.customTracks
                }
            }));
            break;
        case ActionType.ModelGroupParamsChanged:
            updateState(oldState => {
                let modelGroupParams: ModelGroupPrintingParams = {};
                let keyprop: keyof ModelGroupPrintingParams;
                for (keyprop in msg.params) {

                    if (!deepEquals(msg.params[keyprop], state.printState.printingParams[keyprop])) {
                        (<any>modelGroupParams[keyprop]) = msg.params[keyprop];
                    }
                }
                let old: ModelGroupPrintingParams = oldState.printState.modelGroupPrintingParams[msg.id] || {};
                let key: keyof ModelGroupPrintingParams;
                for (key in old) {
                    if (old.hasOwnProperty(key) && !msg.params.hasOwnProperty(key)) {
                        (<any>modelGroupParams[key]) = old[key];
                    }
                }
                return {
                    printState: {
                        ...oldState.printState,
                        modelGroupPrintingParams: {
                            ...oldState.printState.modelGroupPrintingParams,
                            [msg.id]: modelGroupParams
                        }
                    }
                };
            });
            await updateSlicerParams();
            break;
        case ActionType.InkControlActionChanged:
            updateState(oldState => ({
                inkControlAction: {
                    ...oldState.inkControlAction,
                    ...msg.state
                }
            }));
            break;
        case ActionType.ValvePositionsChanged:
            updateState(oldState => ({
                printerSystemState: {
                    ...oldState.printerSystemState,
                    valves: {
                        ...oldState.printerSystemState.valves,
                        ...msg.state
                    }
                }
            }));
            break;
        case ActionType.OutputFolderChanged:
            await outputFolderChanged(msg);
            break;
        case ActionType.SaveImage:
            await saveImage(msg);
            break;
        case ActionType.ImageSelected:
            updateState(oldState => ({
                inspect: {
                    ...oldState.inspect,
                    selectedImageFileName: msg.filename
                }
            }));
            break;
        case ActionType.RouteChanged:
            updateState(oldState => ({
                currentRoute: msg.route
            }));
            break;
        case ActionType.NozzleBlockStatusChanged:
            updateState(oldState => {
                let blockedNozzles = oldState.printState.printerParams.blockedNozzles || [];
                for (let m of msg.state) {
                    if (m.blocked) {
                        blockedNozzles = [...blockedNozzles, m.nozzleId];
                    } else {
                        blockedNozzles = blockedNozzles.filter(n => n !== m.nozzleId);
                    }
                }
                return {
                    printState: {
                        ...oldState.printState,
                        printerParams: {
                            ...oldState.printState.printerParams,
                            blockedNozzles: blockedNozzles
                        }
                    }
                }
            });
            await updateSlicerParams();
            break;
        case ActionType.ToggleCameraView:
            updateState(oldState => ({
                cameraView: {
                    ...oldState.cameraView,
                    visible: !oldState.cameraView.visible
                }
            }));
            break;
        case ActionType.ChangeCameraViewParams:
            updateState(oldState => ({
                cameraView: {
                    ...oldState.cameraView,
                    ...msg.state
                }
            }));
            break;
    }
}

function deepEquals(o1: any, o2: any): boolean {
    if (o1 === o2) {
        return true;
    }
    if (o1 == null || o2 == null) {
        return false;
    }
    if (typeof o1 != "object" || typeof o2 != "object") {
        return false;
    }
    let keys1 = Object.keys(o1);
    let keys2 = Object.keys(o2);
    if (keys1.length != keys2.length) {
        return false;
    }
    for (let key of keys1) {
        if (!deepEquals(o1[key], o2[key])) {
            return false;
        }
    }
    return true;

}

self.addEventListener("message", ev => {
    let msg: Actions = ev.data;
    handleMessage(msg).catch(err => console.error(err));
});

function mergeSystemStateResponse(msg: PrinterSystemStateResponseReceived) {
    updateState(oldState => {
        let pressureControlState = oldState.printerSystemState.pressureControl;

        if (msg.response.pressureControl) {
            let pressure = [...oldState.printerSystemState.pressureControl?.pressure || [], { mbar: msg.response.pressureControl ? Number(msg.response.pressureControl.pressure || 0) : undefined, timestamp: new Date() }];
            if (pressure.length > maxPressureHistory) {
                pressure = pressure.slice(pressure.length - maxPressureHistory);
            }
            pressureControlState = {
                ...oldState.printerSystemState.pressureControl,
                pressure: pressure,
                done: msg.response.pressureControl ? Boolean(msg.response.pressureControl.done) : undefined,
                enabled: msg.response.pressureControl ? Boolean(msg.response.pressureControl.enabled) : undefined,
            };
            if (msg.response.pressureControl.parameters?.inkPump) {
                pressureControlState.inkPump = mapPressureControlParameters(msg.response.pressureControl.parameters.inkPump);
            }
            if (msg.response.pressureControl.parameters?.cappingPump) {
                pressureControlState.cappingPump = mapPressureControlParameters(msg.response.pressureControl.parameters.cappingPump);
            }
        }

        let printControlState = oldState.printerSystemState.printControl;
        if (msg.response.printControl) {
            printControlState = {
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
                encoderMode: msg.response.printControl.encoderMode ? mapEncoderMode(msg.response.printControl.encoderMode) : PrintControlEncoderMode.Unspecified,
                lostLinesBySlowData: msg.response.printControl.lostLinesBySlowData || 0,
            };
        }
        let waveformControlState = oldState.printerSystemState.waveformControl;
        if (msg.response.waveformControl) {
            let waveformControl: WaveformControlState = msg.response.waveformControl;
            waveformControlState = {
                voltageMv: waveformControl.voltageMv == 0 ? null : waveformControl.voltageMv,
                setVoltageMv: waveformControl.setVoltageMv == 0 ? null : waveformControl.setVoltageMv,
                clockPeriodNs: waveformControl.clockPeriodNs == 0 ? null : waveformControl.clockPeriodNs,
            };
        }
        return {
            printerSystemState: {
                ...oldState.printerSystemState,
                state: mapPrinterSystemState(msg.response.state),
                errors: {
                    flags: Number(msg.response.errorFlags || 0)
                },
                pressureControl: pressureControlState,
                printControl: printControlState,
                waveformControl: waveformControlState
            }
        };
    });
}

async function openFile(msg: OpenFile) {
    let file = await msg.handle.getFile();
    let text = await file.text();
    let tree: SaveableTree = JSON.parse(text);
    updateState(oldState => ({
        models: tree.models,
        printState: {
            ...oldState.printState,
            modelParams: tree.printState.modelParams,
            printingParams: tree.printState.printingParams,
            modelGroupPrintingParams: tree.printState.modelGroupPrintingParams
        },
        currentFileState: {
            currentFile: msg.handle,
            saving: false,
            lastSaved: null
        },
        selectedModelId: null
    }));
    await updateSlicerParams();
}

async function saveToFile(handle: FileSystemFileHandle) {
    updateState(oldState => ({
        currentFileState: {
            ...oldState.currentFileState,
            currentFile: handle,
            saving: true,
        }
    }));
    let writeable = await handle.createWritable();
    let saveTree = createSaveableTree();
    console.log("Saving", saveTree);
    let blob = new Blob([JSON.stringify(saveTree)], { type: "application/json" });
    await writeable.write(blob);
    await writeable.close();
    updateState(oldState => ({
        currentFileState: {
            ...oldState.currentFileState,
            saving: false,
            lastSaved: new Date()
        }
    }));
}

function getImageFolder(inspectImageType: InspectImageType) {
    switch (inspectImageType) {
        case InspectImageType.NozzleTest:
            return "nozzletest";
        case InspectImageType.Dropwatcher:
            return "dropwatcher";
        case InspectImageType.PhotoPoint:
            return "photopoints";
    }
}

async function saveImage(saveImgMsg: SaveImage) {
    if (!state.inspect.outputFolder) {
        console.error("No output folder set");
        return;
    }
    let folder = state.inspect.outputFolder;
    let subFolder = getImageFolder(saveImgMsg.imageType);

    folder = await state.inspect.outputFolder.getDirectoryHandle(subFolder, { create: true });
    if (!folder) {
        console.error("Could not create folder", subFolder);
        return;
    }

    let fileNameBase: string = saveImgMsg.fileName;
    if (!fileNameBase) {
        switch (saveImgMsg.camera) {
            case CameraType.Dropwatcher:
                fileNameBase = "dropwatcher";
                break;
            case CameraType.Microscope:
                fileNameBase = "microscope";
                break;
        }
    }
    let fileName = `${fileNameBase}.png`;
    let files: string[] = [];
    for await (let entry of folder.values()) {
        if (entry.kind == "file") {
            files.push(entry.name);
        }
    }
    let i = 0;
    while (files.includes(fileName)) {
        i++;
        fileName = `${fileNameBase}_${i}.png`;
    }
    let file = await folder.getFileHandle(fileName, { create: true });
    let writable = await file.createWritable();
    await writable.write(saveImgMsg.image);
    await writable.close();
    let fileTimeStamp = (await file.getFile()).lastModified;
    updateState(oldState => ({
        inspect: {
            ...oldState.inspect,
            images: [...oldState.inspect.images, {
                file: file,
                metadata: {
                    type: saveImgMsg.imageType,
                    timestamp: new Date(fileTimeStamp)
                }
            }],
            selectedImageFileName: fileName
        }
    }));
}

async function* enumerateFolder(folder: FileSystemDirectoryHandle, type: InspectImageType) {
    for await (let entry of folder.values()) {
        if (entry.kind == "file" && entry.name.endsWith(".png")) {
            let file = await entry.getFile();
            let img: InspectImage = {
                file: entry,
                metadata: {
                    timestamp: new Date(file.lastModified),
                    type: type
                }
            }
            yield img;
        }
    }

}

async function enumerateImages() {
    if (!state.inspect.outputFolder) {
        console.error("No output folder set");
        updateState(oldState => ({
            inspect: {
                ...oldState.inspect,
                images: []
            }
        }));
    }
    let images = [];
    let searchMap: {
        [key: string]: InspectImageType
    } = {
        "nozzletest": InspectImageType.NozzleTest,
        "dropwatcher": InspectImageType.Dropwatcher,
        "photopoints": InspectImageType.PhotoPoint
    };
    for await (let entry of state.inspect.outputFolder.values()) {
        if (entry.kind == "directory") {
            if (searchMap[entry.name] != null) {
                let type = searchMap[entry.name];
                let folder = await state.inspect.outputFolder.getDirectoryHandle(entry.name);
                for await (let img of enumerateFolder(folder, type)) {
                    images.push(img);
                }
            }
        }
    }
    for await (let img of enumerateFolder(state.inspect.outputFolder, InspectImageType.Unknown)) {
        images.push(img);
    }
    updateState(oldState => ({
        inspect: {
            ...oldState.inspect,
            images: images
        }
    }));
}

async function outputFolderChanged(msg: OutputFolderChanged) {
    updateState(oldState => ({
        inspect: {
            ...oldState.inspect,
            outputFolder: msg.folder,
            selectedImageFileName: null
        }
    }));
    await enumerateImages();
}