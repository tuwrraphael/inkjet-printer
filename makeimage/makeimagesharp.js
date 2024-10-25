const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

async function processImages(regex, rect, outfilename, unit) {
    const files = fs.readdirSync(".");
    const imageFiles = files.filter(file => regex.test(file));

    let rectangles = [];

    const khzValues = [];

    for (const file of imageFiles) {
        const match = file.match(regex);
        if (match) {
            const khz = parseFloat(match[1], 10);
            khzValues.push(khz);

            const image = sharp(path.join("./", file));
            const croppedImage = await image.extract({ left: rect.x, top: rect.y, width: rect.width, height: rect.height }).flatten().toBuffer();
            rectangles.push(croppedImage);
        }
    }


    for (let i = 0; i < rectangles.length; i++) {
        const khz = khzValues[i];
        const text = `${khz}${unit}`;

        const svgText = `
            <svg width="${rect.width}" height="${rect.height}">
            <text x="50%" y="${rect.height-50}" font-size="45" fill="black" text-anchor="middle" alignment-baseline="middle">${text}</text>
            </svg>
        `;

        const svgBuffer = Buffer.from(svgText);
        const textImage = await sharp(svgBuffer).png({
            width: rect.width,
            height: rect.height,
        }).toBuffer();

        const compositeImage = await sharp(rectangles[i]).composite([{ input: textImage, top: 0, left: 0 }]).toBuffer();
        rectangles[i] = compositeImage;
    }

    console.log(`Found ${rectangles.length} images matching the regex.`);

    if (rectangles.length === 0) {
        console.log("No images found matching the regex.");
        return;
    }

    const combinedWidth = rect.width * rectangles.length;
    const combinedHeight = rect.height;

    let combinedImage = sharp({
        create: {
            width: combinedWidth,
            height: combinedHeight,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 0 }
        }
    });

    const sortedIndices = khzValues
        .map((value, index) => ({ value, index }))
        .sort((a, b) => a.value - b.value)
        .map(({ index }) => index);

    rectangles = sortedIndices.map(index => rectangles[index]);

    const compositeArray = rectangles.map((rectImage, index) => ({
        input: rectImage,
        left: index * rect.width,
        top: 0
    }));

    combinedImage = combinedImage.composite(compositeArray);

    await combinedImage.toFile(outfilename);
    console.log("The combined image was created.");
}
let imgs = [
        {
        regex: /clocksweep-(\d+)-kHz.png$/,
        rect: { x: 678, y: 0, width: 180, height: 774 },
        unit: "kHz",
        outfilename: "clocksweep_ink_1g-wide.png"
    },
    {
        regex: /clocksweep-(\d+)-kHz-142000-ns.png$/,
        rect: { x: 678, y: 0, width: 180, height: 774 },
        unit: "kHz",
        outfilename: "clocksweep_ink_1g-narrow.png"
    },
    {
        regex: /voltagesweep-(\d+(\.\d+)?)-V-142000-ns.png$/,
        rect: { x: 782, y: 0, width: 127, height: 774 },
        unit: "V",
        outfilename: "voltagesweep_ink_1g.png"
    }
];

async function run() {
    for (let img of imgs) {
        await processImages(img.regex, img.rect, img.outfilename, img.unit);
    }
}
run().catch(console.error);