
export class AutofocusCache {
    private cache = new Map<{ x: number; y: number; }, number>();

    get(x: number, y: number) {
        return Array.from(this.cache.entries()).find(([key, value]) => key.x === x && key.y === y)?.[1];
    }

    set(x: number, y: number, value: number) {
        this.cache.set({ x, y }, value);
    }
}
