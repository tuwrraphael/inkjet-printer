import { LayerPlan } from "../slicer/LayerPlan";

export function moveAxisPositionFromPlanAndIncrement(layerPlan: LayerPlan, modelGroup: string, increment: number) {
    let modelGroupPlan = layerPlan.modelGroupPlans.find(m => m.modelGroupId == modelGroup);
    if (!modelGroupPlan) {
        return null;
    }
    if (increment >= modelGroupPlan.tracks.length) {
        return null;
    }
    return modelGroupPlan.tracks[increment].moveAxisPosition;
}
