import { Action } from "./actions/Action";
import { State } from "./State";

interface Subscription<State> {
    call(a: State, changes: (keyof State)[]): void;
}

export class Store {
    private static instance: Store = null;
    private worker: Worker;
    private subscriptions: Subscription<State>[];
    private _state: State = null;

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
        this.worker = new Worker(new URL("./worker", import.meta.url));
        this.worker.addEventListener("message", ev => {
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
        });
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