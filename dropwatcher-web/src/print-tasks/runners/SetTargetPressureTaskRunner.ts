import { PrinterUSB } from "../../printer-usb";
import { PressureControlPumpParameters } from "../../proto/compiled";
import { PressureControlAlgorithm, ChangePressureControlParametersRequest, PressureControlParameters } from "../../proto/compiled";
import { PrinterTaskSetTargetPressure } from "../printer-program";


export class SetTargetPressureTaskRunner {
    constructor(private task: PrinterTaskSetTargetPressure, private printerUSB: PrinterUSB) {
    }
    async run() {
        let changeParametersRequest = new ChangePressureControlParametersRequest();
        let parameters = new PressureControlParameters();
        changeParametersRequest.parameters = parameters;
        let inkPumpParameters = new PressureControlPumpParameters();
        inkPumpParameters.targetPressure = this.task.targetPressure;
        inkPumpParameters.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_TARGET_PRESSURE;
        let cappingPumpParameters = new PressureControlPumpParameters();
        cappingPumpParameters.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_NONE;
        parameters.cappingPump = cappingPumpParameters;
        parameters.enable = false;
        await this.printerUSB.sendChangePressureControlParametersRequest(changeParametersRequest);
        parameters = new PressureControlParameters();
        changeParametersRequest.parameters = parameters;
        parameters.inkPump = inkPumpParameters;        
        parameters.enable = true;
        await this.printerUSB.sendChangePressureControlParametersRequestAndWait(changeParametersRequest);
        parameters = new PressureControlParameters();
        changeParametersRequest.parameters = parameters;
        parameters.enable = false;
        await this.printerUSB.sendChangePressureControlParametersRequest(changeParametersRequest);
    }
}
