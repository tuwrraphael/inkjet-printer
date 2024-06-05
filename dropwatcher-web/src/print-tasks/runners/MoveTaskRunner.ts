import { th } from "date-fns/locale";
import { MovementStage } from "../../movement-stage";
import { PrinterTaskMove } from "../printer-program";


export class MoveTaskRunner {
    constructor(private task: PrinterTaskMove, private movementStage: MovementStage) {
    }
    async run() {
        await this.movementStage.movementExecutor.moveAbsoluteAndWait(this.task.x, this.task.y, this.task.z, this.task.feedRate);
    }
}


