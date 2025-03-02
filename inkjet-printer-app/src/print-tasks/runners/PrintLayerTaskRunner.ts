import { PrinterUSB } from "../../printer-usb";
import { ChangeEncoderModeRequest, ChangeEncoderModeSettingsRequest, ChangePrinterSystemStateRequest, ChangePrintMemoryRequest, ChangeWaveformControlSettingsRequest, PrintControlEncoderModeSettings, PrinterSystemState } from "../../proto/compiled";
import { SlicerClient } from "../../slicer/SlicerClient";
import { TrackPlan } from "../../slicer/TrackPlan";
import { Store } from "../../state/Store";
import { PrintingTrack } from "../../state/actions/PrintingTrack";
import { PrinterTaskPrintCustomTracksTask, PrintLayerTask } from "../printer-program";
import { CanceledError, PrinterTaskCancellationToken } from "../PrinterTaskCancellationToken";
import { WavefromControlSettings } from "../../proto/compiled";
import { printBedPositionToMicroscope } from "../../utils/printBedPositionToMicroscope";
import { CameraAccess } from "../../camera-access";
import { CameraType } from "../../CameraType";
import { GCodeRunner } from "../../gcode-runner";
import { AutofocusCache } from "../AutofocusCache";
import { kHzToNs } from "../../utils/kHzToNs";
import { InspectImageType } from "../../state/State";

export class PrintLayerTaskRunner {
    constructor(private task: PrintLayerTask,
        private movementExecutor: GCodeRunner,
        private slicerClient: SlicerClient,
        private printerUSB: PrinterUSB,
        private store: Store,
        private autofocusCache: AutofocusCache) {
    }
    async run(cancellationToken: PrinterTaskCancellationToken) {
        try {
            cancellationToken.throwIfCanceled();
            let setVoltage = this.store.state.printerSystemState.waveformControl.setVoltageMv;

            let orderedGroups = this.task.layerPlan.modelGroupPlans.slice().sort((a, b) => {
                let distA = Math.floor(a.printingParams.waveform.voltage * 1000) == setVoltage;
                let distB = Math.floor(b.printingParams.waveform.voltage * 1000) == setVoltage;
                if (distA < distB) {
                    return -1;
                }
                if (distA > distB) {
                    return 1;
                }
                return 0;
            });

            for (let group of orderedGroups) {
                await this.movementExecutor.moveAbsoluteZAndWait(this.task.z, 500);
                await this.changeWaveformIfNeeded(group.printingParams.waveform.voltage, group.printingParams.waveform.clockFrequency, cancellationToken);
                for (let track of group.tracks) {
                    await this.printTrack(track, { layerNr: this.task.layerNr, modelGroupId: group.modelGroupId },
                        cancellationToken);
                    cancellationToken.throwIfCanceled();
                }
                await this.movementExecutor.setFanSpeed(255);
                let groupPrintingFinished = new Date();

                if (group.printingParams.photoPoints.length > 0) {

                    let photoPoint = group.printingParams.photoPoints[0];

                    let microscopePos = printBedPositionToMicroscope(photoPoint, this.task.z, this.store.state.printState.printerParams.printBedToCamera, this.store.state.printState.printerParams.movementRange);
                    if (microscopePos.feasible) {

                        let focus = null;// this.autofocusCache.get(microscopePos.microscopePos.x, microscopePos.microscopePos.y);
                        let cameraAccess = CameraAccess.getInstance(CameraType.Microscope);
                        if (focus != null) {
                            await this.movementExecutor.moveAbsoluteAndWait(microscopePos.microscopePos.x, microscopePos.microscopePos.y, focus, 15000);
                        } else {
                            await this.movementExecutor.moveAbsoluteAndWait(microscopePos.microscopePos.x, microscopePos.microscopePos.y, microscopePos.microscopePos.z, 15000);
                            // cancelPriming = this.nozzlePriming();
                            let res = await cameraAccess.performAutoFocus(0.5, 0.5, this.movementExecutor);
                            this.autofocusCache.set(microscopePos.microscopePos.x, microscopePos.microscopePos.y, this.store.state.movementStageState.pos.z);
                        }
                        await new Promise(resolve => setTimeout(resolve, 500));
                        let photoTime = new Date();
                        let driedForMs = +photoTime - +groupPrintingFinished;
                        await cameraAccess.saveImage(`${group.modelGroupId || 'no-group'}_layer${this.task.layerNr}_${driedForMs}ms`, InspectImageType.PhotoPoint);
                        cancellationToken.throwIfCanceled();
                    } else {
                        console.log("Skipping camera move, out of range");
                    }
                    cancellationToken.throwIfCanceled();
                }
                await this.movementExecutor.setFanSpeed(0);
            }

            let dryForMs = this.task.layerPlan.modelGroupPlans[0].printingParams.dryingTimeSeconds * 1000;
            if (dryForMs > 0) {
                let dryingPosition = {
                    x: this.store.state.printState.printerParams.dryingPosition.x,
                    y: this.store.state.printState.printerParams.dryingPosition.y
                };
                await this.movementExecutor.setFanSpeed(255);
                await this.movementExecutor.moveAbsoluteXYAndWait(dryingPosition.x, dryingPosition.y, 15000);
                try {
                    await this.movementExecutor.setDryingTemperatureAndWait(this.task.layerPlan.modelGroupPlans[0].printingParams.dryingTemperature);
                    cancellationToken.throwIfCanceled();

                    for (let driedForMs = 0; driedForMs < dryForMs; driedForMs += 1000) {
                        await new Promise((resolve) => {
                            setTimeout(resolve, 1000);
                        });
                        cancellationToken.throwIfCanceled();
                    }
                    await this.movementExecutor.setFanSpeed(0);
                } finally {
                    this.movementExecutor.setDryingTemperature(0).catch((e) => {
                        console.error("Failed to set drying temperature to 0", e);
                    });
                }
            }
        }
        catch (e) {
            if (e instanceof CanceledError) {
                console.error("PrintLayerTaskRunner canceled");
                return;
            }
            throw e;
        }
    }

