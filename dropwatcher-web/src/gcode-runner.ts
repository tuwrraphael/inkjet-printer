import { MovementStage } from "./movement-stage";

export class GCodeRunner {
    constructor(private movementStage: MovementStage) {
    }

    async home() {
        await this.movementStage.sendGcodeAndWaitForFinished("G0 Z10\nG28");
    }

    async moveRelativeAndWait(x: number, y: number, z: number, feedrate: number) {
        await this.movementStage.sendGcodeAndWaitForFinished(`G91\nG0 X${x} Y${y} Z${z} F${feedrate}\nG90`);
    }
    
    async moveAbsoluteAndWait(x: number, y: number, z: number, feedrate: number) {
        await this.movementStage.sendGcodeAndWaitForFinished(`G90\nG0 X${x} Y${y} Z${z} F${feedrate}`);
    }

    async moveAbsoluteXAndWait(x: number, feedrate: number) {
        await this.movementStage.sendGcodeAndWaitForFinished(`G90\nG0 X${x} F${feedrate}`);
    }

    async moveAbsoluteXYAndWait(x: number, y: number, feedrate: number) {
        await this.movementStage.sendGcodeAndWaitForFinished(`G90\nG0 X${x} Y${y} F${feedrate}`);
    }

    async disableAxes() {
        await this.movementStage.sendGcode("M18");
    }
}
