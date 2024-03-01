let pattern = new Uint32Array(4);
pattern[3] = 1;
let dataview = new DataView(pattern.buffer);

function set_bit(id, value) {
    let patternid = Math.floor(id / 32);
    let bitid = id % 32;
    if (value) {
        pattern[patternid] |= (1 << (bitid));
    } else {
        pattern[patternid] &= ~(1 << (bitid));
    }
}

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
    for (let i = 0; i < 128/8; i++) {
        // for (let t = 0; t < 4; t++) {
        let byte = dataview.getUint8(i);
        for (let j = 0; j < 8; j++) {
            str += (byte & (1 << (j))) ? "1" : "0";
        }
        str += " ";
        // }

    }
    console.log(str);
}

function main() {
    for (let i = 0; i < 512; i++) {
        advance_pattern();
        spi_simulate();
    }

    // set_bit(24, 1);
    // set_bit(10, 1);
    // print_bits();
    
}

main();