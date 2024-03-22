
export class WebSerialWrapper<T> extends EventTarget {
    private port: SerialPort;
    private reader: ReadableStreamDefaultReader;
    private writer: WritableStreamDefaultWriter;

    constructor(private readonly readPipeline: (from: ReadableStream<Uint8Array>) => ReadableStream<T>) {
        super();
    }

    async connectPort(port: SerialPort) {
        await port.open({ baudRate: 250000 });
        this.reader = this.readPipeline(port.readable).getReader();
        this.writer = port.writable.getWriter();
        this.dispatchEvent(new Event("connected"));
        this.port = port;
        this.receive();
        console.log("Connected to serial port");
    }

    async disconnect() {
        await this.reader.cancel();
        await this.writer.close();
        await this.port.close();
    }

    async send(data: Uint8Array) {
        await this.writer.write(data);
    }

    async receive() {
        while (true) {
            try {
                const { value, done } = await this.reader.read();
                if (value) {
                    this.dispatchEvent(new CustomEvent("data", { detail: value }));
                }
                if (done) {
                    if (this.port !== undefined) {
                        try {
                            await this.port.close();
                        } catch (e) {
                            console.log(e);
                        }
                        this.port = undefined;
                        this.dispatchEvent(new Event("disconnected"));
                    }
                    break;
                }
            }
            catch (e) {
                console.error(e);
                try {
                    await this.port.close();
                } catch (e) {
                    console.log(e);
                }
                this.port = undefined;
                this.dispatchEvent(new Event("disconnected"));
                break;
            }
        }
    }

    async findPort() {
        const ports = await navigator.serial.getPorts();
        if (ports.length == 1) {
            return ports[0];
        } else if (ports.length > 1) {
            console.error("Multiple ports found");
            return null;
        } else {
            console.error("No ports found");
            return null;
        }
    }

    async autoconnect() {
        let port = await this.findPort();
        console.log("Autoconnecting", port);
        if (port) {

            await this.connectPort(port);
        }
        navigator.serial.addEventListener("connect", async (e) => {
            console.log("Serial port connected");
            port = await this.findPort();
            if (port) {
                await this.connectPort(port);
            }
        });
    }

    async connectNew() {
        let port = await this.findPort();
        if (port) {
            console.log("Port already connected");
        } else {
            port = await navigator.serial.requestPort();
        }
        await this.connectPort(port);
    }
}