import { PrinterParams } from "./TrackSlicer";
import { getPrintheadSwathe } from "./getPrintheadSwathe";

export function getNozzleDistance(printerParams: PrinterParams): { x: number, y: number } {
    let printheadSwathe = getPrintheadSwathe(printerParams);
    return {
        x: printheadSwathe.x / (printerParams.numNozzles - 1),
        y: printheadSwathe.y / (printerParams.numNozzles - 1)
    };
}
