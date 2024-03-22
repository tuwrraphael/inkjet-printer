import { Store } from "./state/Store";
import { MovementStageConnectionChanged } from "./state/actions/MovementStageConnectionChanged";
import { WebSerialWrapper } from "./webserial";


class NewLineDelimitingStream extends TransformStream<string, string>{
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
        this.webSerialWrapper.addEventListener("connected", () => {
            this.store.postAction(new MovementStageConnectionChanged(true));
        });
        this.webSerialWrapper.addEventListener("disconnected", () => {
            this.store.postAction(new MovementStageConnectionChanged(false));
        });
        this.webSerialWrapper.addEventListener("data", (e: CustomEvent) => {
            // let received: Uint8Array = e.detail;
            // let decoded = new TextDecoder().decode(received);
            console.log(e.detail);
        });
    }

    async sendGcode(gcode: string) {
        let data = new TextEncoder().encode(gcode);
        await this.webSerialWrapper.send(data);
    }

    async sendHome() {
        await this.sendGcode("M118 P0 start\nM203 Z10\nG91\nG0 Z10\nG28\nG0 F4500 X102\nM400\nM118 P0 done\n");
    }

    async start() {
        await this.webSerialWrapper.autoconnect();
    }

    async connectNew() {
        await this.webSerialWrapper.connectNew();
    }
}