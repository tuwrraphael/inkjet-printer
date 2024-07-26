import { GCodeRunner } from "./gcode-runner";
import { Store } from "./state/Store";
import { MovementStageConnectionChanged } from "./state/actions/MovementStageConnectionChanged";
import { MovementStagePositionChanged } from "./state/actions/MovementStagePositionChanged";
import { MovementStageTemperatureChanged } from "./state/actions/MovementStageTemperatureChanged";
import { WebSerialWrapper } from "./webserial";


class NewLineDelimitingStream extends TransformStream<string, string> {
    private buffer: string;
    constructor() {
        super({
            transform(chunk, controller) {
                this.buffer += chunk;
                let lines = this.buffer.split("\n");
                this.buffer = lines.pop();
                for (let line of lines) {
                    controller.enqueue(line);
                }
            },
            flush(controller) {
                controller.enqueue(this.buffer);
            }
        });
    }
}

export class MovementStage {
    private static instance: MovementStage;
    private webSerialWrapper: WebSerialWrapper<string>;
    private store: Store;
    private waiting: () => void;
    movementExecutor = new GCodeRunner(this);
    static getInstance() {
        if (null == this.instance) {
            this.instance = new MovementStage();
        }
        return this.instance;
    }

    constructor() {
        this.store = Store.getInstance();
        this.webSerialWrapper = new WebSerialWrapper(readable =>
            readable
                .pipeThrough(new TextDecoderStream())
                .pipeThrough(new NewLineDelimitingStream())
        );
        this.webSerialWrapper.addEventListener("connected", async () => {
            this.store.postAction(new MovementStageConnectionChanged(true));
        });
        this.webSerialWrapper.addEventListener("disconnected", () => {
            this.store.postAction(new MovementStageConnectionChanged(false));
        });
        this.webSerialWrapper.addEventListener("data", async (e: CustomEvent) => {
            // let received: Uint8Array = e.detail;
            // let decoded = new TextDecoder().decode(received);
            if (this.parsePositionMessage(e.detail, (pos) => {
                this.store.postAction(new MovementStagePositionChanged(true, pos));
                if (this.waiting) {
                    this.waiting();
                    this.waiting = undefined;
                }
            })) {
                return;
            } else if (this.parseResetMessage(e.detail)) {
                await this.movementExecutor.enableAutoTemperatureReporting();
            } else if (this.parseTemperatureMessage(e.detail, (temps) => {
                this.store.postAction(new MovementStageTemperatureChanged(temps));
            })) {
                return;
            }
            console.log(e.detail);
        });
    }

    private parsePositionMessage(msg: string, res: (pos: { x: number, y: number, z: number, e: number }) => void): boolean {
        let regex = /^X:([0-9.-]+) Y:([0-9.-]+) Z:([0-9.-]+) E:([0-9.-]+) Count X:([0-9.-]+) Y:([0-9.-]+) Z:([0-9.-]+)$/;
        let match = regex.exec(msg);
        if (match) {
            res({
                x: parseFloat(match[1]),
                y: parseFloat(match[2]),
                z: parseFloat(match[3]),
                e: parseFloat(match[4])
            });
            return true;
        }
        return false;
    }

    private parseTemperatureMessage(msg: string, res: (temps: { current: number, target: number }) => void): boolean {
        let regex = /T:([0-9.]+) \/([0-9.]+) B:([0-9.]+) \/([0-9.]+)/;
        let match = regex.exec(msg);
        if (match) {
            res({
                current: parseFloat(match[3]),
                target: parseFloat(match[4])
            });
            return true;
        }
        return false;
    }

    private parseResetMessage(msg: string) {
        let regex = /^Marlin/;
        let match = regex.exec(msg);
        if (match) {
            return true;
        }
        return false;
    }

    async sendGcode(gcode: string) {
        if (!gcode.endsWith("\n")) {
            gcode += "\n";
        }
        let data = new TextEncoder().encode(gcode);
        await this.webSerialWrapper.send(data);
    }

    async sendGcodeAndWaitForFinished(gcode: string): Promise<void> {
        if (this.waiting) {
            throw new Error("Already waiting");
        }
        if (gcode.indexOf("M114") > 0) {
            throw new Error("M114 is not allowed in sendGcodeAndWaitForFinished");
        }
        if (!gcode.endsWith("\n")) {
            gcode += "\n";
        }
        gcode += "M400\nM114\n";
        let data = new TextEncoder().encode(gcode);
        // console.log(`Sending\n${gcode}`, gcode);  
        await this.webSerialWrapper.send(data);
        await new Promise<void>((resolve) => {
            this.waiting = resolve;
        });
    }

    async start() {
        await this.webSerialWrapper.autoconnect();
    }

    async connectNew() {
        await this.webSerialWrapper.connectNew();
    }
}

if (module.hot) {
    module.hot.accept("./gcode-runner", () => {
        let instance = MovementStage.getInstance();
        instance.movementExecutor = new GCodeRunner(instance);
    });
}