import { MovementStage } from "../../movement-stage";
import { PrinterUSB } from "../../printer-usb";
import { ChangeEncoderModeRequest, ChangeEncoderModeSettingsRequest, ChangePrintMemoryRequest, PrintControlEncoderModeSettings } from "../../proto/compiled";
import { PrintingParams } from "../../slicer/PrintingParams";
import { SlicerClient } from "../../slicer/SlicerClient";
import { TrackPlan } from "../../slicer/TrackPlan";
import { Store } from "../../state/Store";
import { PrintingTrack } from "../../state/actions/PrintingTrack";
import { PrinterTaskPrintCustomTracksTask, PrintLayerTask } from "../printer-program";
import { PrinterTaskCancellationToken } from "../PrinterTaskCancellationToken";
import { add } from "date-fns";

export class PrintLayerTaskRunner {
    constructor(private task: PrintLayerTask,
        private movementStage: MovementStage,
        private slicerClient: SlicerClient,
        private printerUSB: PrinterUSB,
        private store: Store) {
    }
    async run(cancellationToken: PrinterTaskCancellationToken) {
        await this.movementStage.movementExecutor.moveAbsoluteZAndWait(this.task.z, 150);
        if (cancellationToken.isCanceled()) {
            return;
        }
        let dryUntil: Date = new Date();
        for (let group of this.task.layerPlan.modelGroupPlans) {
            for (let track of group.tracks) {
                await this.printTrack(track, { layerNr: this.task.layerNr, modelGroupId: group.modelGroupId },
                    group.printingParams,
                    cancellationToken);
                if (cancellationToken.isCanceled()) {
                    return;
                }
                let dryGroupUntil = add(dryUntil, { seconds: group.printingParams.dryingTimeSeconds });
                if (dryGroupUntil > dryUntil) {
                    dryUntil = dryGroupUntil;
                }
            }
            if (cancellationToken.isCanceled()) {
                return;
            }
        }
        await this.movementStage.movementExecutor.moveAbsoluteAndWait(this.task.dryingPosition.x, this.task.dryingPosition.y, this.task.dryingPosition.z, 10000);
        if (cancellationToken.isCanceled()) {
            return;
        }
        await new Promise((resolve) => {
            setTimeout(resolve, dryUntil.getTime() - new Date().getTime());
        });
    }

    private async printTrack(trackPlan: TrackPlan,
        sliceInfo: {
            layerNr: number,
            modelGroupId: string,
        },
        printingParams: PrintingParams,
        cancellationToken: PrinterTaskCancellationToken) {
        await this.movementStage.movementExecutor.moveAbsoluteXAndWait(trackPlan.moveAxisPosition, 10000);
        if (cancellationToken.isCanceled()) {
            return;
        }
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
            await this.movementStage.movementExecutor.moveAbsoluteXYAndWait(t.pos, printTrack.startPrintAxisPosition, 10000);
            if (cancellationToken.isCanceled()) {
                return;
            }
            let changeEncoderModeSettingsRequest = new ChangeEncoderModeSettingsRequest();
            let encoderModeSettings = new PrintControlEncoderModeSettings();
            encoderModeSettings.fireEveryTicks = printingParams.fireEveryTicks;
            encoderModeSettings.printFirstLineAfterEncoderTick = printTrack.printFirstLineAfterEncoderTick;
            encoderModeSettings.linesToPrint = printTrack.linesToPrint;
            encoderModeSettings.sequentialFires = printingParams.sequentialFires;
            encoderModeSettings.startPaused = false;
            changeEncoderModeSettingsRequest.encoderModeSettings = encoderModeSettings;
            await this.printerUSB.sendChangeEncoderModeSettingsRequest(changeEncoderModeSettingsRequest);
            await this.movementStage.movementExecutor.moveAbsoluteXYAndWait(t.pos, printTrack.endPrintAxisPosition, 2000);
            let changeEncoderModeRequest = new ChangeEncoderModeRequest();
            changeEncoderModeRequest.paused = true;
            await this.printerUSB.sendChangeEncoderModeRequest(changeEncoderModeRequest);
        }
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
            await this.movementStage.movementExecutor.moveAbsoluteXYAndWait(customTrack.moveAxisPos, customTrack.track.endPrintAxisPosition, 3000);
            let changeEncoderModeRequest = new ChangeEncoderModeRequest();
            changeEncoderModeRequest.paused = true;
            await this.printerUSB.sendChangeEncoderModeRequest(changeEncoderModeRequest);
        }
    }
}