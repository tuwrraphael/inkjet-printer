import { Polygon, Point } from "../state/State";


export interface SliceModelInfo {
    polygons: {
        polygon: Polygon;
        transformedCoordinates: Point[];
        boundingBox: {
            min: Point;
            max: Point;
        };
    }[];
    contourBoundingBoxes: { min: Point; max: Point; }[];
    modelGroupId: string;
}
