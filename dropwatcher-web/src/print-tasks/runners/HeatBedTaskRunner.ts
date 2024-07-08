import { MovementStage } from "../../movement-stage";
import { PrinterTaskHeadBed as PrinterTaskHeatBed } from "../printer-program";


export class HeatBedTaskRunner {
    constructor(private task: PrinterTaskHeatBed, private movementStage: MovementStage) {
    }
    async run() {

        await this.movementStage.movementExecutor.heatBed(this.task.temperature);
    }
}
