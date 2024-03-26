import { MovementStage } from "../../movement-stage";
import { PrinterTaskHome } from "../printer-program";

export class HomeTaskRunner {
    constructor(private task: PrinterTaskHome, private movementStage: MovementStage) {
    }
    async run() {
        await this.movementStage.movementExecutor.home();
    }
}

