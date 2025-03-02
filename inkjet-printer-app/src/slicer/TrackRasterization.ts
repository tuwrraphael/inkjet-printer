

export interface TrackRasterization {
    data: Uint32Array;
    linesToPrint: number;
    printFirstLineAfterEncoderTick: number;
    printLastLineAfterEncoderTick: number;
    startPrintAxisPosition: number;
    endPrintAxisPosition: number;
}
