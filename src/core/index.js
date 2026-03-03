import { _createFormula } from './math.js';
import { _generateCartesianPoints, _generatePolarPoints, _generateParametricPoints, _generateComplexPoints } from './generator.js';
import { _drawGraph } from './drawer.js';
import { drawAxis, drawGrid, addText, findRoots } from './enhancer.js';

export function createPlotjs(adapter) {
    const { createCanvas, requestAnimationFrame, cancelAnimationFrame } = adapter;

    return {
        createCanvas,
        _createFormula,
        _generateCartesianPoints,
        _generatePolarPoints,
        _generateParametricPoints,
        _drawGraph,
        drawAxis,
        drawGrid,
        addText,
        findRoots,

        drawCartesian: (config) => {
            const {
                formulaStr,
                canvas: existingCanvas,
                width = 500,
                height = 250,
                lineColor = 'white',
                lineWidth = 2,
                bgColor = 'black',
                xRange,
                yRange,
                scale = 50,
                t = 0
            } = config;
    
            if(!formulaStr) {
                console.error("Plotjs Error: parameter formulaStr must be passed to draw the graph");
                return null;
            }
    
            const formula = _createFormula(formulaStr, ['x', 't']);
            if(!formula) return null;
    
            const canvas = existingCanvas || createCanvas(width, height);
            if (!existingCanvas && canvas.style) {
                canvas.style.backgroundColor = bgColor;
            }
            const ctx = canvas.getContext('2d');
    
            const points = _generateCartesianPoints({
                formula, width: canvas.width || width, height: canvas.height || height, scale, xRange, yRange, t
            });
    
            _drawGraph(points, ctx, { lineColor, lineWidth });
            return canvas;
        },

        drawPolar: (config) => {
            const {
                formulaStr,
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
    
            if(!formulaStr) {
                console.error("Plotjs Error: parameter formulaStr must be passed");
                return null;
            }
    
            const formula = _createFormula(formulaStr, ['x', 't']);
            if(!formula) return null;
    
            const canvas = existingCanvas || createCanvas(width, height);
            if (!existingCanvas && canvas.style) {
                canvas.style.backgroundColor = bgColor;
            }
            const ctx = canvas.getContext('2d');
    
            const points = _generatePolarPoints({
                formula, width: canvas.width || width, height: canvas.height || height, scale, tRange, steps, t
            });
    
            _drawGraph(points, ctx, { lineColor, lineWidth });
            return canvas;
        },
    
        drawParametric: (config) => {
            const {
                formulaXStr,
                formulaYStr,
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
    
            if(!formulaXStr || !formulaYStr) {
                console.error("Plotjs Error: parameter formulaXStr and formulaYStr must be passed");
                return null;
            }
    
            const fX = _createFormula(formulaXStr, ['x', 't']);
            const fY = _createFormula(formulaYStr, ['x', 't']);
    
            if(!fX || !fY) return null;
    
            const canvas = existingCanvas || createCanvas(width, height);
            if (!existingCanvas && canvas.style) {
                canvas.style.backgroundColor = bgColor;
            }
            const ctx = canvas.getContext('2d');
    
            const points = _generateParametricPoints({
                fX, fY, width: canvas.width || width, height: canvas.height || height, scale, tRange, steps, t
            });
    
            _drawGraph(points, ctx, { lineColor, lineWidth });
            return canvas;
        },

        drawComplex: (config) => {
            const {
                formulaStr,
                canvas: existingCanvas,
                width = 500,
                height = 500,
                lineColor = 'white',
                lineWidth = 2,
                bgColor = 'black',
                scale = 50,
                xRange = [-10, 10],
                steps = 1000,
                t = 0
            } = config;

            if(!formulaStr) {
                console.error("PlotJs Error: parameter formulaStr must be passed")
                return null
            }

            const formula = _createFormula(formulaStr, ['x', 't'], {
                complex: true
            })

            if(!formula) return null

            const canvas = existingCanvas || createCanvas(width, height)
            if(!existingCanvas && canvas.style) {
                canvas.style.backgroundColor = bgColor
            }

            const ctx = canvas.getContext('2d')

            const points = _generateComplexPoints({
                formula, width: canvas.width || width, height:  canvas.height || height, scale, xRange, steps, t
            })

            _drawGraph(points, ctx, {lineColor, lineWidth})
            return canvas

        },
    
        loopAnimate: (config) => {
            const {
                type = 'cartesian', // 'cartesian', 'polar', 'parametric'
                formulaStr,
                formulaXStr,
                formulaYStr,
                canvas: existingCanvas,
                width = 500,
                height = 250,
                lineColor = 'white',
                lineWidth = 2,
                bgColor = 'black',
                scale = 50,
                xRange,
                yRange,
                tRange,
                steps,
                duration = Infinity,
                speed = 1,
                showAxis = true,
                showGrid = true
            } = config;
    
            let formula, fX, fY;
            if (type === 'parametric') {
                fX = _createFormula(formulaXStr, ['x', 't']);
                fY = _createFormula(formulaYStr, ['x', 't']);
                if (!fX || !fY) return null;
            } else {
                if (!formulaStr) {
                    console.error("Plotjs Error: formulaStr required for " + type);
                    return null;
                }
                formula = _createFormula(formulaStr, ['x', 't']);
                if (!formula) return null;
            }
    
            const canvas = existingCanvas || createCanvas(width, height);
            if (!existingCanvas && canvas.style) {
                canvas.style.backgroundColor = bgColor;
            }
            const ctx = canvas.getContext('2d');
            const cw = canvas.width || width;
            const ch = canvas.height || height;
    
            let startTime = null;
            let animationId = null;
    
            const renderFrame = (timeStamp) => {
                if (!startTime) startTime = timeStamp;
                const elapsed = timeStamp - startTime;
    
                if (elapsed > duration) {
                    cancelAnimationFrame(animationId);
                    return;
                }
    
                const t = (elapsed / 1000) * speed;
                ctx.clearRect(0, 0, cw, ch);
    
                if (showGrid) drawGrid(ctx, cw, ch, 50);
                if (showAxis) drawAxis(ctx, cw, ch);
    
                let points;
                const genConfig = { ...config, width: cw, height: ch, t };

                if (type === 'polar') {
                    points = _generatePolarPoints({ formula, ...genConfig });
                } else if (type === 'parametric') {
                    points = _generateParametricPoints({ fX, fY, ...genConfig });
                } else {
                    points = _generateCartesianPoints({ formula, ...genConfig });
                }
    
                _drawGraph(points, ctx, { lineColor, lineWidth });
                animationId = requestAnimationFrame(renderFrame);
            };
    
            animationId = requestAnimationFrame(renderFrame);
    
            return {
                canvas,
                stop: () => cancelAnimationFrame(animationId),
                play: () => {
                    cancelAnimationFrame(animationId);
                    startTime = null;
                    animationId = requestAnimationFrame(renderFrame);
                }
            };
        }
    };
}