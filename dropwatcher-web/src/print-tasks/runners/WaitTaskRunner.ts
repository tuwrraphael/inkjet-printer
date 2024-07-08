import { PrinterTaskWait } from "../printer-program";


export class WaitTaskRunner {
    constructor(private task: PrinterTaskWait) {
    }
    async run() {
        await new Promise((resolve) => {
            setTimeout(resolve, this.task.durationMs);
        });
    }
}
