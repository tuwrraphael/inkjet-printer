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


function createRefreshableTimeout(seconds: number, createError: () => Error) {
    let cancel: () => void;
    let promise = new Promise<void>((resolve, reject) => {
        cancel = () => {
            reject(createError());
        }
    });
    let timeoutId = setTimeout(() => {
        cancel();
    }, seconds * 1000);
    return {
        promise,
        cancel() {
            clearTimeout(timeoutId);
        },
        refresh() {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                cancel();
            }, seconds * 1000);
        }
    };
}


interface GCodeQueueItem {
    gcode: string;
    waitForTest?: (data: string) => boolean;
    resolve: () => void;
    reject: (err: Error) => void;
    timeout?: number;
}

class GCodeQueue {
    private queue: GCodeQueueItem[] = [];

    private processing = false;

    private waitFor: (data: string) => void;
    timeout: { promise: Promise<void>; cancel(): void; refresh(): void; };

    constructor(
        private send: (data: string) => Promise<void>,
    ) {
    }

    async enqueue(gcode: string, waitForTest?: (data: string) => boolean, timeout = 5) {
        let lines = gcode.split("\n").filter(l => l.trim().length > 0);
        if (lines.length === 0) {
            throw new Error("No gcode to send");
        }
        for (let line of lines.slice(0, -1)) {
            await this.enqueueSingle(line);
        }
        await this.enqueueSingle(lines[lines.length - 1], waitForTest, timeout);
    }

    private enqueueSingle(gcode: string, waitForTest?: (data: string) => boolean, timeout = 5) {
        if (!gcode.endsWith("\n")) {
            gcode += "\n";
        }
        let promise = new Promise<void>((resolve, reject) => {
            this.queue.push({
                gcode,
                waitForTest,
                resolve,
                reject,
                timeout
            });
        });
        this.triggerQueue();
        return promise;
    }

    private triggerQueue() {
        if (this.processing) {
            return;
        }
        this.processing = true;
        this.processQueue().finally(() => {
            this.processing = false;
        });
    }

    private async processQueue() {
        let ctd = true;
        while (ctd) {

            let item = this.queue.shift();
            if (!item) {
                console.log("Queue finished");
                break;
            }
            console.log("Processing queue item", item);
            ctd = await this.processItem(item);
        }
    }

    private async processItem(item: GCodeQueueItem) {
        try {
        await this.send(item.gcode);
        }
        catch (e) {
            item.reject(e);
            return false;
        }
        this.timeout = createRefreshableTimeout(item.timeout || 5, () => new Error(`Timeout after sending ${item.gcode}`));
        let waitForPromise = new Promise<void>((resolve, reject) => {
            this.waitFor = (data) => {
                if (item.waitForTest) {
                    if (item.waitForTest(data)) {
                        resolve();
                    }
                } else if (data.startsWith("ok")) {
                    resolve();
                }
            };
        });
        try {
            await Promise.race([
                this.timeout.promise,
                waitForPromise
            ]).finally(() => {
                this.timeout.cancel();
                this.waitFor = undefined;
                this.timeout = undefined;
            });
        } catch (e) {
            item.reject(e);
            return false;
        }
        item.resolve();
        return true;
    }

    async incomingData(data: string) {
        if (this.waitFor) {
            this.waitFor(data);
        }
        if (this.timeout && data.startsWith("echo:busy:")) {
            this.timeout.refresh();
        }
    }
}

export class MovementStage {

    private static instance: MovementStage;
    private webSerialWrapper: WebSerialWrapper<string>;
    private store: Store;
    private textEncoder = new TextEncoder();
    private gcodeQueue = new GCodeQueue((data) => this.webSerialWrapper.send(this.textEncoder.encode(data)));
    currentUser: { name: string } = null;

    static getInstance(): MovementStage {
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
            this.gcodeQueue.incomingData(e.detail);
            if (this.parsePositionMessage(e.detail, (pos) => {
                this.store.postAction(new MovementStagePositionChanged(true, pos));
            })) {
            } else if (this.parseResetMessage(e.detail)) {
                await this.enableAutoTemperatureReporting();
            } else if (this.parseTemperatureMessage(e.detail, (temps) => {
                this.store.postAction(new MovementStageTemperatureChanged(temps));
            })) {
            }
            console.log(e.detail);
        });
    }

    private async enableAutoTemperatureReporting() {
        await this._sendGcode("M155 S3");
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

    async _sendGcode(gcode: string) {
        await this.gcodeQueue.enqueue(gcode);
    }

    async _sendGcodeAndWaitForMovementFinished(gcode: string): Promise<void> {
        if (gcode.indexOf("M114") > 0) {
            throw new Error("M114 is not allowed in sendGcodeAndWaitForMovementFinished");
        }
        if (!gcode.endsWith("\n")) {
            gcode += "\n";
        }
        gcode += "M400\nM114\n";
        await this.gcodeQueue.enqueue(gcode, (data) => {
            return this.parsePositionMessage(data, (pos) => { });
        }, 15);
    }

    async start() {
        await this.webSerialWrapper.autoconnect();
    }

    async connectNew() {
        await this.webSerialWrapper.connectNew();
    }

    executorReleased(user: { name: string; }) {
        if (user != this.currentUser) {
            throw new Error(`MovementStage is not in use by ${user}`);
        }
        this.currentUser = null;
    }

    getMovementExecutor(user: string): GCodeRunner {
        if (this.currentUser != null) {
            throw new Error(`MovementStage is already in use by ${this.currentUser.name}`);
        }
        this.currentUser = { name: user };
        return new GCodeRunner(this, this.currentUser);
    }
}

if (module.hot) {
    module.hot.accept("./gcode-runner", () => {

    });
}