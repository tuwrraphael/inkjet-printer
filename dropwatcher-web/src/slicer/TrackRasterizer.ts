import { TrackRasterizationResult } from "./TrackRasterizationResult";


export interface TrackRasterizer {

    rasterize(moveAxisPosition: number): TrackRasterizationResult;

}
