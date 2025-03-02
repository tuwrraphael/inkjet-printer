
export function setNozzleForRow(id: number, value: boolean, data: Uint32Array, rowOffset: number) {
    let patternid = Math.floor(id / 32);
    let bitid = id % 32;
    if (value) {
        data[patternid + rowOffset*4] |= (1 << (bitid));
    } else {
        data[patternid + rowOffset*4] &= ~(1 << (bitid));
    }
}
