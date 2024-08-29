import { PrinterTasks, PrinterTaskType } from "./printer-program";

export function getNozzleTestTasks(layer: number): PrinterTasks[] {
    return [
        {
            type: PrinterTaskType.CheckNozzles,
            layerNr: layer,
            nozzleTestSurfaceHeight: 1,
            startNozzle: 0,
            safeTravelHeight: 10
        },
        {
            type: PrinterTaskType.CheckNozzles,
            layerNr: layer,
            nozzleTestSurfaceHeight: 1,
            startNozzle: 8,
            safeTravelHeight: 10
        },
        {
            type: PrinterTaskType.CheckNozzles,
            layerNr: layer,
            nozzleTestSurfaceHeight: 1,
            startNozzle: 16,
            safeTravelHeight: 10
        },
        {
            type: PrinterTaskType.CheckNozzles,
            layerNr: layer,
            nozzleTestSurfaceHeight: 1,
            startNozzle: 24,
            safeTravelHeight: 10
        }
    ]
};