    private async changeWaveformIfNeeded(voltage: number, frequency: number, cancellationToken: PrinterTaskCancellationToken) {

        let setVoltage = this.store.state.printerSystemState.waveformControl.setVoltageMv;
        let requiresVoltageChange = Math.floor(voltage * 1000) != setVoltage;
        let period = Math.round(kHzToNs(frequency));
        let setPeriod = this.store.state.printerSystemState.waveformControl.clockPeriodNs;
        let requiresPeriodChange = period != setPeriod;
        if (requiresVoltageChange || requiresPeriodChange) {
            console.log("Changing voltage to " + voltage + " and period to " + period);
            let changePrinterSystemStateRequest = new ChangePrinterSystemStateRequest();
            changePrinterSystemStateRequest.state = PrinterSystemState.PrinterSystemState_IDLE;
            await this.printerUSB.sendChangeSystemStateRequestAndWait(changePrinterSystemStateRequest);
            cancellationToken.throwIfCanceled();


            let request = new ChangeWaveformControlSettingsRequest();
            let settings = new WavefromControlSettings();
            request.settings = settings;
            settings.voltageMv = Math.floor(voltage * 1000);
            settings.clockPeriodNs = period;

            await this.printerUSB.sendChangeWaveformControlSettingsRequestAndWait(request);
            cancellationToken.throwIfCanceled();
            await new Promise(resolve => setTimeout(resolve, 3000));
            cancellationToken.throwIfCanceled();
            changePrinterSystemStateRequest.state = PrinterSystemState.PrinterSystemState_PRINT;
            await this.printerUSB.sendChangeSystemStateRequestAndWait(changePrinterSystemStateRequest);
            cancellationToken.throwIfCanceled();
        }
    }

    private async printTrack(trackPlan: TrackPlan,
        sliceInfo: {
            layerNr: number,
            modelGroupId: string,
        },
        cancellationToken: PrinterTaskCancellationToken) {
        await this.movementExecutor.moveAbsoluteXAndWait(trackPlan.moveAxisPosition, 10000);
        cancellationToken.throwIfCanceled();
        let track = await this.slicerClient.slicer.rasterizeTrack(sliceInfo.modelGroupId, sliceInfo.layerNr, trackPlan.moveAxisPosition);
        for (let t of [{ pos: trackPlan.moveAxisPosition, track: track.track }, ...track.correctionTracks.map((t) => { return { pos: t.moveAxisPos, track: t.track } })]) {
            let printTrack = t.track;
            if (printTrack.linesToPrint == 0) {
                return;
            }
            this.store.postAction(new PrintingTrack(this.task.layerNr, printTrack, t.pos));
            let chunkSize = 8;
            for (let i = 0; i < printTrack.data.length; i += chunkSize) {
                let chunk = printTrack.data.slice(i, i + chunkSize);
                var printMemoryRequest = new ChangePrintMemoryRequest();
                printMemoryRequest.data = Array.from(chunk);
                printMemoryRequest.offset = i;
                await this.printerUSB.sendChangePrintMemoryRequest(printMemoryRequest);
            }
            await this.movementExecutor.moveAbsoluteXYAndWait(t.pos, printTrack.startPrintAxisPosition, 10000);
            cancellationToken.throwIfCanceled();
            let changeEncoderModeSettingsRequest = new ChangeEncoderModeSettingsRequest();
            let encoderModeSettings = new PrintControlEncoderModeSettings();
            encoderModeSettings.fireEveryTicks = track.printingParams.fireEveryTicks;
            encoderModeSettings.printFirstLineAfterEncoderTick = printTrack.printFirstLineAfterEncoderTick;
            encoderModeSettings.linesToPrint = printTrack.linesToPrint;
            encoderModeSettings.sequentialFires = track.printingParams.sequentialFires;
            encoderModeSettings.startPaused = false;
            changeEncoderModeSettingsRequest.encoderModeSettings = encoderModeSettings;
            await this.printerUSB.sendChangeEncoderModeSettingsRequest(changeEncoderModeSettingsRequest);
            await this.movementExecutor.moveAbsoluteXYAndWait(t.pos, printTrack.endPrintAxisPosition, 6000);
            let changeEncoderModeRequest = new ChangeEncoderModeRequest();
            changeEncoderModeRequest.paused = true;
            await this.printerUSB.sendChangeEncoderModeRequest(changeEncoderModeRequest);
        }
    }
}



