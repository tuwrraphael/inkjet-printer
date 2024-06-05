// import { HelloWorldProgamSteps } from "./HelloWorldProgram";
import { PrinterProgram, PrinterTask, PrinterTaskHome, PrinterTaskPrimeNozzle, PrinterTaskSetTargetPressure, PrinterTaskType, PrinterTasks } from "./printer-program";

export const HomeProgram: PrinterProgram = {
    tasks: [
        // {
        //     type: PrinterTaskType.Home
        // },
        {
            type: PrinterTaskType.PrimeNozzle,
            feedLimitPressure: 20,
            feedLimitPwm: 1,
            feedTime: 10
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

function generateEncoderProgramSteps() {
    let steps: PrinterTasks[] = [];
    let x = 60;
    for (let i = 0; i < 100; i++) {
        steps.push({
            type: PrinterTaskType.Move,
            x: x,
            y: 175,
            z: 0.5,
            feedRate: 10000
        });
        steps.push({
            type: PrinterTaskType.ResetEncoder,
            fireEveryTicks: 1,
            printFirstLineAfterEncoderTick: 100,
            sequentialFires: 1
        });
        steps.push({
            type: PrinterTaskType.Move,
            x: x,
            y: 0,
            z: 0.5,
            feedRate: 3000
        });
    }
    return steps;

}

export const PrintEncoderProgram: PrinterProgram = {
    tasks: generateEncoderProgramSteps()
};

// export const HelloWorldProgram : PrinterProgram = {
//     tasks: [
//         { type:PrinterTaskType.Home},
//         ...HelloWorldProgamSteps
//     ]
// };

// let pressureTestProgram 