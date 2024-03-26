import { GetPrinterSystemStateRequest, PressureControlChangeParametersRequest, PrinterRequest, PrinterSystemStateResponse } from "./proto/compiled";
import { Store } from "./state/Store";
import { PrinterSystemStateResponseReceived } from "./state/actions/PrinterSystemStateResponseReceived";
import { PrinterUSBConnectionStateChanged } from "./state/actions/PrinterUSBConnectionStateChanged";
import { WebUSBWrapper } from "./webusb";



export class PrinterUSB {
    private static instance: PrinterUSB;
    private store: Store;
    private webUsbWrapper: WebUSBWrapper;
    private pressureControlWaiting: (v: any) => void;
    constructor() {
        this.store = Store.getInstance();
        this.webUsbWrapper = new WebUSBWrapper();
        this.webUsbWrapper.addEventListener("connected", () => {
            this.store.postAction(new PrinterUSBConnectionStateChanged(true));
        });
        this.webUsbWrapper.addEventListener("disconnected", () => {
            this.store.postAction(new PrinterUSBConnectionStateChanged(false));
        });
        this.webUsbWrapper.addEventListener("data", (e: CustomEvent) => {
            let received: DataView = e.detail;
            let response = PrinterSystemStateResponse.decode(new Uint8Array(received.buffer));
            if (this.pressureControlWaiting && response.pressureControl.done) {
                this.pressureControlWaiting(response.pressureControl);
                this.pressureControlWaiting = undefined;
            }
            this.store.postAction(new PrinterSystemStateResponseReceived(response));
        });
    }

    static getInstance() {
        if (null == this.instance) {
            this.instance = new PrinterUSB();
        }
        return this.instance;
    }

    async connectNew() {
        await this.webUsbWrapper.connectNew(0x2FE3, 0x000A);
    }

    async start() {
        await this.webUsbWrapper.autoconnect(0x2FE3, 0x000A);
    }

    async sendPrinterSystemStateRequest() {
        let printerRequest = new PrinterRequest();
        printerRequest.getPrinterSystemStateRequest = new GetPrinterSystemStateRequest();
        await this.webUsbWrapper.send(PrinterRequest.encode(printerRequest).finish());
    }

    async sendPressureControlChangeParametersRequest(request: PressureControlChangeParametersRequest) {
        let printerRequest = new PrinterRequest();
        printerRequest.pressureControlChangeParametersRequest = request;
        await this.webUsbWrapper.send(PrinterRequest.encode(printerRequest).finish());
    }

    async sendPressureControlChangeParametersRequestAndWaitForDone(request: PressureControlChangeParametersRequest) {
        if (this.pressureControlWaiting) {
            throw new Error("Already waiting for pressure control change parameters request");
        } else {
            await this.sendPressureControlChangeParametersRequest(request);
            await new Promise((resolve) => {
                this.pressureControlWaiting = resolve;
            });
        }
    }
}
