import { PrinterParams } from "./TrackSlicer";
import { getPrintheadSwathe } from "./getPrintheadSwathe";

export function getNozzleDistance(printerParams: PrinterParams) {
    let printheadSwathe = getPrintheadSwathe(printerParams);
    return printheadSwathe / (printerParams.numNozzles - 1);
}
