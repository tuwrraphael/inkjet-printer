import { MovementStage } from "../../movement-stage";
import { PrinterUSB } from "../../printer-usb";
import { ChangeEncoderModeRequest, ChangeEncoderModeSettingsRequest, ChangePrintMemoryRequest, PrintControlEncoderModeSettings } from "../../proto/compiled";
import { SlicerClient } from "../../slicer/SlicerClient";
import { Store } from "../../state/Store";
import { PrintingTrack } from "../../state/actions/PrintingTrack";
import { PrinterTaskPrintCustomTracksTask, PrintTrackTask } from "../printer-program";

export class PrintTrackTaskRunner {
    constructor(private task: PrintTrackTask,
        private movementStage: MovementStage,
        private slicerClient: SlicerClient,
        private printerUSB: PrinterUSB,
        private store: Store) {
    }
    async run() {
        await this.movementStage.movementExecutor.moveAbsoluteXAndWait(this.task.moveAxisPos, 10000);
        let track = await this.slicerClient.slicer.rasterizeTrack(this.task.layer, this.task.moveAxisPos);
        if (track.linesToPrint == 0) {
            return;
        }
        this.store.postAction(new PrintingTrack(this.task.layer, track, this.task.moveAxisPos));
        let chunkSize = 8;
        for (let i = 0; i < track.data.length; i += chunkSize) {
            let chunk = track.data.slice(i, i + chunkSize);
            var printMemoryRequest = new ChangePrintMemoryRequest();
            printMemoryRequest.data = Array.from(chunk);
            printMemoryRequest.offset = i;
            await this.printerUSB.sendChangePrintMemoryRequest(printMemoryRequest);
        }
        await this.movementStage.movementExecutor.moveAbsoluteXYAndWait(this.task.moveAxisPos, track.startPrintAxisPosition, 10000);
        let changeEncoderModeSettingsRequest = new ChangeEncoderModeSettingsRequest();
        let encoderModeSettings = new PrintControlEncoderModeSettings();
        encoderModeSettings.fireEveryTicks = this.task.fireEveryTicks;
        encoderModeSettings.printFirstLineAfterEncoderTick = track.printFirstLineAfterEncoderTick;
        encoderModeSettings.linesToPrint = track.linesToPrint;
        encoderModeSettings.sequentialFires = this.task.sequentialFires;
        encoderModeSettings.startPaused = false;
        changeEncoderModeSettingsRequest.encoderModeSettings = encoderModeSettings;
        await this.printerUSB.sendChangeEncoderModeSettingsRequest(changeEncoderModeSettingsRequest);
        await this.movementStage.movementExecutor.moveAbsoluteXYAndWait(this.task.moveAxisPos, track.endPrintAxisPosition, 1000);
        let changeEncoderModeRequest = new ChangeEncoderModeRequest();
        changeEncoderModeRequest.paused = true;
        await this.printerUSB.sendChangeEncoderModeRequest(changeEncoderModeRequest);
    }
}



export class PrintCustomTracksTaskRunner {
    constructor(private task: PrinterTaskPrintCustomTracksTask,
        private movementStage: MovementStage,
        private slicerClient: SlicerClient,
        private printerUSB: PrinterUSB,
        private store: Store) {
    }
    async run() {
        for (let customTrack of this.task.customTracks) {
            await this.movementStage.movementExecutor.moveAbsoluteXAndWait(customTrack.moveAxisPos, 10000);
            // let track = await this.slicerClient.slicer.rasterizeTrack(this.task.layer, this.task.moveAxisPos);
            if (customTrack.track.linesToPrint == 0) {
                return;
            }
            // this.store.postAction(new PrintingTrack(this.task.layer, track, this.task.moveAxisPos));
            let chunkSize = 8;
            for (let i = 0; i < customTrack.track.data.length; i += chunkSize) {
                let chunk = customTrack.track.data.slice(i, i + chunkSize);
                var printMemoryRequest = new ChangePrintMemoryRequest();
                printMemoryRequest.data = Array.from(chunk);
                printMemoryRequest.offset = i;
                await this.printerUSB.sendChangePrintMemoryRequest(printMemoryRequest);
            }
            await this.movementStage.movementExecutor.moveAbsoluteXYAndWait(customTrack.moveAxisPos, customTrack.track.startPrintAxisPosition, 10000);
            let changeEncoderModeSettingsRequest = new ChangeEncoderModeSettingsRequest();
            let encoderModeSettings = new PrintControlEncoderModeSettings();
            encoderModeSettings.fireEveryTicks = this.task.fireEveryTicks;
            encoderModeSettings.printFirstLineAfterEncoderTick = customTrack.track.printFirstLineAfterEncoderTick;
            encoderModeSettings.linesToPrint = customTrack.track.linesToPrint;
            encoderModeSettings.sequentialFires = this.task.sequentialFires;
            encoderModeSettings.startPaused = false;
            changeEncoderModeSettingsRequest.encoderModeSettings = encoderModeSettings;
            await this.printerUSB.sendChangeEncoderModeSettingsRequest(changeEncoderModeSettingsRequest);
            await this.movementStage.movementExecutor.moveAbsoluteXYAndWait(customTrack.moveAxisPos, customTrack.track.endPrintAxisPosition, 500);
            let changeEncoderModeRequest = new ChangeEncoderModeRequest();
            changeEncoderModeRequest.paused = true;
            await this.printerUSB.sendChangeEncoderModeRequest(changeEncoderModeRequest);
        }
    }
}