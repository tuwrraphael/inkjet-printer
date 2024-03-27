import { PrinterProgram, PrinterTaskHome, PrinterTaskPrimeNozzle, PrinterTaskSetTargetPressure, PrinterTaskType } from "./printer-program";

export const HomeProgram: PrinterProgram = {
    tasks: [
        // {
        //     type: PrinterTaskType.Home
        // },
        // new PrinterTaskPrimeNozzle(5, 20, 0.8),
        // new PrinterTaskSetTargetPressure(0),
        {
            type: PrinterTaskType.SetNozzleData,
            data: [0x1, 0xFFFFFFFF, 0xFFFFFFFF, 0xA1]
        },
        {
            type: PrinterTaskType.SetNozzleData,
            data: [0x1, 0xFFFFFFFF, 0xFFFFFFFF, 0xA2]
        },
        {
            type: PrinterTaskType.RequestFire
        },
        {
            type: PrinterTaskType.SetNozzleData,
            data: [0x1, 0xFFFFFFFF, 0xFFFFFFFF, 0xAF3]
        },
        {
            type: PrinterTaskType.RequestFire
        },
        {
            type: PrinterTaskType.RequestFire
        },
        {
            type: PrinterTaskType.SetNozzleData,
            data: [0x1, 0xFFFFFFFF, 0xFFFFFFFF, 0xAF4]
        },
        {
            type: PrinterTaskType.SetNozzleData,
            data: [0x1, 0xFFFFFFFF, 0xFFFFFFFF, 0xAF5]
        },
    ]
};

// let pressureTestProgram 