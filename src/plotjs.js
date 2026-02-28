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
    
        drawTrig: (config) => {
    
            // configuration with default values
    
            const {
                formulaStr, // input as string
                canvas: existingCanvas,
                width = 500,
                height = 250,
                lineColor = 'white',
                lineWidth = 2,
                bgColor = 'black',
                xRange,
                yRange,
                scale = 50
            } = config;
    
            if(!formulaStr) {
                console.error("1) plotjs Error: parameter formula must be passed to draw the graph")
                return null;
            }
    
            const formula = Plotjs._createFormula(formulaStr, ['x', 't']);

            if(!formula) {
                return null;
            }
    
            // create canvas object and context
    
            const canvas = existingCanvas || document.createElement('canvas');
            if (!existingCanvas) {
                canvas.width = width;
                canvas.height = height;
                canvas.style.backgroundColor = bgColor;
            }
            const ctx = canvas.getContext('2d');
    
            const points = Plotjs._generatePoints({
                formula: (x) => formula(x, config.t || 0),
                width: canvas.width,
                height: canvas.height,
                scale,
                xRange,
                yRange
            })
    
            Plotjs._drawGraph(points, ctx, { lineColor, 
                lineWidth: config.lineWidth || 2 });
            return canvas;
        },
    
        // Method 2: graw graph from points
    
        _drawGraph: (points, ctx, config) => {
            const {lineColor = 'white', lineWidth = 2}  = config;
            ctx.strokeStyle = lineColor
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
    
            // Draw the graph by connecting the points, handling discontinuities by breaking the path when a null point is encountered
    
            let currentSegment = []
            for (const point of points) {
                if (point) {
                    currentSegment.push(point);
                } else {
                    if (currentSegment.length>1) {
                        currentSegment.forEach((p, i) => {
                            if (i===0) ctx.moveTo(p.x, p.y);
                            else ctx.lineTo(p.x, p.y)
                        })
                    }
                    currentSegment = [];
                }
            }
    
            // Draw the last segment if it exists
    
            if (currentSegment.length>1) {
                currentSegment.forEach((p, i) => {
                    if (i===0) ctx.moveTo(p.x, p.y);
                    else ctx.lineTo(p.x, p.y)
                })
            }
            ctx.stroke();
        },
    
        // Method 3: Generate points for the graph respective to the function
    
        _generatePoints: (config) => {
    
            // configuration with default values
    
            const {
                formula,
                width,
                height,
                scale = 50,
                xRange,
                yRange
            } = config;
            const points = []
            const midX = width/2
            const midY = height/2
    
            // Generate points for the graph by evaluating the formula at regular intervals across the width of the canvas
            // handle cases where the formula returns non-finite values (like infinity or NaN) by inserting nulls to indicate discontinuities in the graph
    
            if (xRange && (!Array.isArray(xRange) || xRange.length !== 2)) {
                console.error("5) plotjs error: xRange must be an array of exactly two elements (e.g., [minX, maxX]). Received:", xRange);
                return null;
            }
    
            if (yRange && (!Array.isArray(yRange) || yRange.length !== 2)) {
                console.error("5) plotjs error: yRange must be an array of exactly two elements (e.g., [minY, maxY]). Received:", yRange);
                return null;
            }
    
            for (let px = 0; px <= width; px++) {
                
                let x
                if(xRange) {
                    
                    const [minX, maxX] = xRange
                    x = minX + (px / width) * (maxX - minX)
    
                } else {
                    x = (px - midX) / scale
                }
    
                let y = formula(x)
                if (y !== null && Number.isFinite(y)) {
                    let py
                    if(yRange) {
    
                        
                        const [minY, maxY] = yRange;
                        py = height - ((y - minY) / (maxY - minY)) * height;
    
                    } else {
                        py = midY - (y * scale)
                    }
                    points.push({
                        x: px,
                        y: py
                    })
                } else {
                    points.push(null)
                }
            }
            return points;
        },
    
        // Method 4: Draw axis on the canvas
    
        drawAxis: (ctx, width, height) => {
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
        },
    
        // Method 5: Draw grid on the canvas
    
        drawGrid: (
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
        },
    
        // Method 6: add text on the canvas
    
        addText: (
            ctx, 
            text, 
            x, y, 
            font = '16px Arial', 
            color = 'white'
        ) => {
                ctx.font = font;
                ctx.fillStyle = color;
                ctx.fillText(text, x, y);
        },
    
        // method 7: draw polar graph
    
        drawPolar: (config) => {
            const {
                formulaStr,
                width = 500,
                height = 500,
                lineColor = 'white',
                lineWidth = 2,
                bgColor = 'black',
                scale = 50,
                tRange = [0, 2 * Math.PI],
                steps = 1000
            } = config;
    
            if(!formulaStr) {
                console.error("1) plotjs Error: parameter formula must be passed to draw the graph")
                return null;
            }
    
            const formula = Plotjs._createFormula(formulaStr, ['t']);

            if(!formula) {
                return null;
            }
    
            // create canvas object and context
    
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            canvas.style.backgroundColor = bgColor
            const ctx = canvas.getContext('2d');
    
            const points = []
            const midX = width / 2
            const midY = height / 2
            const[tMin, tMax] = tRange
    
            for(let i = 0; i <= steps;  i++) {
                let t = tMin + (i / steps) * (tMax - tMin)
                let r = formula(t);
    
                if(r !== null) {
                    let x = r * Math.cos(t) * scale + midX
                    let y = midY - r * Math.sin(t) * scale // inverted y-axis for canvas
                    points.push({x, y})
                } else {
                    points.push(null)
                }
            }
    
            Plotjs._drawGraph(points, ctx, { lineColor, lineWidth });
            return canvas;
    
        },
    
        drawParametric: (config) => {
            const {
                formulaXStr,
                formulaYStr,
                width = 500,
                height = 500,
                lineColor = 'white',
                lineWidth = 2,
                bgColor = 'black',
                scale = 50,
                tRange = [0, 2 * Math.PI],
                steps = 1000
            } = config;
    
            if(!formulaXStr || !formulaYStr) {
                console.error("1) plotjs Error: parameter formulaXStr and formulaYStr must be passed to draw the graph")
                return null;
            }
    
            const fX = Plotjs._createFormula(formulaXStr, ['t']);
            const fY = Plotjs._createFormula(formulaYStr, ['t']);
    
            if(!fX || !fY) {
                console.error("4) Plotjs Error: Both formulaXStr and formulaYStr must be valid formulas.");
                return null;
            }
    
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            canvas.style.backgroundColor = bgColor
            const ctx = canvas.getContext('2d');
    
            const points = []
            const midX = width / 2
            const midY = height / 2
            const[tMin, tMax] = tRange
    
            for(let i = 0; i <= steps; i++) {
                const t = tMin + (i/steps) * (tMax - tMin)
                const xVal = fX(t);
                const yVal = fY(t);
    
                if(xVal !== null && yVal !== null) {
                    points.push({
                        x: midX + (xVal * scale),
                        y: midY - (yVal * scale) // inverted y-axis for canvas
                    })
                } else {
                    points.push(null)
                }
            }
    
            Plotjs._drawGraph(points, ctx, { lineColor, lineWidth });
            return canvas;
        },
    
        // Method 9: loop animate the graph for a given formula
    
        loopAnimate: (config) => {
            const {
                formulaStr,
                canvas: existingCanvas,
                width = 500,
                height = 250,
                lineColor = 'white',
                lineWidth = 2,
                bgColor = 'black',
                scale = 50,
                xRange,
                yRange,
                duration = Infinity,
                speed = 1,
                showAxis = true,
                showGrid = true
            } = config;
    
            if (!formulaStr) {
                console.error("Plotjs Error: parameter formulaStr must be passed to animate the graph");
                return null;
            }
    
            const formula = Plotjs._createFormula(formulaStr, ['x', 't']);

            if(!formula) {
                return null;
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
    
                if (showGrid) Plotjs.drawGrid(ctx, canvas.width, canvas.height, 50);
                if (showAxis) Plotjs.drawAxis(ctx, canvas.width, canvas.height);
    
                const points = Plotjs._generatePoints({
                    formula: (x) => formula(x, t),
                    width: canvas.width,
                    height: canvas.height,
                    scale,
                    xRange,
                    yRange
                });
    
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