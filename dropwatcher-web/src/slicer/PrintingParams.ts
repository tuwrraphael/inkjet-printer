export interface PrintingParams {
    fireEveryTicks: number;
    sequentialFires: number;
    firstLayerHeight: number;
    encoderMargin: number;
    bedTemperature: number;
    dryingTime: number;
    offsetLayers: {
        printAxis: {
            everyOtherLayerByTicks: number | null
        },
        moveAxis: {
            randomizedStart: number | null,
            everyOtherLayerByNozzleDistanceFactor: number | null
        }
    }
}