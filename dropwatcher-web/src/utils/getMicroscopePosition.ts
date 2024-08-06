export function getMicroscopePosition(pos: { x: number; y: number; z: number; }, offset: { x: number; y: number; z: number; }): { x: number; y: number; z: number; } {
    return {
        x: pos.x - offset.x,
        y: pos.y - offset.y,
        z: pos.z - offset.z
    };
}
