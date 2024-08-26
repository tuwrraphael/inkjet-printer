import { GCodeRunner } from "../../gcode-runner";
import { PrinterUSB } from "../../printer-usb";
import { ChangePrintMemoryRequest, ChangeEncoderModeSettingsRequest, PrintControlEncoderModeSettings, ChangeEncoderModeRequest } from "../../proto/compiled";
import { getNozzleTestTracks } from "../../slicer/getNozzleTestTracks";
import { PrintingTrack } from "../../state/actions/PrintingTrack";
import { CustomTrack } from "../../state/State";
import { Store } from "../../state/Store";
import { AutofocusCache } from "../AutofocusCache";
import { CheckNozzlesTask } from "../printer-program";
import { PrinterTaskCancellationToken } from "../PrinterTaskCancellationToken";
import { printBedPositionToMicroscope } from "../../utils/printBedPositionToMicroscope";
import { CameraAccess } from "../../camera-access";
import { CameraType } from "../../CameraType";
import { DropDetector } from "../../vision/DropDetector";
import { AddNozzleTestResult } from "../../state/actions/AddNozzleTestResult";

export class CheckNozzleTaskRunner {
    constructor(private task: CheckNozzlesTask,
        private movementExecutor: GCodeRunner,
        private printerUSB: PrinterUSB,
        private store: Store,
        private autofocusCache: AutofocusCache) {
    }
    async run(cancellationToken: PrinterTaskCancellationToken) {
        await this.movementExecutor.moveAbsoluteZAndWait(this.task.safeTravelHeight, 10000);
        await this.movementExecutor.moveAbsoluteXYAndWait(0, this.store.state.printState.printerParams.buildPlate.height, 10000);
        await this.movementExecutor.moveAbsoluteZAndWait(this.task.nozzleTestSurfaceHeight, 10000);
        let dropDetector = new DropDetector();
        let tracks = this.generateTracks();
        await this.printTracks(tracks.customTracks, cancellationToken);
        let firstPhotoPoint = tracks.photoPoints.values().next().value;
        let firstPhotoPointMicroscope = printBedPositionToMicroscope(firstPhotoPoint, this.task.nozzleTestSurfaceHeight, this.store.state.printState.printerParams.printBedToCamera, this.store.state.printState.printerParams.movementRange);
        await this.movementExecutor.moveAbsoluteAndWait(firstPhotoPointMicroscope.microscopePos.x, firstPhotoPointMicroscope.microscopePos.y, firstPhotoPointMicroscope.microscopePos.z, 10000);
        let cancelNozzlePriming = this.nozzlePriming();
        let focus = null;// this.autofocusCache.get(microscopePos.microscopePos.x, microscopePos.microscopePos.y);
        try {
            for (let photoPointEntry of tracks.photoPoints.entries()) {
                let photoPoint = photoPointEntry[1];
                let nozzle = photoPointEntry[0];
                let microscopePos = printBedPositionToMicroscope(photoPoint, this.task.nozzleTestSurfaceHeight, this.store.state.printState.printerParams.printBedToCamera, this.store.state.printState.printerParams.movementRange);
                if (!microscopePos.feasible) {
                    throw new Error("Nozzle test point is out of bounds");
                }
                let cameraAccess = CameraAccess.getInstance(CameraType.Microscope);
                if (focus != null) {
                    await this.movementExecutor.moveAbsoluteAndWait(microscopePos.microscopePos.x, microscopePos.microscopePos.y, focus, 3000);
                } else {
                    await this.movementExecutor.moveAbsoluteAndWait(microscopePos.microscopePos.x, microscopePos.microscopePos.y, microscopePos.microscopePos.z, 1000);
                    let res = await cameraAccess.performAutoFocus(0.5, 0.5, this.movementExecutor);
                    this.autofocusCache.set(microscopePos.microscopePos.x, microscopePos.microscopePos.y, this.store.state.movementStageState.pos.z);
                    focus = this.store.state.movementStageState.pos.z;
                }
                await new Promise(resolve => setTimeout(resolve, 500));
                let imageData = await cameraAccess.saveImage(`nozzletest_${this.task.layerNr}_${nozzle}`, "nozzletest");
                let drops = dropDetector.detectDrops(imageData);
                console.log(`Nozzle ${nozzle} drop count: ${drops.drops.length}, avg diameter: ${dropDetector.averageDropSize(drops.drops)}`, drops.drops);
                // this.store.postAction(new AddNozzleTestResult(nozzle, drops.drops.map(d => ({
                //     x: d.x,
                //     y: d.y,
                //     diameter: d.diameter,
                // }))));
            }
        }
        finally {
            cancelNozzlePriming();
        }
    }

    private generateTracks() {
        let moveAxisPos = 5;
        let stride = 32;
        let fireEveryTicks = 8;
        let numNozzles = 16;
        let res = getNozzleTestTracks(
            this.task.startNozzle,
            numNozzles,
            moveAxisPos,
            this.store.state.printState.printerParams,
            fireEveryTicks, 3500, stride);
        let offsetSecondBlock = this.store.state.printState.printerParams.numNozzles / stride;
        let offsetTicks = 70;
        let res2 = getNozzleTestTracks(
            this.task.startNozzle + offsetSecondBlock,
            numNozzles,
            moveAxisPos + (offsetSecondBlock - 1) * this.store.state.printState.printerParams.printheadSwathePerpendicular / (this.store.state.printState.printerParams.numNozzles - 1),
            this.store.state.printState.printerParams,
            8, 3570, 32);
        return {
            customTracks: res.customTracks.concat(res2.customTracks),
            photoPoints: new Map((Array.from(res.photoPoints.entries()).concat(Array.from(res2.photoPoints.entries()))))
        };
    }

    private nozzlePriming(): () => Promise<void> {
        let canceled: () => void;
        let timeoutToken: NodeJS.Timeout;
        let loopStarted = false;
        let primingLoop = () => {
            loopStarted = true;
            this.printerUSB.sendNozzlePrimingRequestAndWait().then(() => {
                loopStarted = false;
                if (!canceled) {
                    timeoutToken = setTimeout(() => {
                        primingLoop();
                    }, 5000);
                } else {
                    canceled();
                }
            });
        }
        primingLoop();
        return () => {
            clearTimeout(timeoutToken);
            return new Promise<void>((resolve, reject) => {
                if (loopStarted) {
                    canceled = resolve;
                } else {
                    resolve();
                }
            });
        };
    }

    private async printTracks(customTracks: CustomTrack[],
        cancellationToken: PrinterTaskCancellationToken) {
        for (let t of customTracks.map((t) => { return { pos: t.moveAxisPos, track: t.track } })) {
            let printTrack = t.track
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
            encoderModeSettings.fireEveryTicks = 8; // 90 dpi
            encoderModeSettings.printFirstLineAfterEncoderTick = printTrack.printFirstLineAfterEncoderTick;
            encoderModeSettings.linesToPrint = printTrack.linesToPrint;
            encoderModeSettings.sequentialFires = 1
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