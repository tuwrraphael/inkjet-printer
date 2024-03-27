import { PrinterUSB } from "../../printer-usb";
import { SetNozzleDataRequest } from "../../proto/compiled";
import { PrinterTaskSetNozzleData } from "../printer-program";


export class SetNozzleDataTaskRunner {
    constructor(private task: PrinterTaskSetNozzleData, private printerUSB: PrinterUSB) {
    }
    async run() {
        let request = new SetNozzleDataRequest();
        request.data = this.task.data;
        await this.printerUSB.sendSetNozzleDataRequest(request);
    }
}
