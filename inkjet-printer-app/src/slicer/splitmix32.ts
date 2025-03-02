export class SplitMix32 {
    constructor(private a: number) {
    }
    next() {
        this.a |= 0;
        this.a = this.a + 0x9e3779b9 | 0;
        let t = this.a ^ this.a >>> 16;
        t = Math.imul(t, 0x21f0aaad);
        t = t ^ t >>> 15;
        t = Math.imul(t, 0x735a2d97);
        return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
    };
    get state() {
        return this.a;
    }
}
