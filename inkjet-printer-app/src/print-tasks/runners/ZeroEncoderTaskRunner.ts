import { PrinterUSB } from "../../printer-usb";
import { ChangeEncoderPositionRequest } from "../../proto/compiled";
import { PrinterTaskZeroEncoder } from "../printer-program";


export class ZeroEncoderTaskRunner {
    constructor(private task: PrinterTaskZeroEncoder,
        private printerUsb: PrinterUSB) {
    }
    async run() {
        let changeEncoderPositionRequest = new ChangeEncoderPositionRequest();
        changeEncoderPositionRequest.position = 0;
        await this.printerUsb.sendChangeEncoderPositionRequest(changeEncoderPositionRequest);
    }
}
