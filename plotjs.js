export const Plotjs = {

    // Method 1: Trignometric graphs

    drawTrig: (config) => {

        // configuration with default values

        const {
            formulaStr, // input as string
            unit = 'rad',
            width = 500,
            height = 250,
            lineColor = 'white',
            lineWidth = 2,
            bgColor = 'black'
        } = config;

        if(!formulaStr) {
            console.error("1) plotjs Error: parameter formula must be passed to draw the graph")
            return null;
        }

        // Security check: only allow certain characters and functions in the formula string to prevent malicious code execution

        const allowedPattern = /^(?:[x0-9.+\-/*^()\s]|sin|cos|tan|sec|cot|cosec|pow|sqrt|abs|log|PI)+$/;

        if (!allowedPattern.test(formulaStr)) {
            console.error(`3) Plotjs Security Error [ERR_UNAUTHORIZED_CODE]: The formula "${formulaStr}" contains unauthorized functions, variables, or characters.`);
            return null; 
        }

        // define the formula function using the input string, and handle errors if the formula is invalid

        let formula;
        try {
            const process = formulaStr.replace(/\^/g, '**')

            formula = new Function('x', `
                    const{
                        sin, cos, tan, PI, pow, sqrt, abs, log
                    } = Math;
                    
                    const sec = (a) => 1/cos(a)
                    const cot = (a) => 1/tan(a)
                    const cosec = (a) => 1/sin(a)

                    const result = ${process}

                    return Number.isFinite(result) ? result : null

                `);
            
        }
        catch (error) {
            console.error(`2) plotjs error: formula "${formulaStr} is invalid"`)
            return null;
        }

        // create canvas object and context

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.style.backgroundColor = bgColor
        const ctx = canvas.getContext('2d');

        const points = Plotjs._generatePoints({
            formula,
            width,
            height,
            scale: config.scale || 50
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
                if (i===0) ctx.moveTo(point.x, point.y);
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
            scale = 50
        } = config;
        const points = []
        const midX = width/2
        const midY = height/2

        // Generate points for the graph by evaluating the formula at regular intervals across the width of the canvas
        // handle cases where the formula returns non-finite values (like infinity or NaN) by inserting nulls to indicate discontinuities in the graph

        for (let px = 0; px <= width; px++) {
            const x = (px - midX) / scale
            const y = formula(x)

            if (y !== null && Number.isFinite(y)) {
                const py = midY - (y * scale);
                points.push({x: px, y: py});
            } else {
                
                points.push(null);
            }
        }
        return points
    }

}