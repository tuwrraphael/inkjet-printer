
export function printBedPositionToMicroscope(pos: { x: number; y: number; }, height: number, offset: {
    x: number;
    y: number;
    z: number;
}, motionLimits: {
    x: number;
    y: number;
    z: number;
}) {
    let microscopePos = {
        x: pos.x + offset.x,
        y: pos.y + offset.y,
        z: offset.z + height
    };
    let feasible = microscopePos.x <= motionLimits.x && microscopePos.x > 0
        && microscopePos.y <= motionLimits.y && microscopePos.y > 0;
    microscopePos.z > 0 && microscopePos.z < motionLimits.z;
    return {
        feasible: feasible,
        microscopePos: microscopePos
    };
}
