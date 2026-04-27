import { _createFormula } from './math.js';

export const drawAxis = (ctx, width, height) => {
    if (!ctx) {
        console.error("graphlyjs error: (501 2D context is missing in drawAxis)");
        return;
    }
    const w = width || ctx.canvas.width;
    const h = height || ctx.canvas.height;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h/2);
    ctx.lineTo(w, h/2);
    ctx.moveTo(w/2, 0);
    ctx.lineTo(w/2, h);
    let xLabel = 'x-axis'
    let yLabel = 'y-axis'
    ctx.font = '12px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(xLabel, w - 50, h/2 - 10);
    ctx.fillText(yLabel, w/2 + 10, 20);
    
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
    if (!ctx) {
        console.error("graphlyjs error: (502 2D context is missing in drawGrid)");
        return;
    }
    const w = width || ctx.canvas.width;
    const h = height || ctx.canvas.height;
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    for (let x = gridSpacing; x < w; x += gridSpacing) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
    }
    for (let y = gridSpacing; y < h; y += gridSpacing) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
    }
    ctx.stroke();
};

export const addText = (
    ctx, 
    text, 
    config={}
) => {
    if (!ctx) {
        console.error("graphlyjs error: (503 2D context is missing in addText)");
        return;
    }
    const {
        point=null,
        color='white',
        font='16px Arial',
        scale=50
    } = config

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    let canvasX, canvasY

    if(!point || point.length<2) {
        canvasX = 5
        canvasY = 5
    } else {
        canvasX = (w/2) + (point[0] * scale)
        canvasY = (h/2) -  (point[1] * scale)
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
    if (!f) {
        console.error("graphlyjs error: (504 formula conversion failed in findRoots)");
        return res;
    }

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
    if (!ctx) {
        console.error("graphlyjs error: (505 2D context is missing in drawRoots)");
        return;
    }
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

    const w = width || ctx.canvas.width;
    const h = height || ctx.canvas.height;
    const centerX = w / 2;
    const centerY = h / 2;

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
        if (!f) {
            console.error("graphlyjs error: (506 formula is required for drawing complex roots)");
            return;
        }
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
    if (!f) {
        console.error("graphlyjs error: (507 formula conversion failed in findExtrema)");
        return res;
    }

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
    if (!ctx) {
        console.error("graphlyjs error: (508 2D context is missing in drawExtrema)");
        return;
    }
    const { 
        width, height, 
        scale = 50, 
        maxColor = '#ffcf47', 
        minColor = '#47ffcf', 
        radius = 5 
    } = config;
    
    const w = width || ctx.canvas.width;
    const h = height || ctx.canvas.height;
    const centerX = w / 2;
    const centerY = h / 2;

    const plot = (p, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(centerX + p.x * scale, centerY - p.y * scale, radius, 0, Math.PI * 2);
        ctx.fill();
    };

    extrema.maxima.forEach(p => plot(p, maxColor));
    extrema.minima.forEach(p => plot(p, minColor));
};

/**
 * Adds interactive coordinate tracking to a canvas.
 * @param {HTMLCanvasElement} canvas 
 * @param {Object} config - { scale, color, font }
 */
export const showCoordinates = (canvas, config = {}) => {
    if (!canvas) {
        console.error("graphlyjs error: (509 canvas is missing in showCoordinates)");
        return () => {};
    }
    const { 
        scale = 50, 
        color = '#ffffff', 
        font = '12px monospace' 
    } = config;

    // Prevent duplicate initializations
    if (canvas.dataset.hasCoordinates) return () => {};
    canvas.dataset.hasCoordinates = 'true';

    // 1. Setup Wrapper & Overlay
    let wrapper = canvas.parentElement;
    if (!wrapper || !wrapper.classList.contains('graphlyjs-wrapper')) {
        wrapper = document.createElement('div');
        wrapper.classList.add('graphlyjs-wrapper');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        canvas.parentNode.insertBefore(wrapper, canvas);
        wrapper.appendChild(canvas);
    }

    const overlay = document.createElement('canvas');
    const oCtx = overlay.getContext('2d');
    if (!oCtx) {
        console.error("graphlyjs error: (510 failed to get 2D context for overlay in showCoordinates)");
        return () => {};
    }
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '10';
    wrapper.appendChild(overlay);

    const syncOverlay = () => {
        const rect = canvas.getBoundingClientRect();
        overlay.width = canvas.width;
        overlay.height = canvas.height;
        overlay.style.width = rect.width + 'px';
        overlay.style.height = rect.height + 'px';
    };

    syncOverlay();
    const ro = new ResizeObserver(() => syncOverlay());
    ro.observe(canvas);

    const originalCursor = canvas.style.cursor;
    canvas.style.cursor = 'crosshair';

    // 2. Event Listener logic (extracted to named functions)
    const handleMouseMove = (e) => {
        const rect = canvas.getBoundingClientRect();
        
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;

        const mathX = ((mouseX - canvas.width / 2) / scale).toFixed(2);
        const mathY = ((canvas.height / 2 - mouseY) / scale).toFixed(2);

        // Best practice: Clear, then save/restore context state
        oCtx.clearRect(0, 0, overlay.width, overlay.height);
        oCtx.save();

        // Draw Crosshairs
        oCtx.strokeStyle = color;
        oCtx.setLineDash([2, 2]);
        oCtx.globalAlpha = 0.4;
        oCtx.beginPath();
        oCtx.moveTo(mouseX, 0); oCtx.lineTo(mouseX, canvas.height);
        oCtx.moveTo(0, mouseY); oCtx.lineTo(canvas.width, mouseY);
        oCtx.stroke();

        // Draw Coordinate Text
        oCtx.globalAlpha = 1.0;
        oCtx.fillStyle = color;
        oCtx.font = font;
        
        const textOffset = 4;
        let textX = mouseX + textOffset;
        let textY = mouseY - textOffset;
        
        if (textX > canvas.width - 80) textX = mouseX - 85;
        if (textY < 20) textY = mouseY + 20;

        oCtx.fillText(`(${mathX}, ${mathY})`, textX, textY);
        oCtx.restore();
    };

    const handleMouseLeave = () => {
        oCtx.clearRect(0, 0, overlay.width, overlay.height);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // 3. Return a Cleanup Function
    return () => {
        ro.disconnect();
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
        canvas.style.cursor = originalCursor;
        if (wrapper.contains(overlay)) {
            wrapper.removeChild(overlay);
        }
        delete canvas.dataset.hasCoordinates;
    };
};

