import { CustomTrack } from "../state/State";
import { getNozzleDistance } from "./getNozzleDistance";
import { PrinterParams } from "./PrinterParams";
import { setNozzleForRow } from "./setNozzleDataView";
import { TrackRasterization } from "./TrackRasterization";

export function getNozzleTestTracks(p_startNozzle: number,
    p_num_nozzles: number,
    moveAxisPos: number,
    printerParams: PrinterParams,
    fireEveryTicks: number,
    startEncoderTick: number,
    stride: number
): {
    customTracks: CustomTrack[],
    photoPoints: Map<number, { x: number, y: number }>
} {

    let tracks: CustomTrack[] = [];
    let boxHeightMM = 1.3;
    let rows = Math.ceil(boxHeightMM * printerParams.encoder.printAxis.dpi / (fireEveryTicks * 25.4));
    let spacingMM = 3;
    let spacingRows = Math.ceil(spacingMM * printerParams.encoder.printAxis.dpi / (fireEveryTicks * 25.4));
    let groups = p_num_nozzles / (printerParams.numNozzles / stride);
    let endStartNozzle = p_startNozzle + groups;
    let linesToPrint = groups * (rows + spacingRows);
    let colSpacing = 0.3;
    let numColumns = 6;

    let nozzleDistance = getNozzleDistance(printerParams);

    let currentRow = 0;
    let startPos = Math.max(0, startEncoderTick * 25.4 / printerParams.encoder.printAxis.dpi - 2);
    let r: TrackRasterization = {
        data: new Uint32Array(linesToPrint * 4),
        linesToPrint: linesToPrint,
        printFirstLineAfterEncoderTick: startEncoderTick,
        endPrintAxisPosition: startPos + groups * (boxHeightMM + spacingMM) + 2,
        startPrintAxisPosition: startPos,
        printLastLineAfterEncoderTick: fireEveryTicks * (linesToPrint - 1) + startEncoderTick,
    };
    r.data.fill(0)

    let which = new Map<number, number>();

    let photoPoints: Map<number, { x: number, y: number }> = new Map();


    for (let startNozzle = p_startNozzle; startNozzle < endStartNozzle; startNozzle += 1) {

        for (let nozzle = startNozzle; nozzle < 128; nozzle += stride) {
            for (let row = 0; row < rows; row++) {
                which.set(nozzle, which.get(nozzle) ? which.get(nozzle) + 1 : 1);
                setNozzleForRow(nozzle, true, r.data, currentRow + row);
            }
            let nozzleOffset = {
                x: nozzleDistance.x * (printerParams.numNozzles - 1 - nozzle),
                y: nozzleDistance.y * (printerParams.numNozzles - 1 - nozzle)
            }
            if (photoPoints.has(nozzle)) {
                throw new Error("Duplicate nozzle");
            }
            photoPoints.set(nozzle, {
                x:
                    nozzleOffset.x + moveAxisPos + ((numColumns - 1) * colSpacing) / 2,
                y:
                    nozzleOffset.y + boxHeightMM / 2 + (startEncoderTick + currentRow * fireEveryTicks) * 25.4 / printerParams.encoder.printAxis.dpi
            });
        }
        currentRow += spacingRows + rows;
    }
    for (let i = 0; i < numColumns; i++) {
        tracks.push({ layer: 0, track: r, moveAxisPos: moveAxisPos + i * colSpacing });
    }


    console.log(photoPoints);
    return {
        customTracks: tracks,
        photoPoints: photoPoints
    };
}