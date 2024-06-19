import { MovementStage } from "../../movement-stage";
import { SlicingStatus, State } from "../../state/State";
import { Store } from "../../state/Store";
import { SlicePositionIncrement } from "../../state/actions/SlicePositionIncrement";
import { PrinterTaskMoveAndSliceNext } from "../printer-program";


export class MoveAndSliceNextTaskRunner {
    constructor(private task: PrinterTaskMoveAndSliceNext,
        private movementStage: MovementStage,
        private store: Store) {
    }
    async run() {
        let movedPromise: Promise<void> = null;
        await new Promise(resolve => {
            let slicingStarted = false;
            let abortController = new AbortController();
            this.store.subscribe((s: State) => {
                if (s.printState.slicingState.slicingStatus == SlicingStatus.InProgress) {
                    slicingStarted = true;
                    if (!movedPromise) {
                        movedPromise = this.movementStage.movementExecutor.moveAbsoluteXYAndWait(this.store.state.printState.slicingState.moveAxisPos, 0, 10000);
                    }
                } else if (slicingStarted && s.printState.slicingState.slicingStatus == SlicingStatus.Done) {
                    resolve(true);
                    abortController.abort();
                }
            }, abortController.signal);
            this.store.postAction(new SlicePositionIncrement(1));
        });
        await movedPromise;
    }
}



