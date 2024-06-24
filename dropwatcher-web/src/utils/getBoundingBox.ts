import { Point } from "../state/State";


export function getBoundingBox(points: Point[]): { min: Point, max: Point } {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let [x, y] of points) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
    }
    return { min: [minX, minY], max: [maxX, maxY] };
}


