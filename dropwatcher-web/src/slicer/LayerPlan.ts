import { PrintingParams } from "./PrintingParams";
import { TrackPlan } from "./TrackPlan";

export interface PrintPlan {
    layers: LayerPlan[];
}

export interface ModelGroupPlan {
    modelGroupId: string;
    tracks: TrackPlan[];
    printingParams: PrintingParams;
}

export interface LayerPlan {
    modelGroupPlans: ModelGroupPlan[];
}
