import { MovementStage } from "../../movement-stage";
import { SlicingStatus, State } from "../../state/State";
import { Store } from "../../state/Store";
import { SlicePositionChanged } from "../../state/actions/SlicePositionChanged";
import { ViewLayerChanged } from "../../state/actions/ViewLayerChanged";
import { PrinterTaskIncrementLayer } from "../printer-program";


export class IncrementLayerTaskRunner {
    constructor(private task: PrinterTaskIncrementLayer,
        private movementStage: MovementStage,
        private store: Store) {
    }
    async run() {
        let nextViewLayer = this.task.zero ? 0 : this.store.state.printState.viewLayer + 1;
        await new Promise(resolve => {
            let slicingStarted = false;
            let abortController = new AbortController();
            this.store.subscribe((s: State) => {
                if (s.printState.slicingState.moveAxisPos != 0 && s.printState.viewLayer != nextViewLayer) {
                    return;
                }
                if (s.printState.slicingState.slicingStatus == SlicingStatus.InProgress) {
                    slicingStarted = true;
                } else if (slicingStarted && s.printState.slicingState.slicingStatus == SlicingStatus.Done) {
                    resolve(true);
                    abortController.abort();
                }
            }, abortController.signal);
            this.store.postAction(new SlicePositionChanged(0));
            this.store.postAction(new ViewLayerChanged(nextViewLayer));
        });
        await this.movementStage.movementExecutor.moveAbsoluteXYAndWait(0, 0, 10000);
    }
}
