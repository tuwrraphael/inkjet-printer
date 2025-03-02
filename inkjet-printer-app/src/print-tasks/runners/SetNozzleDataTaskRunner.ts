import { PrinterUSB } from "../../printer-usb";
import { PrinterTaskSetNozzleData } from "../printer-program";


export class SetNozzleDataTaskRunner {
    constructor(private task: PrinterTaskSetNozzleData, private printerUSB: PrinterUSB) {
    }
    async run() {
        await this.printerUSB.sendChangeNozzleDataRequest(this.task.data);
    }
}
