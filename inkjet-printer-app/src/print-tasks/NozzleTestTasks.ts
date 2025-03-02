import { PrinterTasks, PrinterTaskType } from "./printer-program";

export function getNozzleTestTasks(layer: number): PrinterTasks[] {
    return [
        // {
        //     type: PrinterTaskType.NozzleWetting,
        //     pressureWetting: 3,
        //     pressurePrinting: -0.6,
        //     wettingWaitTime: 3000
        // },
        {
            type: PrinterTaskType.CheckNozzles,
            layerNr: layer,
            nozzleTestSurfaceHeight: 1,
            startNozzle: 0,
            safeTravelHeight: 10
        },
        {
            type: PrinterTaskType.Pause,
            message: "Nozzletest 1/4 completed, wipe the build plate and resume",
        },
        // {
        //     type: PrinterTaskType.NozzleWetting,
        //     pressureWetting: 3,
        //     pressurePrinting: -0.6,
        //     wettingWaitTime: 3000
        // },
        {
            type: PrinterTaskType.CheckNozzles,
            layerNr: layer,
            nozzleTestSurfaceHeight: 1,
            startNozzle: 8,
            safeTravelHeight: 10
        },
        {
            type: PrinterTaskType.Pause,
            message: "Nozzletest 2/4 completed, wipe the build plate and resume",
        },
        // {
        //     type: PrinterTaskType.NozzleWetting,
        //     pressureWetting: 3,
        //     pressurePrinting: -0.6,
        //     wettingWaitTime: 3000
        // },
        {
            type: PrinterTaskType.CheckNozzles,
            layerNr: layer,
            nozzleTestSurfaceHeight: 1,
            startNozzle: 16,
            safeTravelHeight: 10
        },
        {
            type: PrinterTaskType.Pause,
            message: "Nozzletest 3/4 completed, wipe the build plate and resume",
        },
        // {
        //     type: PrinterTaskType.NozzleWetting,
        //     pressureWetting: 3,
        //     pressurePrinting: -0.6,
        //     wettingWaitTime: 2000
        // },
        {
            type: PrinterTaskType.CheckNozzles,
            layerNr: layer,
            nozzleTestSurfaceHeight: 1,
            startNozzle: 24,
            safeTravelHeight: 10
        },
        {
            type: PrinterTaskType.Pause,
            message: "Nozzletest 4/4 completed, wipe the build plate, check and set blockages and resume",
        }
    ]
};