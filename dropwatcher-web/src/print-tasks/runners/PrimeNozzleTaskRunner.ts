import { PrinterUSB } from "../../printer-usb";
import { PressureControlAlgorithm, ChangePressureControlParametersRequest, PressureControlDirection, PressureControlParameters } from "../../proto/compiled";
import { PrinterTaskPrimeNozzle } from "../printer-program";


export class PrimeNozzleTaskRunner {
    constructor(private task: PrinterTaskPrimeNozzle, private printerUSB: PrinterUSB) {
    }
    async run() {
        let changeParametersRequest = new ChangePressureControlParametersRequest();
        let parameters = new PressureControlParameters();
        changeParametersRequest.parameters = parameters;
        parameters.algorithm = PressureControlAlgorithm.PressureControlAlgorithm_FEED_WITH_LIMIT;
        parameters.direction = PressureControlDirection.PressureControlDirection_PRESSURE;
        parameters.feedPwm = this.task.feedLimitPwm;
        parameters.limitPressure = this.task.feedLimitPressure;
        parameters.feedTime = this.task.feedTime;
        parameters.enable = true;
        await this.printerUSB.sendChangePressureControlParametersRequestAndWait(changeParametersRequest);
    }
}
