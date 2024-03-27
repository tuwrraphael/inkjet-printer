import { PrinterUSB } from "../../printer-usb";
import { PrinterTaskRequestFire } from "../printer-program";


export class RequestFireTaskRunner {
    constructor(private task: PrinterTaskRequestFire, private printerUSB: PrinterUSB) {
    }
    async run() {
        await this.printerUSB.sendFireRequest();
    }
}
