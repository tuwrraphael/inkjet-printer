import { NewModel, Polygon, PolygonType } from "../state/State";
import { getModelBoundingBox } from "../utils/getModelBoundingBox";
import { mirrorY } from "../utils/mirrorY";
import { getNozzleDistance } from "./getNozzleDistance";
import bwipjs from 'bwip-js';
import { PrinterParams } from "./PrinterParams";

export function getCodeModel(printerParams: PrinterParams) {
    let code: any = bwipjs.raw("qrcode", "30x30 square 50 layers 60°C 28V 144 dpi skip_n 0 offset 3", {});
    const dotsPerPixel = 16;
    const dpMM = 1 / getNozzleDistance(printerParams).x;
    const pixelWidth = Math.sqrt(dotsPerPixel) * 1 / dpMM;
    let polygons: Polygon[] = [];
    for (let i = 0; i < code[0].pixx; i++) {
        for (let j = 0; j < code[0].pixy; j++) {
            if (code[0].pixs[j * code[0].pixx + i] == 1) {
                polygons.push({
                    points: [
                        [i * pixelWidth, j * pixelWidth],
                        [(i + 1) * pixelWidth, j * pixelWidth],
                        [(i + 1) * pixelWidth, (j + 1) * pixelWidth],
                        [i * pixelWidth, (j + 1) * pixelWidth]
                    ],
                    type: PolygonType.Contour
                });
            }
        }
    }
    let model: NewModel = {
        fileName: "code",
        layers: [
            {
                polygons: polygons
            }
        ]
    };
    let bb = getModelBoundingBox(model);
    model.layers = model.layers.map(l => {
        return {
            ...l,
            polygons: l.polygons.map(p => {
                return {
                    ...p,
                    points: mirrorY(p.points, bb)
                };
            })
        };
    });
    let duplicateLayers = 19;
    for (let i = 0; i < duplicateLayers; i++) {
        model.layers = [...model.layers, model.layers[0]];
    }
    return model;
}