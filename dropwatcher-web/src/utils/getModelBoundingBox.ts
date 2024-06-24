import { Point, Polygon } from "../state/State";


export function getModelBoundingBox(model: {
    layers: {
        polygons: Polygon[];
    }[];
}): { min: Point; max: Point; } {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let layer of model.layers) {
        for (let polygon of layer.polygons) {
            for (let point of polygon.points) {
                minX = Math.min(minX, point[0]);
                minY = Math.min(minY, point[1]);
                maxX = Math.max(maxX, point[0]);
                maxY = Math.max(maxY, point[1]);
            }
        }
    }
    return { min: [minX, minY], max: [maxX, maxY] };

}
