import { MovementStage } from "../../movement-stage";
import { Store } from "../../state/Store";
import { PrinterTaskPrintTrack } from "../printer-program";



export class PrintTrackTaskRunner {
    constructor(private task: PrinterTaskPrintTrack,
        private movementStage: MovementStage,
        private store: Store) {
    }
    async run() {
        await this.movementStage.movementExecutor.moveAbsoluteXYAndWait(this.store.state.printState.slicingState.moveAxisPos, this.task.moveLimit, 3000);
    }
}
