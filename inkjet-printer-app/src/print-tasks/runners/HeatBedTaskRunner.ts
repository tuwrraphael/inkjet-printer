import { GCodeRunner } from "../../gcode-runner";
import { PrinterUSB } from "../../printer-usb";
import { PrinterTaskHeadBed as PrinterTaskHeatBed } from "../printer-program";


export class HeatBedTaskRunner {
    constructor(private task: PrinterTaskHeatBed, private movementExecutor: GCodeRunner,
        private printerUSB: PrinterUSB) {
    }
    async run() {
        if (this.task.wait) {
            await this.movementExecutor.moveAbsoluteAndWait(this.task.primingPosition.x, this.task.primingPosition.y, this.task.primingPosition.z, 10000);
            // let cancelPrimingLoop = false;
            await this.movementExecutor.heatBedAndWait(this.task.temperature);
            // .finally(() => {
            //     cancelPrimingLoop = true;
            // })
            // while (!cancelPrimingLoop) {
            //     await this.printerUSB.sendNozzlePrimingRequestAndWait();
            //     await new Promise(resolve => setTimeout(resolve, 5000));
            // }
        }
        else {
            await this.movementExecutor.setBedTemperature(this.task.temperature);
        }
    }
}
