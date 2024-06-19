import { PrinterUSB } from "../../printer-usb";
import { PrinterTaskPrimeNozzle } from "../printer-program";

export class PrimeNozzleTaskRunner {
    constructor(private task: PrinterTaskPrimeNozzle, private printerUSB: PrinterUSB
    ) {
    }
    async run() {
        await this.printerUSB.sendNozzlePrimingRequest();
    }
}
