import { PrinterParams } from "./TrackSlicer";


export function getPrintheadSwathe(printerParams: PrinterParams): { x: number, y: number } {
    return {
        x: printerParams.printheadSwathePerpendicular * Math.cos(printerParams.printheadAngleRads),
        y: printerParams.printheadSwathePerpendicular * Math.sin(printerParams.printheadAngleRads)
    };
}
