

export class WebUSBWrapper extends EventTarget {
    private _device: USBDevice;
    private _interfaceNumber: number;
    private _endpointOut: number;
    private _endpointIn: number;


    constructor() {
        super();

    }

    async autoconnect(vendorId: number, productId: number) {
        let d = await this.hasDevice(vendorId, productId);
        if (d) {
            await this.connectDevice(d);
        }
        navigator.usb.addEventListener("connect", async (ev: USBConnectionEvent) => {
            console.log("usb connect event");
            let d = ev.device;
            if (d.vendorId == vendorId && d.productId == productId) {
                await this.connectDevice(d);
            }
        });
    }

    async hasDevice(vendorId: number, productId: number) {
        let devices = await navigator.usb.getDevices();
        return devices.find(d => d.vendorId == vendorId && d.productId == productId);
    }

    async connectNew(vendorId: number, productId: number) {
        let d = await this.hasDevice(vendorId, productId);
        if (d) {
            console.log("device already connected");
        } else {
            d = await navigator.usb.requestDevice({ filters: [{ vendorId: vendorId, productId: productId }] });
        }
        await this.connectDevice(d);
    }

    async connectDevice(d: USBDevice) {
        await d.open();
        await d.selectConfiguration(1);
        var configurationInterfaces = d.configuration.interfaces;
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
        for (let i = 0; i < 3; i++) {
            try {
                await d.claimInterface(this._interfaceNumber);
                break;
            } catch (e) {
                console.log(e);
                await new Promise(r => setTimeout(r, 1000));
            }
        }
        await d.selectAlternateInterface(this._interfaceNumber, 0);
        // await this._device.controlTransferOut({
        //     'requestType': 'class',
        //     'recipient': 'interface',
        //     'request': 0x22,
        //     'value': 0x01,
        //     'index': this._interfaceNumber
        // });

        this.dispatchEvent(new CustomEvent("connected"));
        this._device = d;
        console.log("usb init done");
        this.receive();
    }


    private async receive() {
        let err = false;

        while (!err) {
            try {
                let result = await this._device.transferIn(this._endpointIn, 64);
                this.dispatchEvent(new CustomEvent("data", { detail: result.data }));
            } catch (e) {
                err = true;
                console.error(e);
                if (this._device !== undefined) {
                    try {

                        await this._device.close();
                    } catch (e) {
                        console.log(e);
                    }
                    this._device = undefined;
                    this.dispatchEvent(new CustomEvent("disconnected"));
                }
            }
        }
    }

    async send(data: BufferSource) {
        await this._device.transferOut(this._endpointOut, data);
    }

    isConnected() {
        return this._device !== undefined && this._device.opened;
    }

    async disconnect() {
        if (this._device !== undefined) {
            await this._device.close();
            this._device = undefined;
            this.dispatchEvent(new CustomEvent("disconnected"));
        }
    }
}

