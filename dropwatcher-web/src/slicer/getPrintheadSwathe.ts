import { PrinterParams } from "./TrackSlicer";


export function getPrintheadSwathe(printerParams: PrinterParams) {
    return printerParams.printheadSwathePerpendicular * Math.cos(printerParams.printheadAngleRads);
}
