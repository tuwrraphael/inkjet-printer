import { PrintPlan } from "../slicer/LayerPlan";
import { PrinterParams } from "../slicer/PrinterParams";
import { PrintingParams } from "../slicer/PrintingParams";
import { CustomTrack } from "../state/State";
import { printBedPositionToMicroscope } from "../utils/printBedPositionToMicroscope";
import { getNozzleTestTasks } from "./NozzleTestTasks";
import { PrinterProgram, PrinterTasks, PrinterTaskType } from "./printer-program";

export function createPrintProgram(
    printingParams: PrintingParams,
    printerParams: PrinterParams,
    customTracks: CustomTrack[],
    printPlan: PrintPlan,
    options: {
        startAtLayer: number,
        home: boolean,
        nozzleTestBeforeFirstLayer: boolean,
        nozzleTestEveryNLayer: number
    }
) {
    let height = printingParams.firstLayerHeight;
    let homeTask: PrinterTasks[] = options.home ? [{ type: PrinterTaskType.Home }] : [];
    let nozzleTestBeforeFirstLayerTask: PrinterTasks[] = options.nozzleTestBeforeFirstLayer ? getNozzleTestTasks(0) : [];
    let steps: PrinterTasks[] = [
        ...(homeTask),
        ...(nozzleTestBeforeFirstLayerTask),
        {
            type: PrinterTaskType.HeatBed,
            temperature: printingParams.bedTemperature,
            primingPosition: {
                x: 200,
                y: 0,
                z: 40
            }
        },
        {
            type: PrinterTaskType.Move,
            movement: {
                x: 0, y: 0
            },
            feedRate: 10000
        },
        {
            type: PrinterTaskType.Wait,
            durationMs: 1000
        },
        {
            type: PrinterTaskType.ZeroEncoder
        }
    ];
    let maxLayersModels = printPlan.layers.length;
    let maxLayersCustomTracks = customTracks.reduce((a, b) => Math.max(a, b.layer + 1), 0);
    let maxLayers = Math.max(maxLayersModels, maxLayersCustomTracks);
    for (let i = options.startAtLayer; i < maxLayers; i++) {
        steps.push({
            type: PrinterTaskType.Move,
            movement: {
                x: 0,
                y: 0,
                z: height
            },
            feedRate: 10000
        });
        steps.push({
            type: PrinterTaskType.SetTargetPressure,
            targetPressure: -2
        });
        // steps.push({
        //     type: PrinterTaskType.PrimeNozzle
        // });
        let layerPlan = printPlan?.layers[i];
        if (null != layerPlan) {
            steps.push({
                type: PrinterTaskType.PrintLayer,
                layerNr: i,
                layerPlan: layerPlan,
                z: height,
                dryingPosition: {
                    x: 200,
                    y: 0,
                    z: 40
                }
            });
        }
        let layerCustomTracks = customTracks
        if (layerCustomTracks.length > 0) {
            steps.push({
                type: PrinterTaskType.PrintCustomTracks,
                customTracks: layerCustomTracks,
                z: height,
                printingParams: printingParams
            });
        }
        if (i % options.nozzleTestEveryNLayer === 0 && i != options.startAtLayer) {
            steps.push(...getNozzleTestTasks(i));
        }
        // steps.push({
        //     type: PrinterTaskType.Move,
        //     movement: {
        //         z: 25
        //     },
        //     feedRate: 500
        // });
    }
    if (printPlan && printPlan.layers.length > 0) {
        let x = printPlan.layers[0].modelGroupPlans[0].tracks[0].moveAxisPosition;
        let y = printPlan.layers[0].modelGroupPlans[0].tracks[0].startPrintAxisPosition;
        let pos = printBedPositionToMicroscope({ x: x, y: y }, height, printerParams.printBedToCamera, printerParams.movementRange);
        if (pos.feasible) {
            steps.push({
                type: PrinterTaskType.Move,
                movement: {
                    x: pos.microscopePos.x,
                    y: pos.microscopePos.y,
                    z: pos.microscopePos.z
                },
                feedRate: 10000
            });
        }
    }
    let program: PrinterProgram = {
        tasks: steps
    };
    return program;
}