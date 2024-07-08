import { Polygon, PolygonType } from "../state/State";


export function svgToModel(doc: Document): { layers: { polygons: Polygon[] }[] } {
    const polygonTypeMap: { [key: string]: PolygonType; } = {
        "contour": PolygonType.Contour,
        "hole": PolygonType.Hole
    };
    const layers: { polygons: Polygon[]; }[] = Array.from(doc.querySelectorAll("g")).map((g) => {
        return {
            polygons: Array.from(g.querySelectorAll("polygon")).map((p) => {
                return {
                    type: polygonTypeMap[p.getAttribute("slic3r:type")],
                    points: p.getAttribute("points").split(" ").map((point) => {
                        const [x, y] = point.split(",").map((n) => parseFloat(n));
                        return [x, y];
                    })
                };
            })
        };
    });
    return { layers: layers };
}
