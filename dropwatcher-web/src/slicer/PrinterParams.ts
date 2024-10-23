import { PrintbedAnchor } from "./PrintbedAnchor";

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
    printBedToCamera: {
        x: number;
        y: number;
        z: number;
    };
    movementRange: {
        x: number;
        y: number;
        z: number;
    },
    anchors: PrintbedAnchor[];
}
