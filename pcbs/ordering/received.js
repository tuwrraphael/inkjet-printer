import fs, { write } from "fs";
import path from "path";
import csv from "csv-parser";
import stripBom from "strip-bom-stream";
import csvWriteStream from "csv-write-stream";
import clipboardy from "clipboardy";
import inquirer from "inquirer";
import inquirerPrompt from 'inquirer-autocomplete-prompt';

async function readCsv(file) {
    const stopsStream = fs.createReadStream(file);
    return new Promise(resolve => {
        const bomentries = [];
        stopsStream
            .pipe(stripBom())
            .pipe(csv())
            .on("data", (data) => bomentries.push(data))
            .on('end', () => {
                resolve(bomentries)
            });
    })
}
inquirer.registerPrompt('autocomplete', inquirerPrompt);

function writeOrders(orderedParts) {
    const writeStream2 = fs.createWriteStream(path.join(process.cwd(), "ordered.csv"));
    const headers2 = Array.from(orderedParts.reduce((prev, cur) => new Set([...prev, ...Object.keys(cur)]), new Set()));
    const writer2 = csvWriteStream({ headers: headers2 });
    writer2.pipe(writeStream2);
    for (let a of orderedParts) {
        writer2.write(a);
    }
}


async function main() {
    let bomfor = [
        "Xaar128-Driver",
        "Xaar128-Adapter"
    ];
    let answer = null;
    let orderedParts = await readCsv(path.join(process.cwd(), "ordered.csv"));
    let boms = (await Promise.all(bomfor.map(b => readCsv(path.join(process.cwd(), "../", b, `${b}.csv`))))).flat();
    do {

        answer = await inquirer
            .prompt([
                {
                    type: 'autocomplete',
                    name: 'from',
                    message: 'Type RSBestNr',
                    source: (answersSoFar, input) => [...orderedParts.filter(p => p.RSBestNr.includes(input)).map(p => p.RSBestNr),""],
                },
            ]);
        if (answer.from) {
            orderedParts.find(p => p.RSBestNr === answer.from).Received = true;
            let matchingBoms = boms.filter(b => b.RSBestNr === answer.from);
            console.log(`Will be used for \n${matchingBoms.map(b => `${b.Qty} x ${b.Value} ${b.Footprint}`).join("\n")}`);
            writeOrders(orderedParts);
        }
    } while (answer.from);
    for(let o of orderedParts.filter(p => !p.Received)) {
        console.log(`Not received: ${o.RSBestNr}`);
        let matchingBoms = boms.filter(b => b.RSBestNr === o.RSBestNr);
        console.log(`Will be used for \n${matchingBoms.map(b => `${b.Qty} x ${b.Value} ${b.Footprint}`).join("\n")}`);
    }
    console.log("All done 👍.");
}

main().catch(e => console.error(e));