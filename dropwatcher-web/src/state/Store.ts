import { PrinterSystemState } from "./State";
import { Action } from "./actions/Action";
import { InitializeWorker } from "./actions/InitializeWorker";
import { State } from "./State";

interface Subscription<State> {
    call(a: State, changes: (keyof State)[]): void;
}

console.log(`Using worker, ${new URL("./worker", import.meta.url)}`);
function createWorkerFn() {
    return new Worker(new URL("./worker", import.meta.url));
}

export class Store {
    private static instance: Store = null;
    private worker: Worker;
    private subscriptions: Subscription<State>[];
    private _state: State = null;
    // private queue: Action[] = [];
    // private initialized = false;
    private onMessageFn = (ev: MessageEvent<any>) => this.onMessage(ev);

    get state() {
        return this._state;
    }

    static getInstance() {
        if (null == this.instance) {
            this.instance = new Store();
        }
        return this.instance;
    }

    constructor() {
        this.subscriptions = [];
        this.createWorker();
    }

    createWorker() {
        if (this.worker) {
            console.log("Terminating worker");
            this.worker.removeEventListener("message", this.onMessageFn);
            this.worker.terminate();
        }
        console.log("Creating worker");
        this.worker = createWorkerFn();
        this.worker.addEventListener("message", this.onMessageFn);
        this.postAction(new InitializeWorker(this.state || {
            printerSystemState: {
                usbConnected: false,
                state: PrinterSystemState.Unspecified,
                errors: {
                    flags: 0
                }, pressureControl: null
            },
            movementStageState: {
                connected: false,
                x: undefined,
                y: undefined,
                z: undefined,
                e: undefined
            },
            currentProgram: null,
            programRunnerState: {
                state: null,
                currentTaskIndex: null
            }
        }));
    }

    private onMessage(ev: MessageEvent<any>) {
        let [update, changes] = ev.data;
        this._state = { ...this._state, ...update };
        for (let s of this.subscriptions) {
            try {
                s.call(this._state, changes);
            }
            catch (err) {
                console.error(`Error while updating`, err);
            }

        }
    }

    subscribe(call: (a: State, changed: (keyof State)[]) => void, signal?: AbortSignal) {
        let sub: Subscription<State> = { call };
        this.subscriptions.push(sub);
        if (signal) {
            signal.addEventListener("abort", () => {
                this.subscriptions.splice(this.subscriptions.indexOf(sub), 1);
            });
        }
    }

    postAction(action: Action) {
        this.worker.postMessage(action);
    }
}
if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => {
        console.log("HMR dispose");
        (<any>window).storeInstance = Store.getInstance();
    });
    if ((<any>window).storeInstance) {
        let store: Store = ((<any>window).storeInstance);
        store.createWorker();
    }
}