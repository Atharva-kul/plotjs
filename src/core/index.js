import { _createFormula } from './math.js';
import { _generateCartesianPoints, _generatePolarPoints, _generateParametricPoints, _generateComplexPoints } from './generator.js';
import { _drawGraph, _drawGraphWebGL, _drawGraphGPUEvaluated } from './drawer.js';
import { drawAxis, drawGrid, addText, findRoots, drawRoots, findExtrema, drawExtrema } from './enhancer.js';

export function createPlotjs(adapter) {
    const { createCanvas, requestAnimationFrame, cancelAnimationFrame } = adapter;

    return {
        createCanvas,
        _createFormula,
        _generateCartesianPoints,
        _generatePolarPoints,
        _generateParametricPoints,
        _generateComplexPoints,
        _drawGraph,
        _drawGraphWebGL,
        _drawGraphGPUEvaluated,
        drawAxis,
        drawGrid,
        addText,
        findRoots,
        drawRoots,
        findExtrema,
        drawExtrema,

        //Method 1: draaw Cartesian graph

        drawCartesian: (config) => {
            const { formulaStr, 
                canvas: existingCanvas, 
                width = 500, height = 250, 
                lineColor = 'white', 
                lineWidth = 2, 
                bgColor = 'black', 
                xRange, yRange, 
                scale = 50, 
                t = 0 
            } = config;

            // error log 1: if formula string is missing
            if(!formulaStr) {
                console.error("1. PlotJs error: formula string required")
                return null
            };


            //convert string fromula in actuaal formula
            const formula = _createFormula(formulaStr, ['x', 't']);

            // error log 2: if there is problem in converting string into formula
            if(!formula) {
                console.error("2. PlotJs error: there was problem in converting formula string into actual formula")    
                return null
            };

            // create canvas or use existing one
            const canvas = existingCanvas || createCanvas(width, height);

            if (!existingCanvas && canvas.style) {
                canvas.style.backgroundColor = bgColor
            };

            const ctx = canvas.getContext('2d');

            const points = _generateCartesianPoints({ 
                formula, 
                width: canvas.width || width,
                height: canvas.height || height, 
                scale, 
                xRange, yRange, 
                t 
            });

            _drawGraph(
                points, 
                ctx, 
                { lineColor, lineWidth });

            return canvas;
        },

        drawPolar: (config) => {
            const { 
                formulaStr, 
                canvas: existingCanvas, 
                width = 500, height = 500, 
                lineColor = 'white', lineWidth = 2, 
                bgColor = 'black', 
                scale = 50, 
                tRange = [0, 2 * Math.PI], 
                steps = 1000, 
                t = 0 
            
            } = config;

            // error log 1: if formula string is missing
            if(!formulaStr) {
                console.error("1. PlotJs error: formula string required")
                return null
            };

            const formula = _createFormula(formulaStr, ['x', 't']);


            // error log 2: if there is problem in converting string into formula
            if(!formula) {
                console.error("2. PlotJs error: there was problem in converting formula string into actual formula")    
                return null
            };

            const canvas = existingCanvas || createCanvas(width, height);

            if (!existingCanvas && canvas.style) {
                canvas.style.backgroundColor = bgColor
            };

            const ctx = canvas.getContext('2d');

            const points = _generatePolarPoints({ 
                formula, 
                width: canvas.width || width, 
                height: canvas.height || height, 
                scale, 
                tRange, 
                steps, 
                t 
            });

            _drawGraph(points, 
                ctx, 
                { lineColor, lineWidth });

            return canvas;
        },
    
        drawParametric: (config) => {
            const { 
                formulaXStr, formulaYStr, 
                canvas: existingCanvas, 
                width = 500, 
                height = 500, 
                lineColor = 'white', 
                lineWidth = 2, 
                bgColor = 'black', 
                scale = 50, 
                tRange = [0, 2 * Math.PI], 
                steps = 1000, 
                t = 0 
            } = config;

            // error log 1: if formula string is missing
            if(!formulaXStr || !formulaYStr) {
                console.error("1. PlotJs error: formula string required")
                return null
            };

            const fX = _createFormula(formulaXStr, ['x', 't'])
            const fY = _createFormula(formulaYStr, ['x', 't']);

            // error log 2: if there is problem in converting string into formula
            if(!fX || !fY) {
                console.error("2. PlotJs error: there was problem in converting formula string into actual formula")    
                return null
            };
                
            const canvas = existingCanvas || createCanvas(width, height);

            if (!existingCanvas && canvas.style) {
                canvas.style.backgroundColor = bgColor
            };

            const ctx = canvas.getContext('2d');

            const points = _generateParametricPoints({ 
                fX, fY, 
                width: canvas.width || width, 
                height: canvas.height || height, 
                scale, 
                tRange, 
                steps, 
                t 
            });

            _drawGraph(points, ctx, { lineColor, lineWidth });
            return canvas;
        },

        drawComplex: (config) => {
            const { formulaStr, 
                canvas: existingCanvas, 
                width = 500, height = 500, 
                lineColor = 'white', 
                lineWidth = 2, 
                bgColor = 'black', 
                scale = 50, 
                xRange = [-10, 10], 
                steps = 1000, 
                t = 0 
            } = config;

            // error log 1: if formula string is missing
            if(!formulaStr) {
                console.error("1. PlotJs error: formula string required")
                return null
            };

            const formula = _createFormula(
                formulaStr, 
                ['x', 't'], 
                { complex: true }
            );

            // error log 2: if there is problem in converting string into formula
            if(!formula) {
                console.error("2. PlotJs error: there was problem in converting formula string into actual formula")    
                return null
            };

            const canvas = existingCanvas || createCanvas(width, height);

            if(!existingCanvas && canvas.style) {
                canvas.style.backgroundColor = bgColor
            };

            const ctx = canvas.getContext('2d');

            const points = _generateComplexPoints({ 
                formula, 
                width: canvas.width || width, 
                height:  canvas.height || height, 
                scale, 
                xRange, 
                steps, 
                t 
            });
            
            _drawGraph(points, ctx, {lineColor, lineWidth});
            return canvas;
        },
    
        loopAnimate: (config) => {
            const { layers = [], canvas: existingCanvas, width = 500, height = 500, bgColor = 'black', scale = 50, duration = Infinity, showAxis = true, showGrid = true, gpu = false } = config;
            const animationLayers = layers.length > 0 ? layers : [config];
            const canvas = existingCanvas || createCanvas(width, height);
            const cw = canvas.width || width, ch = canvas.height || height;

            let uiCanvas = null, uiCtx = null;
            if (gpu) {
                uiCanvas = createCanvas(cw, ch);
                uiCanvas.style.position = 'absolute';
                uiCanvas.style.left = '0'; uiCanvas.style.top = '0';
                uiCanvas.style.pointerEvents = 'none';
                canvas.style.position = 'relative';
                if (canvas.parentElement) {
                    canvas.parentElement.style.position = 'relative';
                    canvas.parentElement.appendChild(uiCanvas);
                }
                uiCtx = uiCanvas.getContext('2d');
            }

            const ctx = gpu ? uiCtx : canvas.getContext('2d');
            if (!existingCanvas && canvas.style) canvas.style.backgroundColor = bgColor;

            const compiledLayers = animationLayers.map(layer => {
                const lType = layer.type || 'cartesian';
                const lSteps = layer.steps || config.steps || 1000;
                const formulaGLSL = _createFormula(layer.formulaStr, ['x', 't'], { glsl: true, complex: true });
                let formula, fX, fY;
                if (lType === 'parametric') {
                    fX = _createFormula(layer.formulaXStr, ['x', 't']);
                    fY = _createFormula(layer.formulaYStr, ['x', 't']);
                } else {
                    const isComplex = lType === 'complex' || (layer.formulaStr && /\b(i)\b/.test(layer.formulaStr));
                    formula = _createFormula(layer.formulaStr, ['x', 't'], { complex: isComplex });
                }
                return { ...layer, type: lType, formula, fX, fY, formulaGLSL, buffer: gpu ? new Float32Array((lSteps + 1) * 2) : null };
            });
    
            let startTime = null, animationId = null;
            const renderFrame = (timeStamp) => {
                if (!startTime) startTime = timeStamp;
                const elapsed = timeStamp - startTime;
                if (elapsed > duration) { cancelAnimationFrame(animationId); return; }
    
                if (gpu) {
                    const gl = canvas.getContext('webgl');
                    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
                    uiCtx.clearRect(0, 0, cw, ch);
                    if (showGrid) drawGrid(uiCtx, cw, ch, 50);
                    if (showAxis) drawAxis(uiCtx, cw, ch);
                } else {
                    ctx.clearRect(0, 0, cw, ch);
                    if (showGrid) drawGrid(ctx, cw, ch, 50);
                    if (showAxis) drawAxis(ctx, cw, ch);
                }
    
                compiledLayers.forEach(layer => {
                    const t = (elapsed / 1000) * (layer.speed || 1);
                    const genConfig = { ...config, ...layer, width: cw, height: ch, t, flat: gpu, buffer: layer.buffer };

                    if (gpu && layer.formulaGLSL && layer.type === 'complex') {
                        _drawGraphGPUEvaluated({
                            formulaGLSL: layer.formulaGLSL, t, steps: layer.steps || 1000, scale: layer.scale || config.scale || 50, lineColor: layer.lineColor || 'white'
                        }, canvas);
                        return;
                    }

                    let points;
                    if (layer.type === 'polar') points = _generatePolarPoints(genConfig);
                    else if (layer.type === 'parametric') points = _generateParametricPoints(genConfig);
                    else if (layer.type === 'complex') points = _generateComplexPoints(genConfig);
                    else points = _generateCartesianPoints(genConfig);
    
                    if (gpu) _drawGraphWebGL(points, canvas, { lineColor: layer.lineColor || 'white', lineWidth: layer.lineWidth || 2 });
                    else _drawGraph(points, ctx, { lineColor: layer.lineColor || 'white', lineWidth: layer.lineWidth || 2 });
                });

                if (config.onFrame) config.onFrame(gpu ? uiCtx : ctx, (elapsed / 1000) * (config.speed || 1));
                animationId = requestAnimationFrame(renderFrame);
            };
            animationId = requestAnimationFrame(renderFrame);
            return { canvas, stop: () => cancelAnimationFrame(animationId) };
        }
    };
}
