let pattern = new Uint32Array(4);
// pattern[3] = 1;
let dataview = new DataView(pattern.buffer);


function print_bits() {
    console.log("Pattern:" + pattern.map(p => p.toString(2)).join(","));
    let str = "";
    for (let i = 0; i < 128; i++) {
        let patternid = Math.floor(i / 32);
        let bitid = i % 32;
        str += (pattern[patternid] & (1 << (31 - bitid))) ? "1" : "0";
    }
    console.log(str);
}

function advance_pattern() {
    // let filling = (pattern[3] & 0x80000000) == 0;
    for (let i = 3; i >= 0; i--) {
        pattern[i] = (pattern[i] << 1);
        if (i > 0 && (pattern[i - 1] & 0x80000000)) {
            pattern[i] |= 1;
        }
    }
    if (pattern[3] & 0x80000000) {
        pattern[0] |= 1;
    }
    return 0;
}


function spi_simulate() {
    let str = "";
    let dataview = new DataView(pattern.buffer);
    for (let k = 1; k >= 0; k--) {

        for (let i = 0; i < 64 / 8; i++) {
            // for (let t = 0; t < 4; t++) {
            let byte = dataview.getUint8(i + k * 8);
            for (let j = 7; j >= 0; j--) {
                str += (byte & (1 << (j))) ? "1" : "0";
            }
            str += " ";
            // }

        }

        str += "| ";
    }
    console.log(str);
}

function reverse32(nozzles) {
    return ((nozzles & 0xFF) << 24) | (((nozzles & 0xFF00)) << 8) | (((nozzles & 0xFF0000)) >>> 8) | ((nozzles & 0xFF000000) >>> 24);
}


function write_pattern(nozzles) {
    // console.log((nozzles[0] & 0xFFFFFFFFF).toString(2));
    pattern[1] = reverse32(nozzles[0]);
    pattern[0] = reverse32(nozzles[1]);
    pattern[3] = reverse32(nozzles[2]);
    pattern[2] = reverse32(nozzles[3]);
}

function set_nozzle(nozzles, nozzleid, value) {
    let patternid = Math.floor(nozzleid / 32);
    let bitid = nozzleid % 32;
    if (value) {
        nozzles[patternid] |= 1 << (bitid);
    } else {
        nozzles[patternid] &= ~(1 << (bitid));
    }
}

function main() {
    // for (let i = 0; i < 512; i++) {
    //     advance_pattern();
    //     spi_simulate();
    // }

    let nozzles = new Uint32Array(4);

    // let nr = (BigInt(1) << BigInt(0));
    // console.log(nr.toString(2));
    // nozzles[0] = 0;Number(nr & BigInt(0xFFFFFFFF));
    // nozzles[1] = 0;Number((nr >> BigInt(32)) & BigInt(0xFFFFFFFF));
    // nozzles[2] = 0;Number((nr >> BigInt(64)) & BigInt(0xFFFFFFFF));
    // nozzles[3] = 1 << 31;Number((nr >> BigInt(96)) & BigInt(0xFFFFFFFF));

    set_nozzle(nozzles, 15, 1);
    nozzles[0] = 0x80018001;
     console.log(nozzles);

    // console.log(nozzles, Array.from(nozzles).map(n => n.toString(2)));


    write_pattern(nozzles);
    spi_simulate();


    // set_bit(24, 1);
    // set_bit(10, 1);
    // print_bits();

}

main();