import { MovementStage } from "./movement-stage";

export class GCodeRunner implements Disposable {
    constructor(private movementStage: MovementStage, private user: { name: string }) {
    }
    [Symbol.dispose](): void;
    [Symbol.dispose](): void;
    [Symbol.dispose](): void {
        this.movementStage.executorReleased(this.user);
    }

    async home() {
        await this.movementStage._sendGcode("G0 Z10\nG28");
    }

    async moveRelativeAndWait(x: number, y: number, z: number, feedrate: number) {
        await this.movementStage._sendGcodeAndWaitForMovementFinished(`G91\nG0 X${x} Y${y} Z${z} F${feedrate}\nG90`);
    }

    async moveAbsoluteAndWait(x: number, y: number, z: number, feedrate: number) {
        await this.movementStage._sendGcodeAndWaitForMovementFinished(`G90\nG0 X${x} Y${y} Z${z} F${feedrate}`);
    }

    async moveAbsoluteXAndWait(x: number, feedrate: number) {
        await this.movementStage._sendGcodeAndWaitForMovementFinished(`G90\nG0 X${x} F${feedrate}`);
    }

    async moveAbsoluteYAndWait(y: number, feedrate: number) {
        await this.movementStage._sendGcodeAndWaitForMovementFinished(`G90\nG0 Y${y} F${feedrate}`);
    }

    async moveAbsoluteZAndWait(z: number, feedrate: number) {
        await this.movementStage._sendGcodeAndWaitForMovementFinished(`G90\nG0 Z${z} F${feedrate}`);
    }

    async moveAbsoluteXYAndWait(x: number, y: number, feedrate: number) {
        await this.movementStage._sendGcodeAndWaitForMovementFinished(`G90\nG0 X${x} Y${y} F${feedrate}`);
    }

    async heatBedAndWait(temperature: number) {
        await this.movementStage._sendGcode(`M190 S${temperature}`);
    }

    async disableAxes() {
        await this.movementStage._sendGcode("M18");
    }

    async sendRaw(gcode: string) {
        await this.movementStage._sendGcode(gcode);
    }


}
