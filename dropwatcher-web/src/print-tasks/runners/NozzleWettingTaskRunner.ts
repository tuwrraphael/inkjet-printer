import { GCodeRunner } from "../../gcode-runner";
import { PrinterUSB } from "../../printer-usb";
import { ChangePressureControlParametersRequest, PressureControlParameters, PressureControlPumpParameters, PressureControlAlgorithm } from "../../proto/compiled";
import { PrinterTaskNozzleWetting } from "../printer-program";
import { PrinterTaskCancellationToken } from "../PrinterTaskCancellationToken";


export class NozzleWettingTaskRunner {
    constructor(private task: PrinterTaskNozzleWetting, private printerUSB: PrinterUSB,
        private movementExecutor: GCodeRunner
    ) {
    }
    async run(cancellationToken: PrinterTaskCancellationToken) {
        const y = 5;
        const z = 1.1;
        await this.movementExecutor.moveAbsoluteAndWait(160, y, 15, 4000);
        await this.movementExecutor.moveAbsoluteAndWait(160, y, z, 4000);
        let changeParametersRequest = new ChangePressureControlParametersRequest();
        let parameters = new PressureControlParameters();
        changeParametersRequest.parameters = parameters;
        let inkPump = new PressureControlPumpParameters();
        inkPump.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_TARGET_PRESSURE;
        inkPump.targetPressure = this.task.pressureWetting;
        parameters.inkPump = inkPump;
        parameters.enable = false;

        await this.printerUSB.sendChangePressureControlParametersRequest(changeParametersRequest);
        changeParametersRequest = new ChangePressureControlParametersRequest();
        parameters = new PressureControlParameters();
        let cappingPump = new PressureControlPumpParameters();
        cappingPump.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_NONE;
        parameters.cappingPump = cappingPump;
        changeParametersRequest.parameters = parameters;
        parameters.enable = true;
        await this.printerUSB.sendChangePressureControlParametersRequestAndWait(changeParametersRequest);
        await new Promise(resolve => setTimeout(resolve, this.task.wettingWaitTime));
        cancellationToken.throwIfCanceled();

        changeParametersRequest = new ChangePressureControlParametersRequest();
        parameters = new PressureControlParameters();
        parameters.enable = true;
        changeParametersRequest.parameters = parameters;
        inkPump = new PressureControlPumpParameters();
        inkPump.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_TARGET_PRESSURE;
        inkPump.targetPressure = this.task.pressurePrinting;
        parameters.inkPump = inkPump;
        await this.printerUSB.sendChangePressureControlParametersRequest(changeParametersRequest);
        await this.movementExecutor.moveAbsoluteAndWait(160, y, z, 4000);
        await this.movementExecutor.moveAbsoluteXAndWait(200, 500);
        await this.movementExecutor.moveAbsoluteZAndWait(5, 4000);
        await this.movementExecutor.moveAbsoluteAndWait(200, y, 15, 4000);
    }
}
