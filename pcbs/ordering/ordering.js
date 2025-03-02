import fs, { write } from "fs";
import path from "path";
import csv from "csv-parser";
import stripBom from "strip-bom-stream";
import csvWriteStream from "csv-write-stream";
import clipboardy from "clipboardy";
import inquirer from "inquirer";

async function readBom(file) {
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


let bomfor = [
    "Xaar128-Driver",
    "Xaar128-Adapter"
];

let ordered = await readBom(path.join(process.cwd(), "ordered.csv"));
let checkedFootprints = await readBom(path.join(process.cwd(), "checked_footprints.csv"));
let used = new Map();

let result = [];

let internalSuppliers = [
    "Elektroplatz",
    "Printerbox",
    "None"
]

let orderExtensions = [
    "Regulator"
];

function writeOrders() {
    let newordered = ordered.map(o => {
        let usedqty = used.get(o.RSBestNr) || 0;
        return { ...o, Used: usedqty };
    });

    const writeStream2 = fs.createWriteStream(path.join(process.cwd(), "ordered.csv"));
    const headers2 = Array.from(newordered.reduce((prev, cur) => new Set([...prev, ...Object.keys(cur)]), new Set()));
    const writer2 = csvWriteStream({ headers: headers2 });
    writer2.pipe(writeStream2);
    for (let a of newordered) {
        writer2.write(a);
    }

}

function writeCheckedFootprints() {
    const writeStream2 = fs.createWriteStream(path.join(process.cwd(), "checked_footprints.csv"));
    const headers2 = Array.from(checkedFootprints.reduce((prev, cur) => new Set([...prev, ...Object.keys(cur)]), new Set()));
    const writer2 = csvWriteStream({ headers: headers2 });
    writer2.pipe(writeStream2);
    for (let a of checkedFootprints) {
        writer2.write(a);
    }
}

async function confirmFootprint(value, footprint, rsbestnr) {
    let found = checkedFootprints.filter(c => c.RSBestNr == rsbestnr);
    if (found.length > 0) {
        await inquirer
            .prompt([
                {
                    type: "confirm", name: "confirm", message:
                        `RSBestNr ${rsbestnr} already has a footprint(s): ${found.map(f => `${f.Value} ${f.Footprint}`).join(", ")}. Confirm add ${footprint} for ${value}?`
                },
            ])
            .then((answers) => {
                if (answers.confirm) {
                    checkedFootprints.push({
                        Value: value,
                        Footprint: footprint,
                        RSBestNr: rsbestnr
                    });
                } else {
                    throw new Error(`Duplicate footprint for ${rsbestnr}.`);
                }
            })
            .catch((error) => {
                throw error;
            });
    } else {
        checkedFootprints.push({
            Value: value,
            Footprint: footprint,
            RSBestNr: rsbestnr
        });
    }
    writeCheckedFootprints();
}

function isFootprintChecked(value, footprint, rsbestnr) {
    return checkedFootprints.some(c => c.RSBestNr == rsbestnr && c.Footprint == footprint && c.Value == value);
}

// for(let checkedFootprint of checkedFootprints) {
//     if (checkedFootprints.find(c => c.RSBestNr == checkedFootprint.RSBestNr && c != checkedFootprint)) {
//         console.warn(`Duplicate footprint for ${checkedFootprint.RSBestNr}.`);
//     }
// }

for (let bomfile of bomfor) {
    let bom = await readBom(path.join(process.cwd(), "../", `${bomfile}/${bomfile}.csv`));
    for (let entry of bom) {
        if (entry.DNP == "DNP" && !orderExtensions.includes(entry.Extension)) {
            result.push({ ...entry, done: true });
            continue;
        }
        if (internalSuppliers.includes(entry.Supplier)) {
            result.push({ ...entry, done: true });
            continue;
        }
        let order = ordered.find(o => o.RSBestNr === entry.RSBestNr);
        let requiredqty = parseInt(entry["Qty"]);
        if (isNaN(requiredqty)) {
            throw new Error(`No Qty for ${entry.Reference} in ${bomfile}`);
        }
        if (null != order) {
            let orderedqty = parseInt(order["Qty"]);
            let usedqty = used.get(entry.RSBestNr) || 0;

            let remainingqty = orderedqty - usedqty;
            if (remainingqty >= requiredqty) {
                if (isFootprintChecked(entry.Value, entry.Footprint, entry.RSBestNr)) {
                    used.set(entry.RSBestNr, usedqty + requiredqty);
                    result.push({ ...entry, done: true });
                } else {
                    clipboardy.writeSync(entry.RSBestNr);
                    await inquirer
                        .prompt([
                            {
                                type: "confirm", name: "confirm", message:
                                    `Check ${entry.RSBestNr} for ${entry.Value} and ${entry.Footprint}.`
                            },
                        ])
                        .then((answers) => {
                            if (answers.confirm) {
                                used.set(entry.RSBestNr, usedqty + requiredqty);
                                return confirmFootprint(entry.Value, entry.Footprint, entry.RSBestNr).then(() => {
                                    writeOrders();
                                    result.push({ ...entry, done: true });
                                });
                            } else {
                                result.push({ ...entry, done: false, todo: "check_footprint" });
                            }
                        })
                        .catch((error) => {
                            throw error;
                        });
                }
            } else {
                clipboardy.writeSync(entry.RSBestNr);
                await inquirer
                    .prompt([
                        {
                            type: "number", name: "qty", message:
                                `Add ${requiredqty - remainingqty} to ${entry.RSBestNr} and check ${entry.Value} and ${entry.Footprint}, then put actual Qty.`
                        },
                    ])
                    .then((answers) => {
                        if (answers.qty && !isNaN(answers.qty) && answers.qty >= requiredqty) {
                            order.Qty = answers.qty;
                            used.set(entry.RSBestNr, usedqty + requiredqty);
                            return confirmFootprint(entry.Value, entry.Footprint, entry.RSBestNr).then(() => {
                                writeOrders();
                                result.push({ ...entry, done: true });
                            });
                        } else {
                            result.push({ ...entry, done: false, todo: "add_qty" });
                        }
                    })
                    .catch((error) => {
                        throw error;
                    });
            }
        } else {
            if (null == entry.RSBestNr || /^\s*$/.test(entry.RSBestNr)) {
                throw new Error(`No RSBestNr for ${entry.Reference} in ${bomfile}`);
            }
            clipboardy.writeSync(entry.RSBestNr);
            await inquirer
                .prompt([
                    {
                        type: "number", name: "qty", message:
                            `Order min ${entry.Qty} of ${entry.RSBestNr} and check ${entry.Value} and ${entry.Footprint}, then put actual Qty.`
                    },
                ])
                .then((answers) => {
                    if (answers.qty && !isNaN(answers.qty) && answers.qty >= requiredqty) {
                        ordered.push({ RSBestNr: entry.RSBestNr, Qty: answers.qty });
                        used.set(entry.RSBestNr, requiredqty);
                        return confirmFootprint(entry.Value, entry.Footprint, entry.RSBestNr).then(() => {
                            writeOrders();
                            result.push({ ...entry, done: true });
                        });
                    } else {
                        result.push({ ...entry, done: false, todo: "order_part" });
                    }

                })
                .catch((error) => {
                    throw error;
                });
        }
    }
    writeOrders();
}

// find unused
for (let order of ordered) {
    if (!used.has(order.RSBestNr)) {
        console.warn(`Unused ${order.RSBestNr}`);
    } else if (used.get(order.RSBestNr) < 1) {
        console.warn(`Unused ${order.RSBestNr}`);
    }
}

const writeStream = fs.createWriteStream(path.join(process.cwd(), "result.csv"));
const headers = Array.from(result.reduce((prev, cur) => new Set([...prev, ...Object.keys(cur)]), new Set()));
const writer = csvWriteStream({ headers: headers });
writer.pipe(writeStream);
for (let a of result) {
    writer.write(a);
}
writer.end();
console.log("All done 👍.");
