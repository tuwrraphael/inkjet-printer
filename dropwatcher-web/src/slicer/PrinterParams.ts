
export interface PrinterParams {
    numNozzles: number;
    printheadSwathePerpendicular: number;
    printheadAngleRads: number;
    buildPlate: {
        width: number;
        height: number;
    };
    encoder: {
        printAxis: {
            dpi: number;
            ticks: number;
        };
    };
    blockedNozzles: number[];
}
