import {
    CameraFrameRequest,
    ChangeDropwatcherParametersRequest,
    ChangePressureControlParametersRequest,
    GetPrinterSystemStateRequest,
    PrinterRequest,
    PrinterSystemStateResponse,
    ChangeNozzleDataRequest
} from "./proto/compiled";
import { Store } from "./state/Store";
import { NozzleDataChanged } from "./state/actions/NozzleDataSet";
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

    async sendChangePressureControlParametersRequest(request: ChangePressureControlParametersRequest) {
        let printerRequest = new PrinterRequest();
        printerRequest.changePressureControlParameterRequest = request;
        await this.webUsbWrapper.send(PrinterRequest.encode(printerRequest).finish());
    }

    async sendChangePressureControlParametersRequestAndWait(request: ChangePressureControlParametersRequest) {
        if (this.pressureControlWaiting) {
            throw new Error("Already waiting for pressure control change parameters request");
        } else {
            await this.sendChangePressureControlParametersRequest(request);
            await new Promise((resolve) => {
                this.pressureControlWaiting = resolve;
            });
        }
    }

    async sendChangeNozzleDataRequest(data: Uint32Array) {
        let printerRequest = new PrinterRequest();
        printerRequest.changeNozzleDataRequest = new ChangeNozzleDataRequest();
        printerRequest.changeNozzleDataRequest.data = Array.from(data);
        this.store.postAction(new NozzleDataChanged(data));
        await this.webUsbWrapper.send(PrinterRequest.encode(printerRequest).finish());
    }

    async sendChangeDropwatcherParametersRequest(request: ChangeDropwatcherParametersRequest) {
        let printerRequest = new PrinterRequest();
        printerRequest.changeDropwatcherParametersRequest = request;
        await this.webUsbWrapper.send(PrinterRequest.encode(printerRequest).finish());
    }

    async sendFireRequest() {
        let printerRequest = new PrinterRequest();
        printerRequest.cameraFrameRequest = new CameraFrameRequest();
        await this.webUsbWrapper.send(PrinterRequest.encode(printerRequest).finish());
    }
}
