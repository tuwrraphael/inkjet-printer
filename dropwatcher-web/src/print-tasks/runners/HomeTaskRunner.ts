import { GCodeRunner } from "../../gcode-runner";
import { MovementStage } from "../../movement-stage";
import { PrinterTaskHome } from "../printer-program";

export class HomeTaskRunner {
    constructor(private task: PrinterTaskHome,private movementExecutor: GCodeRunner) {
    }
    async run() {
        await this.movementExecutor.home();
    }
}