export class PrintCustomTracksTaskRunner {
    constructor(private task: PrinterTaskPrintCustomTracksTask,
        private movementExecutor: GCodeRunner,
        private slicerClient: SlicerClient,
        private printerUSB: PrinterUSB,
        private store: Store) {
    }
    async run(cancellationToken: PrinterTaskCancellationToken) {
        await this.movementExecutor.moveAbsoluteZAndWait(this.task.z, 150);
        cancellationToken.throwIfCanceled();
        for (let customTrack of this.task.customTracks) {
            await this.changeVoltageIfNeeded(this.task.printingParams.waveform.voltage, this.task.printingParams.waveform.clockFrequency, cancellationToken);
            await this.movementExecutor.moveAbsoluteXAndWait(customTrack.moveAxisPos, 10000);
            cancellationToken.throwIfCanceled();
            if (customTrack.track.linesToPrint == 0) {
                return;
            }
            this.store.postAction(new PrintingTrack(customTrack.layer, customTrack.track, customTrack.moveAxisPos));
            let chunkSize = 8;
            for (let i = 0; i < customTrack.track.data.length; i += chunkSize) {
                let chunk = customTrack.track.data.slice(i, i + chunkSize);
                var printMemoryRequest = new ChangePrintMemoryRequest();
                printMemoryRequest.data = Array.from(chunk);
                printMemoryRequest.offset = i;
                await this.printerUSB.sendChangePrintMemoryRequest(printMemoryRequest);
            }
            await this.movementExecutor.moveAbsoluteXYAndWait(customTrack.moveAxisPos, customTrack.track.startPrintAxisPosition, 10000);
            cancellationToken.throwIfCanceled();
            let changeEncoderModeSettingsRequest = new ChangeEncoderModeSettingsRequest();
            let encoderModeSettings = new PrintControlEncoderModeSettings();
            encoderModeSettings.fireEveryTicks = this.task.printingParams.fireEveryTicks;
            encoderModeSettings.printFirstLineAfterEncoderTick = customTrack.track.printFirstLineAfterEncoderTick;
            encoderModeSettings.linesToPrint = customTrack.track.linesToPrint;
            encoderModeSettings.sequentialFires = this.task.printingParams.sequentialFires;
            encoderModeSettings.startPaused = false;
            changeEncoderModeSettingsRequest.encoderModeSettings = encoderModeSettings;
            await this.printerUSB.sendChangeEncoderModeSettingsRequest(changeEncoderModeSettingsRequest);
            await this.movementExecutor.moveAbsoluteXYAndWait(customTrack.moveAxisPos, customTrack.track.endPrintAxisPosition, 3000);
            cancellationToken.throwIfCanceled();
            let changeEncoderModeRequest = new ChangeEncoderModeRequest();
            changeEncoderModeRequest.paused = true;
            await this.printerUSB.sendChangeEncoderModeRequest(changeEncoderModeRequest);
        }
    }

    private async changeVoltageIfNeeded(voltage: number, frequency: number, cancellationToken: PrinterTaskCancellationToken) {

        let setVoltage = this.store.state.printerSystemState.waveformControl.setVoltageMv;
        let requiresVoltageChange = Math.floor(voltage * 1000) != setVoltage;
        let period = Math.round(kHzToNs(frequency));
        let setPeriod = this.store.state.printerSystemState.waveformControl.clockPeriodNs;
        let requiresPeriodChange = period != setPeriod;
        if (requiresVoltageChange || requiresPeriodChange) {
            console.log("Changing voltage to " + voltage + " and period to " + period);
            let changePrinterSystemStateRequest = new ChangePrinterSystemStateRequest();
            changePrinterSystemStateRequest.state = PrinterSystemState.PrinterSystemState_IDLE;
            await this.printerUSB.sendChangeSystemStateRequestAndWait(changePrinterSystemStateRequest);
            cancellationToken.throwIfCanceled();


            let request = new ChangeWaveformControlSettingsRequest();
            let settings = new WavefromControlSettings();
            request.settings = settings;
            settings.voltageMv = Math.floor(voltage * 1000);
            settings.clockPeriodNs = period;

            await this.printerUSB.sendChangeWaveformControlSettingsRequestAndWait(request);
            cancellationToken.throwIfCanceled();
            await new Promise(resolve => setTimeout(resolve, 3000));
            cancellationToken.throwIfCanceled();
            changePrinterSystemStateRequest.state = PrinterSystemState.PrinterSystemState_PRINT;
            await this.printerUSB.sendChangeSystemStateRequestAndWait(changePrinterSystemStateRequest);
            cancellationToken.throwIfCanceled();
        }
    }
}