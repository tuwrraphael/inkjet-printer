import { ModelParams, NewModel, PolygonType } from "../state/State";
import { getPrintheadSwathe } from "./getPrintheadSwathe";
import { ModelGroupPrintingParams } from "./ModelGroupPrintingParams";
import { PrinterParams } from "./PrinterParams";

export function getVoltageTestModels(
    printerParams: PrinterParams,
): {
    models: NewModel[],
    modelParams: { [id: string]: Partial<ModelParams> },
    modelGroupParams: { [id: string]: ModelGroupPrintingParams },
} {
    let models: NewModel[] = [];
    let modelParams: { [id: string]: Partial<ModelParams> } = {};
    let modelGroupParams: { [id: string]: ModelGroupPrintingParams } = {};
    let from = 35.6;
    let to = 25;
    let step = 0.5;
    let position = {
        x: 2,
        y: 12
    };
    let nr = 0;
    for (let v = from; v > to; v -= step) {
        let voltage = Math.round(v * 100) / 100;
        let swathe = getPrintheadSwathe(printerParams);
        let modelPosition = {
            x: (nr % 3) * 10 + position.x,
            y: Math.floor(nr / 3) * 5 + position.y
        };
        let purgePosition = {
            x: 0,
            y: 0
        };
        let id = `square-${nr}`;
        let group = `${voltage}V`;
        let model: NewModel = {
            layers: [{
                polygons: [{
                    type: PolygonType.Contour,
                    "points": [
                        [
                            3,
                            3
                        ],
                        [
                            0,
                            3
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            3,
                            0
                        ]
                    ]
                }]
            }],
            fileName: `square-${nr}.svg`,
            id: id
        };
        let purgeModel: NewModel = {
            layers: [{
                polygons: [{
                    type: PolygonType.Contour,
                    "points": [
                        [
                            2 * swathe.x - 1,
                            10
                        ],
                        [
                            0,
                            10
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            2 * swathe.x - 1,
                            0
                        ]
                    ]
                }]
            }],
            fileName: `purge-${nr}.svg`,
            id: `purge-${nr}V`
        };
        let photoPoint = {
            x: modelPosition.x + 1.5,
            y: modelPosition.y + 1.5
        };
        models.push(model);
        models.push(purgeModel);
        modelParams[id] = {
            modelGroupId: group,
            position: [modelPosition.x, modelPosition.y]
        };
        modelParams[purgeModel.id] = {
            modelGroupId: group,
            position: [purgePosition.x, purgePosition.y]
        };
        modelGroupParams[group] = {
            waveform: {
                voltage: voltage,
                clockFrequency: 1000
            },
            photoPoints: [photoPoint]
        };
        nr++;
    }
    return {
        models: models,
        modelParams: modelParams,
        modelGroupParams: modelGroupParams
    };
}