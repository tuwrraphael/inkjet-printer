import { PrinterUSB } from "../../printer-usb";
import { ChangePrintMemoryRequest } from "../../proto/compiled";
import { Store } from "../../state/Store";
import { PrinterTaskWriteTrack } from "../printer-program";


export class WriteTrackTaskRunner {
    constructor(private task: PrinterTaskWriteTrack,
        private printerUsb: PrinterUSB,
        private store: Store) {
    }
    async run() {
        let data = this.store.state.printState.slicingState.track;
        let chunkSize = 8;
        for (let i = 0; i < data.length; i += chunkSize) {
            let chunk = data.slice(i, i + chunkSize);
            var printMemoryRequest = new ChangePrintMemoryRequest();
            printMemoryRequest.data = Array.from(chunk);
            printMemoryRequest.offset = i;
            await this.printerUsb.sendChangePrintMemoryRequest(printMemoryRequest);
        }
    }
}