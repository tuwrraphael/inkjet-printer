import { CorrectionTrack } from "./CorrectionTrack";
import { PrintingParams } from "./PrintingParams";
import { TrackRasterization } from "./TrackRasterization";


export interface TrackRasterizationResult {
    track: TrackRasterization;
    correctionTracks: CorrectionTrack[];
    printingParams: PrintingParams;
}
