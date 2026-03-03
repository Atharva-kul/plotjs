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
    x, y, 
    font = '16px Arial', 
    color = 'white'
) => {
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
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
