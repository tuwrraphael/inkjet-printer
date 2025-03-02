import { ModelParams, NewModel, PolygonType } from "../state/State";
import { getPrintheadSwathe } from "./getPrintheadSwathe";
import { ModelGroupPrintingParams } from "./ModelGroupPrintingParams";
import { PrinterParams } from "./PrinterParams";

export function getClockTestModels(printerParams : PrinterParams): {
    models: NewModel[],
    modelParams: { [id: string]: Partial<ModelParams> },
    modelGroupParams: { [id: string]: ModelGroupPrintingParams },
} {
    let models: NewModel[] = [];
    let modelParams: { [id: string]: Partial<ModelParams> } = {};
    let modelGroupParams: { [id: string]: ModelGroupPrintingParams } = {};
    let from = 1500;
    let to = 500;
    let step = 50;
    let position = {
        x: 2,
        y: 12
    };
    let nr = 0;
    for (let v = from; v > to; v -= step) {
        let frequency = v;
        let swathe = getPrintheadSwathe(printerParams);
        let modelPosition = {
            x: position.x,
            y: position.y
        };
        let purgePosition = {
            x: 0,
            y: 0
        };
        let id = `square-${nr}`;
        let group = `${frequency}kHz`;
        let model: NewModel = {
            layers: [{
                polygons: [{
                    type: PolygonType.Contour,
                    "points": [
                        [
                            swathe.x,
                            swathe.x
                        ],
                        [
                            0,
                            swathe.x
                        ],
                        [
                            0,
                            0
                        ],
                        [
                            swathe.x,
                            0
                        ]
                    ]
                }]
            }],
            fileName: `square-${nr}.svg`,
            id: id
        };
        let photoPoint = {
            x: modelPosition.x + 1.5,
            y: modelPosition.y + 1.5
        };


        models.push(model);
        modelParams[id] = {
            modelGroupId: group,
            position: [modelPosition.x, modelPosition.y]
        };
        modelGroupParams[group] = {
            waveform: {
                voltage: 35.6,
                clockFrequency: v
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