import { MovementStage } from "./movement-stage";

export class GCodeRunner {
    constructor(private movementStage: MovementStage) {
    }

    async home() {
        await this.movementStage.sendGcodeAndWaitForFinished("G0 Z10\nG28");
    }
}
