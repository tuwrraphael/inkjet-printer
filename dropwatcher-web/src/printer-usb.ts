import { ChangeEncoderModeRequest, ChangeWaveformControlSettingsRequest, NozzlePrimingRequest, PrintControlState, PrinterSystemState } from "./proto/compiled";
import {
    CameraFrameRequest,
    ChangeDropwatcherParametersRequest,
    ChangePressureControlParametersRequest,
    GetPrinterSystemStateRequest,
    PrinterRequest,
    PrinterSystemStateResponse,
    ChangeNozzleDataRequest,
    ChangePrinterSystemStateRequest,
    ChangeEncoderModeSettingsRequest,
    ChangeEncoderPositionRequest,
    ChangePrintMemoryRequest
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
    private nozzlePrimingWaiting: () => void;
    private systemStateWaiting: { for: PrinterSystemState, resolve: () => void };
    private voltageWaiting: { for: number, resolve: () => void };
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
            if (this.pressureControlWaiting && response.pressureControl && response.pressureControl.done) {
                this.pressureControlWaiting(response.pressureControl);
                this.pressureControlWaiting = undefined;
            }
            if (this.systemStateWaiting && response.state == this.systemStateWaiting.for) {
                this.systemStateWaiting.resolve();
                this.systemStateWaiting = undefined;
            }
            if (this.voltageWaiting && response.waveformControl != null && response.waveformControl.setVoltageMv == this.voltageWaiting.for) {
                this.voltageWaiting.resolve();
                this.voltageWaiting = undefined;
            }

            if (this.nozzlePrimingWaiting && response.printControl != null) {
                let printCotnrolMsg: PrintControlState = response.printControl;
                if (printCotnrolMsg.nozzlePrimingActive == false) {
                    this.nozzlePrimingWaiting();
                    this.nozzlePrimingWaiting = undefined;
                }
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

    async sendChangeSystemStateRequest(request: ChangePrinterSystemStateRequest) {
        let printerRequest = new PrinterRequest();
        printerRequest.changePrinterSystemStateRequest = request;
        await this.webUsbWrapper.send(PrinterRequest.encode(printerRequest).finish());
    }

    async sendChangeSystemStateRequestAndWait(request: ChangePrinterSystemStateRequest) {
        if (this.systemStateWaiting) {
            throw new Error("Already waiting for system state change request");
        }
        let printerRequest = new PrinterRequest();
        printerRequest.changePrinterSystemStateRequest = request;
        await this.webUsbWrapper.send(PrinterRequest.encode(printerRequest).finish());
        await new Promise<void>((resolve, reject) => {
            let token = setTimeout(() => {
                reject("Timeout waiting for system state change request");
                this.systemStateWaiting = undefined;
            }, 5000);
            this.systemStateWaiting = {
                for: request.state,
                resolve: () => {
                    clearTimeout(token);
                    resolve();
                }
            };
        });
    }

    async sendChangeEncoderModeSettingsRequest(request: ChangeEncoderModeSettingsRequest) {
        let printerRequest = new PrinterRequest();
        printerRequest.changeEncoderModeSettingsRequest = request;
        await this.webUsbWrapper.send(PrinterRequest.encode(printerRequest).finish());
    }

    async sendChangeEncoderPositionRequest(request: ChangeEncoderPositionRequest) {
        let printerRequest = new PrinterRequest();
        printerRequest.changeEncoderPositionRequest = request;
        await this.webUsbWrapper.send(PrinterRequest.encode(printerRequest).finish());
    }

    async sendChangePrintMemoryRequest(request: ChangePrintMemoryRequest) {
        let printerRequest = new PrinterRequest();
        printerRequest.changePrintMemoryRequest = request;
        let encoded = PrinterRequest.encode(printerRequest).finish();
        await this.webUsbWrapper.send(encoded);
    }

    async sendNozzlePrimingRequestAndWait() {
        if (this.nozzlePrimingWaiting) {
            throw new Error("Already waiting for nozzle priming request");
        }
        let printerRequest = new PrinterRequest();
        printerRequest.nozzlePrimingRequest = new NozzlePrimingRequest();
        await this.webUsbWrapper.send(PrinterRequest.encode(printerRequest).finish());
        await new Promise<void>((resolve, reject) => {
            let token = setTimeout(() => {
                if (this.nozzlePrimingWaiting) {
                    reject("Timeout waiting for nozzle priming request");
                    this.nozzlePrimingWaiting = undefined;
                }
            }, 10000);
            this.nozzlePrimingWaiting = () => {
                clearTimeout(token);
                resolve();
            };
        });
    }

    async sendChangeEncoderModeRequest(request: ChangeEncoderModeRequest) {
        let printerRequest = new PrinterRequest();
        printerRequest.changeEncoderModeRequest = request;
        await this.webUsbWrapper.send(PrinterRequest.encode(printerRequest).finish());
    }

    async sendChangeWaveformControlSettingsRequestAndWait(request: ChangeWaveformControlSettingsRequest) {
        if (this.voltageWaiting) {
            throw new Error("Already waiting for voltage change request");
        }
        let printerRequest = new PrinterRequest();
        printerRequest.changeWaveformControlSettingsRequest = request;
        await this.webUsbWrapper.send(PrinterRequest.encode(printerRequest).finish());
        await new Promise<void>((resolve, reject) => {

            let token = setTimeout(() => {

                if (this.voltageWaiting) {
                    reject("Timeout waiting for voltage change request");
                    this.voltageWaiting = undefined;
                }
            }, 5000);
            this.voltageWaiting = {
                for: request.settings.voltageMv,
                resolve: () => {
                    clearTimeout(token);
                    resolve();
                }
            };
        });
    }

}
