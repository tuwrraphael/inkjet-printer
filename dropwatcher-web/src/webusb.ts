
export class WebUSBWrapper extends EventTarget {
    private _device: USBDevice;
    private _interfaceNumber: number;
    private _endpointOut: number;
    private _endpointIn: number;

    constructor() {
        super();
    }

    async connect() {
        let devices = await navigator.usb.getDevices();
        if (devices.length > 0) {
            this._device = devices[0];
        } else {
            this._device = await navigator.usb.requestDevice({ filters: [{ vendorId: 0x2341, productId: 0x8037 }] });
        }
        await this._device.open();
        await this._device.selectConfiguration(1);
        var configurationInterfaces = this._device.configuration.interfaces;
        configurationInterfaces.forEach(element => {
            element.alternates.forEach(elementalt => {
                if (elementalt.interfaceClass == 0xff) {
                    this._interfaceNumber = element.interfaceNumber;
                    elementalt.endpoints.forEach(elementendpoint => {
                        if (elementendpoint.direction == "out") {
                            this._endpointOut = elementendpoint.endpointNumber;
                        }
                        if (elementendpoint.direction == "in") {
                            this._endpointIn = elementendpoint.endpointNumber;
                        }
                    })
                }
            })
        })
        await this._device.claimInterface(this._interfaceNumber);
        await this._device.selectAlternateInterface(this._interfaceNumber, 0);
        await this._device.controlTransferOut({
            'requestType': 'class',
            'recipient': 'interface',
            'request': 0x22,
            'value': 0x01,
            'index': this._interfaceNumber
        });
        console.log("usb init done");
        this.receive();
    }


    private async receive(){
        let err = false;
        
        while (!err) {
            try {
                let result = await this._device.transferIn(this._endpointIn, 64);
                this.dispatchEvent(new CustomEvent("data", { detail: result.data }));
            } catch (e) {
                err = true;
                console.log(e);
            }
        }
    }

    async send(data: BufferSource) {
        await this._device.transferOut(this._endpointOut, data);
    }

    disconnect() {
        this._device.controlTransferOut({
            'requestType': 'class',
            'recipient': 'interface',
            'request': 0x22,
            'value': 0x00,
            'index': this._interfaceNumber
        });
        return this._device.close();
    }
}