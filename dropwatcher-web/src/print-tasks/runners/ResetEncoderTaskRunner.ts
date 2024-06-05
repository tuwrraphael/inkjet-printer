import { PrinterUSB } from "../../printer-usb";
import { ChangeEncoderModeSettingsRequest, PrintControlEncoderModeSettings } from "../../proto/compiled";
import { PrinterTaskResetEncoder } from "../printer-program";


export class ResetEncoderTaskRunner {
    constructor(private task: PrinterTaskResetEncoder, private printerUSB: PrinterUSB) {
    }
    async run() {
        let changeEncoderModeSettingsRequest = new ChangeEncoderModeSettingsRequest();
        let encoderModeSettings = new PrintControlEncoderModeSettings();
        encoderModeSettings.fireEveryTicks = this.task.fireEveryTicks;
        encoderModeSettings.printFirstLineAfterEncoderTick = this.task.printFirstLineAfterEncoderTick;
        encoderModeSettings.sequentialFires = this.task.sequentialFires;
        changeEncoderModeSettingsRequest.encoderModeSettings = encoderModeSettings;
        await this.printerUSB.sendChangeEncoderModeSettingsRequest(changeEncoderModeSettingsRequest);
    }
}
