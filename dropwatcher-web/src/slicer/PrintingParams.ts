export interface PrintingParams {
    fireEveryTicks: number;
    sequentialFires: number;
    firstLayerHeight: number;
    encoderMargin: number;
    bedTemperature: number;
    dryingTimeSeconds: number;
    waveform: {
        voltage: number;
    };
    skipNozzles: number;
    offsetLayers: {
        printAxis: {
            everyOtherLayerByTicks: number | null
        },
        moveAxis: {
            everyOtherLayerByNozzles: number | null
        }
    },
    photoPoints: { x: number, y: number }[];
    randomizeTracks : boolean;
}