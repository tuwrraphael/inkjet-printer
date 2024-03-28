import { PrinterProgram, PrinterTaskHome, PrinterTaskPrimeNozzle, PrinterTaskSetTargetPressure, PrinterTaskType } from "./printer-program";

export const HomeProgram: PrinterProgram = {
    tasks: [
        {
            type: PrinterTaskType.Home
        },
        {
            type: PrinterTaskType.PrimeNozzle,
            feedLimitPressure: 20,
            feedLimitPwm: 1,
            feedTime: 10
        },
        {
            type: PrinterTaskType.SetTargetPressure,
            targetPressure: 10
        }
        // new PrinterTaskSetTargetPressure(0),
        // {
        //     type: PrinterTaskType.SetNozzleData,
        //     data: [0x1, 0xFFFFFFFF, 0xFFFFFFFF, 0xA1]
        // },
        // {
        //     type: PrinterTaskType.SetNozzleData,
        //     data: [0x1, 0xFFFFFFFF, 0xFFFFFFFF, 0xA2]
        // },
        // {
        //     type: PrinterTaskType.RequestFire
        // },
        // {
        //     type: PrinterTaskType.SetNozzleData,
        //     data: [0x1, 0xFFFFFFFF, 0xFFFFFFFF, 0xAF3]
        // },
        // {
        //     type: PrinterTaskType.RequestFire
        // },
        // {
        //     type: PrinterTaskType.RequestFire
        // },
        // {
        //     type: PrinterTaskType.SetNozzleData,
        //     data: [0x1, 0xFFFFFFFF, 0xFFFFFFFF, 0xAF4]
        // },
        // {
        //     type: PrinterTaskType.SetNozzleData,
        //     data: [0x1, 0xFFFFFFFF, 0xFFFFFFFF, 0xAF5]
        // },
    ]
};

// let pressureTestProgram 