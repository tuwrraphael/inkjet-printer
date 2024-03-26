import { PrinterProgram, PrinterTaskHome, PrinterTaskPrimeNozzle, PrinterTaskSetTargetPressure } from "./printer-program";

export const HomeProgram: PrinterProgram = {
    tasks: [
        new PrinterTaskHome(),
        // new PrinterTaskPrimeNozzle(5, 20, 0.8),
        // new PrinterTaskSetTargetPressure(0),
    ]
};

// let pressureTestProgram 