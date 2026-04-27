export const _generateCartesianPoints = (config) => {
    const { formula, 
        width, 
        height, 
        scale = 50, 
        xRange, 
        t = 0, 
        steps, 
        flat = false, 
        buffer = null 
    } = config;

    if (typeof formula !== 'function') {
        console.error("graphlyjs error: (301 formula is not a function in Cartesian generator)");
        return flat ? new Float32Array(0) : [];
    }


    const numSteps = steps || width; 
    const midX = width / 2;
    const midY = height / 2;

    if (flat) {
        const points = buffer || new Float32Array((numSteps + 1) * 2);
        for (let i = 0; i <= numSteps; i++) {
            const px = (i / numSteps) * width;
            const x = xRange ? (xRange[0] + (i / numSteps) * (xRange[1] - xRange[0])) : (px - midX) / scale;
            const y = formula(x, t);
            points[i * 2] = px;
            points[i * 2 + 1] = (y !== null && isFinite(y)) ? midY - (y * scale) : NaN;
        }
        return points;
    }

    const points = [];
    for (let px = 0; px <= width; px++) {
        const x = xRange ? (xRange[0] + (px / width) * (xRange[1] - xRange[0])) : (px - midX) / scale;
        const y = formula(x, t);
        points.push(y !== null && isFinite(y) ? { x: px, y: midY - (y * scale) } : null);
    }
    return points;
};

export const _generatePolarPoints = (config) => {
    const { formula, width, height, scale = 50, tRange = [0, 2 * Math.PI], steps = 1000, t = 0, flat = false, buffer = null } = config;
    
    if (typeof formula !== 'function') {
        console.error("graphlyjs error: (302 formula is not a function in Polar generator)");
        return flat ? new Float32Array(0) : [];
    }

    const midX = width / 2;
    const midY = height / 2;
    const [tMin, tMax] = tRange;

    if (flat) {
        const points = buffer || new Float32Array((steps + 1) * 2);
        for (let i = 0; i <= steps; i++) {
            const theta = tMin + (i / steps) * (tMax - tMin);
            const r = formula(theta, t);
            if (r !== null && isFinite(r)) {
                points[i * 2] = r * Math.cos(theta) * scale + midX;
                points[i * 2 + 1] = midY - r * Math.sin(theta) * scale;
            } else {
                points[i * 2] = points[i * 2 + 1] = NaN;
            }
        }
        return points;
    }

    const points = [];
    for (let i = 0; i <= steps; i++) {
        const theta = tMin + (i / steps) * (tMax - tMin);
        const r = formula(theta, t);
        points.push(r !== null && isFinite(r) ? { x: r * Math.cos(theta) * scale + midX, y: midY - r * Math.sin(theta) * scale } : null);
    }
    return points;
};

export const _generateParametricPoints = (config) => {
    const { fX, fY, width, height, scale = 50, tRange = [0, 2 * Math.PI], steps = 1000, t = 0, flat = false, buffer = null } = config;
    
    if (typeof fX !== 'function' || typeof fY !== 'function') {
        console.error("graphlyjs error: (303 fX or fY is not a function in Parametric generator)");
        return flat ? new Float32Array(0) : [];
    }

    const midX = width / 2;
    const midY = height / 2;
    const [tMin, tMax] = tRange;

    if (flat) {
        const points = buffer || new Float32Array((steps + 1) * 2);
        for (let i = 0; i <= steps; i++) {
            const u = tMin + (i / steps) * (tMax - tMin);
            const vx = fX(u, t), vy = fY(u, t);
            if (vx !== null && vy !== null && isFinite(vx) && isFinite(vy)) {
                points[i * 2] = midX + (vx * scale);
                points[i * 2 + 1] = midY - (vy * scale);
            } else {
                points[i * 2] = points[i * 2 + 1] = NaN;
            }
        }
        return points;
    }

    const points = [];
    for (let i = 0; i <= steps; i++) {
        const u = tMin + (i / steps) * (tMax - tMin);
        const vx = fX(u, t), vy = fY(u, t);
        points.push(vx !== null && vy !== null && isFinite(vx) && isFinite(vy) ? { x: midX + (vx * scale), y: midY - (vy * scale) } : null);
    }
    return points;
};

export const _generateComplexPoints = (config) => {
    const { formula, width, height, scale = 50, xRange = [-10, 10], steps = 1000, t = 0, flat = false, buffer = null } = config;
    
    if (typeof formula !== 'function') {
        console.error("graphlyjs error: (304 formula is not a function in Complex generator)");
        return flat ? new Float32Array(0) : [];
    }

    const midX = width / 2;
    const midY = height / 2;
    const [xMin, xMax] = xRange;

    if (flat) {
        const points = buffer || new Float32Array((steps + 1) * 2);
        for (let i = 0; i <= steps; i++) {
            const x = xMin + (i / steps) * (xMax - xMin);
            const res = formula(x, t);
            if (res && typeof res.re === 'number') {
                points[i * 2] = midX + (res.re * scale);
                points[i * 2 + 1] = midY - (res.im * scale);
            } else if (typeof res === 'number' && isFinite(res)) {
                points[i * 2] = midX + (res * scale);
                points[i * 2 + 1] = midY;
            } else {
                points[i * 2] = points[i * 2 + 1] = NaN;
            }
        }
        return points;
    }

    const points = [];
    for (let i = 0; i <= steps; i++) {
        const x = xMin + (i / steps) * (xMax - xMin);
        const res = formula(x, t);
        if (res && typeof res.re === 'number') {
            points.push({ x: midX + (res.re * scale), y: midY - (res.im * scale) });
        } else if (typeof res === 'number' && isFinite(res)) {
            points.push({ x: midX + (res * scale), y: midY });
        } else {
            points.push(null);
        }
    }
    return points;
};

