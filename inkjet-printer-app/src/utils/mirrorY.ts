import { Point } from "../state/State";
import { getBoundingBox } from "./getBoundingBox";


export function mirrorY(points: Point[], boundingBox: { min: Point; max: Point; }|null): Point[] {
    if (null === boundingBox) {
        boundingBox = getBoundingBox(points);
    }
    let height = (boundingBox.max[1] - boundingBox.min[1]);
    return points.map(([x, y]) => {
        return [x, height - y];
    });
}

