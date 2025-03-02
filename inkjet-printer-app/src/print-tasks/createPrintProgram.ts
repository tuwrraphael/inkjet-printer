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
        {
            type: PrinterTaskType.SetTargetPressure,
            targetPressure: printingParams.inkPressure,
            enable :true
        },
        ...(homeTask),
        {
            type: PrinterTaskType.HeatBed,
            wait:false,
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
        },
        ...(nozzleTestBeforeFirstLayerTask),
        {
            type: PrinterTaskType.HeatBed,
            wait:true,
            temperature: printingParams.bedTemperature,
            primingPosition: {
                x: 200,
                y: 0,
                z: 40
            }
        },
        // {
        //     type: PrinterTaskType.NozzleWetting,
        //     pressurePrinting: -0.6,
        //     pressureWetting: 2,
        //     wettingWaitTime: 1000
        // },
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
            type: PrinterTaskType.PrimeNozzle
        });
        steps.push({
            type: PrinterTaskType.SetTargetPressure,
            targetPressure: printingParams.inkPressure,
            enable : false
        });
        let layerPlan = printPlan?.layers[i];
        if (null != layerPlan) {
            steps.push({
                type: PrinterTaskType.PrintLayer,
                layerNr: i,
                layerPlan: layerPlan,
                z: height
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
        steps.push({
            type: PrinterTaskType.SetTargetPressure,
            targetPressure: printingParams.inkPressure,
            enable : true
        });
        let remainingLayers = maxLayers - i;

        if (i % options.nozzleTestEveryNLayer === 0 && i != options.startAtLayer && remainingLayers > (options.nozzleTestEveryNLayer/2)) {
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