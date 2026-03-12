

document.addEventListener('DOMContentLoaded', () => {
    const graphContainer = document.getElementById('graph-container');

    // Example 1: Sine wave
    const sineCanvas = Graphlyjs.drawCartesian({
        formulaStr: 'sin(x^2) - log(x)',
        width: 900,
        height: 300,
        lineColor: '#61dafb',
        bgColor: '#01050f',
        scale: 50, // Adjust scale for better visualization if needed
        //xRange: [-1, 25], // Optional: specify x range for better control
        //yRange: [-5, 5] // Optional: specify y range for better control
    });

    if (sineCanvas) {
        const h2 = document.createElement('h2');
        h2.textContent = 'y = sin(x^2) - log(x)';
        graphContainer.appendChild(h2);
        graphContainer.appendChild(sineCanvas);
        Graphlyjs.drawAxis(sineCanvas.getContext('2d'));
        Graphlyjs.loopAnimate({
            formulaStr: 'sin(x^2 - t) - log(x)',
            canvas: sineCanvas,
            lineColor: '#61dafb',
            speed: 2.5
        });
    }

    // Example 2: Cosine wave
    const cosineCanvas = Graphlyjs.drawCartesian({
        formulaStr: 'cos(x + t)',
        width: 900,
        height: 300,
        lineColor: '#ff69b4',
        bgColor: '#01050f',
        scale: 50
    });

    if (cosineCanvas) {
        const h2 = document.createElement('h2');
        h2.textContent = 'y = cos(x + t)';
        graphContainer.appendChild(h2);
        graphContainer.appendChild(cosineCanvas);
        Graphlyjs.loopAnimate({
            formulaStr: 'cos(x + t)',
            canvas: cosineCanvas,
            lineColor: '#ff69b4',
            scale: 50,
            speed: 2
        });
    }

    // Example 3: A more complex function (e.g., x^2)
    const complexCanvas = Graphlyjs.drawCartesian({
        formulaStr: 'x^2',
        width: 600,
        height: 300,
        lineColor: '#d97e7e',
        bgColor: '#01050f',
        scale: 50
    });

    if (complexCanvas) {
        const h2 = document.createElement('h2');
        h2.textContent = 'y = x^2';
        graphContainer.appendChild(h2);
        graphContainer.appendChild(complexCanvas);
        Graphlyjs.drawAxis(complexCanvas.getContext('2d'));
        Graphlyjs.drawGrid(complexCanvas.getContext('2d'));
    }

    const polar = Graphlyjs.drawPolar({
        formulaStr: '2 + sin(5 * x)',
        width: 600,
        height: 600,
        lineColor: '#ff6347',
        bgColor: '#01050f',
        scale: 50

    })

    if(polar) {
        const h2 = document.createElement('h2')
        h2.textContent = 'Polar Curve: r = 2 + sin(5theta)'
        graphContainer.appendChild(h2)
        graphContainer.appendChild(polar)

        Graphlyjs.addText(polar.getContext('2d'), 'polar curve', { point: [4, 4], font: '16px Arial', color: '#ff6347' });
        Graphlyjs.drawAxis(polar.getContext('2d'));
        Graphlyjs.drawGrid(polar.getContext('2d'));
    
    }

    const parametric = Graphlyjs.drawParametric({
        formulaXStr: '3 * cos(x) + 2 * cos(3 * x)',
        formulaYStr: '3 * sin(x) - 2 * sin(3 * x)',
        width: 600,
        height: 600,
        lineColor: '#47ff56',
        bgColor: '#01050f',
        scale: 50
    })

    if(parametric) {
        const h2 = document.createElement('h2')
        h2.textContent = 'parametric Curve: x = 3cos(t) + 2cos(3t), y = 3sin(t) - 2sin(3t)'
        graphContainer.appendChild(h2)
        graphContainer.appendChild(parametric)

        const ctx = parametric.getContext('2d');
        Graphlyjs.addText(ctx, 'parametric curve', { point: [-4, 4], font: '16px Arial', color: '#47ff56' });
        Graphlyjs.drawAxis(ctx);
        Graphlyjs.drawGrid(ctx);

        // --- Use findRoots & drawRoots without manual compilation ---
        const rootsX = Graphlyjs.findRoots('3 * sin(x) - 2 * sin(3 * x)', [0, 2 * Math.PI]); // Roots of Y
        const rootsY = Graphlyjs.findRoots('3 * cos(x) + 2 * cos(3 * x)', [0, 2 * Math.PI]); // Roots of X

        Graphlyjs.drawRoots(ctx, rootsX, { 
            type: 'parametric', 
            formulaX: '3 * cos(x) + 2 * cos(3 * x)', 
            scale: 50, xColor: '#ff4747' 
        });

        Graphlyjs.drawRoots(ctx, rootsY, { 
            type: 'parametric', 
            formulaY: '3 * sin(x) - 2 * sin(3 * x)', 
            scale: 50, yColor: '#4775ff' 
        });
    }

    const ArgandPlane = Graphlyjs.drawComplex({
        formulaStr: '3 * (cos(x) + i * sin(x)) + 1.5 * (cos(4 * x) - i * sin(4 * x))',
        width: 900,
        height: 600,
        lineColor: '#00ffff',
        bgColor: '#01050f',
        scale: 60,
        xRange: [0, 2 * Math.PI],
        steps: 2000
    })

    if(ArgandPlane) {
        const h2 = document.createElement('h2')
        h2.textContent = 'Complex Spirograph: 3*(cos(x) + i*sin(x)) + 1.5*(cos(4x) - i*sin(4x))'
        graphContainer.appendChild(h2)
        graphContainer.appendChild(ArgandPlane)

        const ctx = ArgandPlane.getContext('2d');
        Graphlyjs.drawAxis(ctx)
        Graphlyjs.drawGrid(ctx)

        // --- Simplified Complex Roots ---
        const formulaStr = '3 * (cos(x) + i * sin(x)) + 1.5 * (cos(4 * x) - i * sin(4 * x))';
        const roots = Graphlyjs.findRoots(formulaStr, [0, 2 * Math.PI]);

        Graphlyjs.drawRoots(ctx, roots, {
            type: 'complex',
            formula: formulaStr,
            scale: 60,
            xColor: '#ff00ff', iotaColor: '#ffff00'
        });

        Graphlyjs.showCoordinates(ArgandPlane, { scale: 60, color: '#00ffff' });
    }

    // --- NEW: High-Complexity Multi-Harmonic Graph ---
    const ComplexLace = Graphlyjs.drawComplex({
        // 4 layers of rotating vectors with increasing frequencies
        formulaStr: '2.5 * (cos(x) + i * sin(x)) + 1.2 * (cos(5*x) + i * sin(5*x)) + 0.6 * (cos(13*x) - i * sin(13*x)) + 0.3 * (cos(23*x) + i * sin(23*x))',
        width: 700,
        height: 700,
        lineColor: '#ff00ff', // Neon Magenta
        bgColor: '#01050f',
        scale: 70,
        xRange: [0, 2 * Math.PI],
        steps: 5000 // Increased steps to capture the high-frequency detail
    })

    if(ComplexLace) {
        const h2 = document.createElement('h2')
        h2.textContent = 'Complex Lace (4-Harmonic Fourier Series)'
        graphContainer.appendChild(h2)
        graphContainer.appendChild(ComplexLace)

        const ctx = ComplexLace.getContext('2d');
        Graphlyjs.drawAxis(ctx)
        Graphlyjs.drawGrid(ctx)

        // --- Simplified Lace Roots ---
        const formulaStr = '2.5 * (cos(x) + i * sin(x)) + 1.2 * (cos(5*x) + i * sin(5*x)) + 0.6 * (cos(13*x) - i * sin(13*x)) + 0.3 * (cos(23*x) + i * sin(23*x))';
        const roots = Graphlyjs.findRoots(formulaStr, [0, 2 * Math.PI], 5000);
        
        Graphlyjs.drawRoots(ctx, roots, {
            type: 'complex',
            formula: formulaStr,
            scale: 70,
            xColor: '#ff00ff', iotaColor: '#ffff00',
            radius: 3
        });
    }
});