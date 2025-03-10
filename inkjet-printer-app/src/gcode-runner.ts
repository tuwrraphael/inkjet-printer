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
        await this.movementStage._sendGcode("G91\nG0 Z10\nG90\nG28");
    }

    async moveRelativeAndWait(x: number, y: number, z: number, feedrate: number) {
        await this.movementStage._sendGcodeAndWaitForMovementFinished(`G91\nG0 X${x} Y${y} Z${z} F${feedrate}\nG90`);
    }

    async setPosition(x: number, y: number) {
        await this.movementStage._sendGcode(`G92 X${x} Y${y}\nM400\nM114`);
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

    async setBedTemperature(temperature: number) {
        await this.movementStage._sendGcode(`M140 S${temperature}`);
    }

    async setDryingTemperature(temperature: number) {
        await this.movementStage._sendGcode(`M104 S${temperature}`);
    }

    async setDryingTemperatureAndWait(temperature: number) {
        await this.movementStage._sendGcode(`M109 S${temperature}`);
    }

    async disableAxes() {
        await this.movementStage._sendGcode("M18");
    }

    async sendRaw(gcode: string) {
        await this.movementStage._sendGcode(gcode);
    }

    async setFanSpeed(speed: number) {
        await this.movementStage._sendGcode(`M106 S${speed}`);
    }

}
