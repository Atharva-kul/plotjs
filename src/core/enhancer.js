import { _createFormula } from './math.js';

export const drawAxis = (ctx, width, height) => {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height/2);
    ctx.lineTo(width, height/2);
    ctx.moveTo(width/2, 0);
    ctx.lineTo(width/2, height);
    let xLabel = 'x-axis'
    let yLabel = 'y-axis'
    ctx.font = '12px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(xLabel, width - 50, height/2 - 10);
    ctx.fillText(yLabel, width/2 + 10, 20);
    
    ctx.stroke();
};

export const drawGrid = (
    ctx,
    width, 
    height, 
    gridSpacing = 50, 
    lineColor = '#555555', 
    lineWidth = 0.5
)  => {
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    for (let x = gridSpacing; x < width; x += gridSpacing) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
    }
    for (let y = gridSpacing; y < height; y += gridSpacing) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
    }
    ctx.stroke();
};

export const addText = (
    ctx, 
    text, 
    config={}
) => {
        const {
            point=null,
            color='white',
            font='16px Arial',
            scale=50
        } = config

        const {width, height} = ctx.canvas
        let canvasX, canvasY

        if(!point || point.length<2) {
            canvasX = 5
            canvasY = 5
        } else {
            canvasX = (width/2) + (point[0] * scale)
            canvasY = (height/2) -  (point[1] * scale)
        }

        ctx.fillStyle = color

        ctx.font = font;
        ctx.textBaseLine = 'top'
        ctx.textAlign = 'left'
        
        ctx.fillText(text, canvasX, canvasY);
};



export const findRoots = (formula, range = [-10, 10], steps = 1000, t = 0, precision = 1e-7) => {
    const [min, max] = range;
    const dx = (max - min) / steps;
    const res = { xRoots: [], yRoots: [], iotaRoots: [] };

    // Automatically compile if a string is passed
    // Check if the formula contains 'i' to enable complex mode
    const isComplex = typeof formula === 'string' && /\b(i)\b/.test(formula);
    const f = typeof formula === 'string' ? _createFormula(formula, ['x', 't'], { complex: isComplex }) : formula;
    if (!f) return res;

    const getVal = (x) => {
        const v = f(x, t);
        // Normalize to {re, im} object to handle both Real and Complex modes
        return (v && typeof v.re !== 'undefined') ? v : { re: v, im: 0 };
    };

    for (let i = 0; i < steps; i++) {
        let x1 = min + i * dx, x2 = min + (i + 1) * dx;
        let v1 = getVal(x1), v2 = getVal(x2);

        // 1. xRoots: Where the graph crosses the Real axis (Im = 0)
        // If it's a real function (im=0), we check where the value (re) crosses 0.
        let target1 = (v1.im === 0 && v2.im === 0) ? v1.re : v1.im;
        let target2 = (v1.im === 0 && v2.im === 0) ? v2.re : v2.im;

        if (target1 * target2 <= 0 && !isNaN(target1) && !isNaN(target2)) {
            let a = x1, b = x2, ya = target1;
            while ((b - a) > precision) {
                let mid = (a + b) / 2, vm = getVal(mid);
                let ym = (v1.im === 0 && v2.im === 0) ? vm.re : vm.im;
                if (Math.abs(ym) < precision) { a = b = mid; break; }
                if (ya * ym < 0) { b = mid; } else { a = mid; ya = ym; }
            }
            res.xRoots.push((a + b) / 2);
        }

        // 2. iotaRoots: Where the graph crosses the Imaginary axis (Re = 0)
        if (v1.re * v2.re <= 0 && !isNaN(v1.re) && !isNaN(v2.re)) {
            let a = x1, b = x2, xa = v1.re;
            while ((b - a) > precision) {
                let mid = (a + b) / 2, xm = getVal(mid).re;
                if (Math.abs(xm) < precision) { a = b = mid; break; }
                if (xa * xm < 0) { b = mid; } else { a = mid; xa = xm; }
            }
            res.iotaRoots.push((a + b) / 2);
        }
    }

    // 3. yRoots: Value(s) at the origin intersection (usually x=0)
    if (min <= 0 && max >= 0) {
        const valAtZero = getVal(0);
        res.yRoots.push(valAtZero.re);
    }

    // Deduplicate and cleanup
    const clean = (arr) => arr.filter((v, i, a) => i === 0 || Math.abs(v - a[i - 1]) > precision * 2);
    res.xRoots = clean(res.xRoots);
    res.iotaRoots = clean(res.iotaRoots);

    return res;
};

