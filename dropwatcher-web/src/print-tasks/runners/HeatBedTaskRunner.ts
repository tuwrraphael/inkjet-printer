import { GCodeRunner } from "../../gcode-runner";
import { MovementStage } from "../../movement-stage";
import { PrinterTaskHeadBed as PrinterTaskHeatBed } from "../printer-program";


export class HeatBedTaskRunner {
    constructor(private task: PrinterTaskHeatBed, private movementExecutor: GCodeRunner) {
    }
    async run() {

        await this.movementExecutor.heatBedAndWait(this.task.temperature);
    }
}
