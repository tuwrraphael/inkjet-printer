import { MovementStage } from "../../movement-stage";
import { PrinterTaskMove } from "../printer-program";


export class MoveTaskRunner {
    constructor(private task: PrinterTaskMove, private movementStage: MovementStage) {
    }
    async run() {

        if ("z" in this.task.movement) {
            if ("x" in this.task.movement && "y" in this.task.movement) {
                await this.movementStage.movementExecutor.moveAbsoluteAndWait(this.task.movement.x, this.task.movement.y, this.task.movement.z, this.task.feedRate);
                return;
            }
            await this.movementStage.movementExecutor.moveAbsoluteZAndWait(this.task.movement.z, this.task.feedRate);
            return;
        } else {
            if ("x" in this.task.movement && "y" in this.task.movement) {
                await this.movementStage.movementExecutor.moveAbsoluteXYAndWait(this.task.movement.x, this.task.movement.y, this.task.feedRate);
                return;
            }
        }
        console.error("Invalid move task", this.task);
        throw new Error("Invalid move task");
    }
}


