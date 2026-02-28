(function(window) {
    const Plotjs = {

        _createFormula: (formulaStr, args) => {
            // 1. Security Check
            const allowedPattern = /^(?:[xt0-9.+\-/*^()\s]|sin|cos|tan|sec|cot|cosec|pow|sqrt|abs|log|PI|E|\^)+$/;
            if (!allowedPattern.test(formulaStr)) {
                console.error(`Plotjs Security Error: The formula "${formulaStr}" contains unauthorized characters.`);
                return null;
            }
        
            try {
                // 2. Prepare the formula body for the new Function
                const processedFormula = formulaStr.replace(/\^/g, '**'); // Use standard exponentiation
                
                const functionBody = `
                    // Make only approved Math functions available in scope
                    const { sin, cos, tan, PI, E, pow, sqrt, abs, log } = Math;
                    
                    // Define custom helper functions
                    const sec = (a) => 1 / cos(a);
                    const cot = (a) => 1 / tan(a);
                    const cosec = (a) => 1 / sin(a);
        
                    // Calculate and return the result
                    const result = ${processedFormula};
                    
                    // Ensure the result is a finite number
                    return Number.isFinite(result) ? result : null;
                `;
        
                // 3. Create and return the function
                return new Function(...args, functionBody);
        
            } catch (error) {
                // 4. Handle any syntax errors
                console.error(`Plotjs Error: The formula "${formulaStr}" is invalid.`);
                return null;
            }
        },

        // Method 1: Trignometric graphs
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
    
            const formula = Plotjs._createFormula(formulaStr, ['x', 't']);
            if(!formula) return null;
    
            const canvas = existingCanvas || document.createElement('canvas');
            if (!existingCanvas) {
                canvas.width = width;
                canvas.height = height;
                canvas.style.backgroundColor = bgColor;
            }
            const ctx = canvas.getContext('2d');
    
            const points = Plotjs._generateCartesianPoints({
                formula, width: canvas.width, height: canvas.height, scale, xRange, yRange, t
            });
    
            Plotjs._drawGraph(points, ctx, { lineColor, lineWidth });
            return canvas;
        },

        // Method 7: draw polar graph
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
    
            const formula = Plotjs._createFormula(formulaStr, ['x', 't']);
            if(!formula) return null;
    
            const canvas = existingCanvas || document.createElement('canvas');
            if (!existingCanvas) {
                canvas.width = width;
                canvas.height = height;
                canvas.style.backgroundColor = bgColor;
            }
            const ctx = canvas.getContext('2d');
    
            const points = Plotjs._generatePolarPoints({
                formula, width: canvas.width, height: canvas.height, scale, tRange, steps, t
            });
    
            Plotjs._drawGraph(points, ctx, { lineColor, lineWidth });
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
    
            const fX = Plotjs._createFormula(formulaXStr, ['x', 't']);
            const fY = Plotjs._createFormula(formulaYStr, ['x', 't']);
    
            if(!fX || !fY) return null;
    
            const canvas = existingCanvas || document.createElement('canvas');
            if (!existingCanvas) {
                canvas.width = width;
                canvas.height = height;
                canvas.style.backgroundColor = bgColor;
            }
            const ctx = canvas.getContext('2d');
    
            const points = Plotjs._generateParametricPoints({
                fX, fY, width: canvas.width, height: canvas.height, scale, tRange, steps, t
            });
    
            Plotjs._drawGraph(points, ctx, { lineColor, lineWidth });
            return canvas;
        },
    
        // Method 9: loop animate the graph for a given formula
        loopAnimate: (config) => {
            const {
                type = 'trig', // 'trig', 'polar', 'parametric'
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
                fX = Plotjs._createFormula(formulaXStr, ['x', 't']);
                fY = Plotjs._createFormula(formulaYStr, ['x', 't']);
                if (!fX || !fY) return null;
            } else {
                if (!formulaStr) {
                    console.error("Plotjs Error: formulaStr required for " + type);
                    return null;
                }
                formula = Plotjs._createFormula(formulaStr, ['x', 't']);
                if (!formula) return null;
            }
    
            const canvas = existingCanvas || document.createElement('canvas');
            if (!existingCanvas) {
                canvas.width = width;
                canvas.height = height;
                canvas.style.backgroundColor = bgColor;
            }
            const ctx = canvas.getContext('2d');
    
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
                ctx.clearRect(0, 0, canvas.width, canvas.height);
    
                if (showGrid && Plotjs.drawGrid) Plotjs.drawGrid(ctx, canvas.width, canvas.height, 50);
                if (showAxis && Plotjs.drawAxis) Plotjs.drawAxis(ctx, canvas.width, canvas.height);
    
                let points;
                const genConfig = { ...config, width: canvas.width, height: canvas.height, t };

                if (type === 'polar') {
                    points = Plotjs._generatePolarPoints({ formula, ...genConfig });
                } else if (type === 'parametric') {
                    points = Plotjs._generateParametricPoints({ fX, fY, ...genConfig });
                } else {
                    points = Plotjs._generateCartesianPoints({ formula, ...genConfig });
                }
    
                Plotjs._drawGraph(points, ctx, { lineColor, lineWidth });
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
    }
    
    window.Plotjs = Plotjs;
    
    })(window);
