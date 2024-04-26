import fs from 'fs';

function formatNumber(num) {
  return num.toFixed(2);
}

console.log(`import { PrinterTaskType, PrinterTasks } from "./printer-program";

export const HelloWorldProgamSteps :PrinterTasks[]= [`);

fs.readFileSync("./text.gcode", "utf8").split("\n").forEach((line) => {
  if (line.match(/^G1.+; perimeter$/) || line.match(/^G1.+; infill$/)) {
    try {
      let [_, x, y] = line.match(/X(-?\d+\.?\d*) Y(-?\d+\.?\d*)/);
      x = parseFloat(x);
      y = parseFloat(y)+50;
      if (isNaN(x) || isNaN(y)) {
        throw new Error("Invalid number");
      }
      console.log(`{ type: PrinterTaskType.Move, x: ${formatNumber(x)}, y: ${formatNumber(y)}, z: 0, feedRate: 1000 }, {type:PrinterTaskType.RequestFire},`);
    }
    catch (e) {
      console.error("Error parsing line: ", line);
      throw e;
    }

  }
});

console.log(`];`);