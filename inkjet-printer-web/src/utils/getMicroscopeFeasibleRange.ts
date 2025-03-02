
export function getMicroscopeFeasibleRange(offset: {
    x: number;
    y: number;
    z: number;
},
    motionLimits: {
        x: number;
        y: number;
        z: number;
    }
) {
    return {
        x: {
            min: -offset.x,
            max: motionLimits.x - offset.x
        },
        y: {
            min: -offset.y,
            max: motionLimits.y - offset.y
        },
        z: {
            min: -offset.z,
            max: motionLimits.z - offset.z
        }
    };
}
