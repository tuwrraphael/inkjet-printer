// import { HelloWorldProgamSteps } from "./HelloWorldProgram";
import { PrinterProgram, PrinterTask, PrinterTaskHome, PrinterTaskPrimeNozzle, PrinterTaskSetTargetPressure, PrinterTaskType, PrinterTasks } from "./printer-program";

export const HomeProgram: PrinterProgram = {
    tasks: [
        // {
        //     type: PrinterTaskType.Home
        // },
        {
            type: PrinterTaskType.PrimeNozzle,
        },
        {
            type: PrinterTaskType.SetTargetPressure,
            targetPressure: -5
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

export const MoveTestProgram: PrinterProgram = {
    tasks: [
        {
            type: PrinterTaskType.Home,
        },
        {
            type: PrinterTaskType.Move,
            x: 100,
            y: 100,
            z: 0,
            feedRate: 400
        },
        {
            type: PrinterTaskType.Move,
            x: 0,
            y: 0,
            z: 0,
            feedRate: 400
        }
    ]
};

// export const HelloWorldProgram : PrinterProgram = {
//     tasks: [
//         { type:PrinterTaskType.Home},
//         ...HelloWorldProgamSteps
//     ]
// };

// let pressureTestProgram 