/**
 * Automatically plots roots/intersections on the canvas.
 * @param {CanvasRenderingContext2D} ctx 
 * @param {Object} roots - The roots object from findRoots.
 * @param {Object} config - { type, formula, formulaX, formulaY, width, height, scale, colors }
 */
export const drawRoots = (ctx, roots, config) => {
    const { 
        type = 'cartesian',
        formula,      // Main formula (Cartesian/Complex string or function)
        formulaX,     // For parametric
        formulaY,     // For parametric
        width, 
        height, 
        scale = 50,
        xColor = '#ff4747',
        yColor = '#4775ff',
        iotaColor = '#ffff00',
        radius = 5
    } = config;

    const centerX = width / 2;
    const centerY = height / 2;

    const compile = (f, isComplex) => typeof f === 'string' ? _createFormula(f, ['x', 't'], { complex: isComplex }) : f;
    
    const f = compile(formula, formula && /\b(i)\b/.test(formula));
    const fX = compile(formulaX, false);
    const fY = compile(formulaY, false);

    const plot = (xVal, yVal, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(centerX + xVal * scale, centerY - yVal * scale, radius, 0, Math.PI * 2);
        ctx.fill();
    };

    if (type === 'parametric') {
        // xRoots of formulaY are intersections with X-axis
        if (fX) roots.xRoots.forEach(t => {
            const v = fX(t, 0);
            if (v !== null) plot(v, 0, xColor);
        });
        // xRoots of formulaX are intersections with Y-axis
        if (fY) roots.iotaRoots.forEach(t => {
            const v = fY(t, 0);
            if (v !== null) plot(0, v, yColor);
        });
    } else if (type === 'complex') {
        roots.xRoots.forEach(t => {
            const val = f(t, 0);
            if (val && typeof val.re !== 'undefined') plot(val.re, val.im, xColor);
        });
        roots.iotaRoots.forEach(t => {
            const val = f(t, 0);
            if (val && typeof val.re !== 'undefined') plot(val.re, val.im, iotaColor);
        });
    } else {
        // Cartesian
        roots.xRoots.forEach(x => plot(x, 0, xColor));
        roots.yRoots.forEach(y => plot(0, y, yColor));
    }
};

/**
 * Finds local minima and maxima of a function within a given range.
 * @param {string|Function} formula - The formula string or compiled function.
 * @param {Array} range - [min, max] search interval.
 * @param {number} steps - Density of search.
 * @param {number} t - Time parameter for animations.
 * @returns {Object} { maxima: [{x, y}], minima: [{x, y}] }
 */
export const findExtrema = (formula, range = [-10, 10], steps = 1000, t = 0) => {
    const [min, max] = range;
    const dx = (max - min) / steps;
    const res = { maxima: [], minima: [] };

    // Auto-detect complex mode
    const isComplex = typeof formula === 'string' && /\b(i)\b/.test(formula);
    const f = typeof formula === 'string' ? _createFormula(formula, ['x', 't'], { complex: isComplex }) : formula;
    if (!f) return res;

    const getVal = (x) => {
        const v = f(x, t);
        return (v && typeof v.re !== 'undefined') ? v.re : v;
    };

    let prevY = getVal(min);
    let currY = getVal(min + dx);

    for (let i = 2; i <= steps; i++) {
        let x = min + i * dx;
        let nextY = getVal(x);

        if (currY > prevY && currY > nextY) {
            res.maxima.push({ x: x - dx, y: currY });
        } else if (currY < prevY && currY < nextY) {
            res.minima.push({ x: x - dx, y: currY });
        }

        prevY = currY;
        currY = nextY;
    }
    return res;
};

/**
 * Draws extrema points on the canvas.
 * @param {CanvasRenderingContext2D} ctx 
 * @param {Object} extrema - The object from findExtrema.
 * @param {Object} config - { width, height, scale, maxColor, minColor, radius }
 */
export const drawExtrema = (ctx, extrema, config) => {
    const { 
        width, height, 
        scale = 50, 
        maxColor = '#ffcf47', 
        minColor = '#47ffcf', 
        radius = 5 
    } = config;
    
    const centerX = width / 2;
    const centerY = height / 2;

    const plot = (p, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(centerX + p.x * scale, centerY - p.y * scale, radius, 0, Math.PI * 2);
        ctx.fill();
    };

    extrema.maxima.forEach(p => plot(p, maxColor));
    extrema.minima.forEach(p => plot(p, minColor));
};
