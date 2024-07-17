import { PrinterUSB } from "../../printer-usb";
import { PressureControlAlgorithm, ChangePressureControlParametersRequest, PressureControlParameters } from "../../proto/compiled";
import { PrinterTaskSetTargetPressure } from "../printer-program";


export class SetTargetPressureTaskRunner {
    constructor(private task: PrinterTaskSetTargetPressure, private printerUSB: PrinterUSB) {
    }
    async run() {
        throw new Error("Method not implemented.");
        // let changeParametersRequest = new ChangePressureControlParametersRequest();
        // let parameters = new PressureControlParameters();
        // changeParametersRequest.parameters = parameters;
        // parameters.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_TARGET_PRESSURE;
        // parameters.targetPressure = this.task.targetPressure;
        // parameters.enable = true;
        // await this.printerUSB.sendChangePressureControlParametersRequestAndWait(changeParametersRequest);
    }
}
