import { Polygon, PolygonType, NewModel } from "../state/State";


export function getSquareModel(size: number, layers: number): NewModel {
    let polygons: Polygon[] = [];
    let p: Polygon = {
        points: [
            [0, 0],
            [size, 0],
            [size, size],
            [0, size]
        ],
        type: PolygonType.Contour
    };
    polygons.push(p);
    let l: NewModel["layers"] = [];
    for (let i = 0; i < layers; i++) {
        l.push({
            polygons: polygons
        });
    }
    let model: NewModel = {
        fileName: "test",
        layers: l,
    };
    return model;
}
