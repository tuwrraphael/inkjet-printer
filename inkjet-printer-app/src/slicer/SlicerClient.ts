import * as Comlink from "comlink";
import { Slicer } from "./SlicerWorker";
import { Store } from "../state/Store";
import { SetSlicerWorker } from "../state/actions/SetSlicerWorker";

export class SlicerClient {
    private static instance: SlicerClient;
    private worker: Worker;
    readonly slicer: Comlink.Remote<Slicer>;
    private store: Store;

    constructor() {
        this.worker = new Worker(new URL("./SlicerWorker", import.meta.url));
        this.slicer = Comlink.wrap<Slicer>(this.worker);
        this.store = Store.getInstance();
    }

    async sendToStore() {
        let endpoint = await this.slicer[Comlink.createEndpoint]();
        this.store.postAction(new SetSlicerWorker(endpoint), [endpoint]);
    }

    static getInstance() {
        if (null == this.instance) {
            this.instance = new SlicerClient();
        }
        return this.instance;
    }
};