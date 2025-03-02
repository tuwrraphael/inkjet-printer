import { ModelGroupPrintingParams } from "./ModelGroupPrintingParams";
import { PrintingParams } from "./PrintingParams";

export function getPrintingParams(generalPrintingParams: PrintingParams, modelGroupParams: ModelGroupPrintingParams) {
    return {
        ...generalPrintingParams,
        ...modelGroupParams
    };
}
