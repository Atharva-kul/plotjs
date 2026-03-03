

document.addEventListener('DOMContentLoaded', () => {
    const graphContainer = document.getElementById('graph-container');

    // Example 1: Sine wave
    const sineCanvas = Plotjs.drawCartesian({
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
        Plotjs.drawAxis(sineCanvas.getContext('2d'), 900, 300);
        Plotjs.loopAnimate({
            formulaStr: 'sin(x^2 - t) - log(x)',
            canvas: sineCanvas,
            lineColor: '#61dafb',
            speed: 2.5
        });
    }

    // Example 2: Cosine wave
    const cosineCanvas = Plotjs.drawCartesian({
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
        Plotjs.loopAnimate({
            formulaStr: 'cos(x + t)',
            canvas: cosineCanvas,
            lineColor: '#ff69b4',
            scale: 50,
            speed: 2
        });
    }

    // Example 3: A more complex function (e.g., x^2)
    const complexCanvas = Plotjs.drawCartesian({
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
        Plotjs.drawAxis(complexCanvas.getContext('2d'), 600, 300);
        Plotjs.drawGrid(complexCanvas.getContext('2d'), 600, 300, 50);
    }

    const polar = Plotjs.drawPolar({
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

        Plotjs.addText(polar.getContext('2d'), 'polar curve', 10, 20, '16px Arial', '#ff6347');
        Plotjs.drawAxis(polar.getContext('2d'), 600, 600);
        Plotjs.drawGrid(polar. getContext('2d'), 600, 600, 50);
    
    }

    const parametric = Plotjs.drawParametric({
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
        Plotjs.addText(ctx, 'parametric curve', 10, 20, '16px Arial', '#47ff56');
        Plotjs.drawAxis(ctx, 600, 600);
        Plotjs.drawGrid(ctx, 600, 600, 50);

        // --- Use findRoots to identify intersections directly with strings ---
        // Find where Y = 0 (x-axis intersections) and X = 0 (y-axis intersections)
        const rootsX = Plotjs.findRoots('3 * sin(x) - 2 * sin(3 * x)', [0, 2 * Math.PI]); // Roots of Y
        const rootsY = Plotjs.findRoots('3 * cos(x) + 2 * cos(3 * x)', [0, 2 * Math.PI]); // Roots of X

        // Helpers for plotting the found t-values
        const fX = Plotjs._createFormula('3 * cos(x) + 2 * cos(3 * x)', ['x', 't']);
        const fY = Plotjs._createFormula('3 * sin(x) - 2 * sin(3 * x)', ['x', 't']);
        const centerX = 300, centerY = 300, scale = 50;

        // Mark X-axis intersections (Roots of Y)
        ctx.fillStyle = '#ff4747'; // Red for x-intercepts
        rootsX.xRoots.forEach(tValue => {
            const x = centerX + fX(tValue, 0) * scale;
            const y = centerY; 
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();
        });

        // Mark Y-axis intersections (Roots of X)
        ctx.fillStyle = '#4775ff'; // Blue for y-intercepts
        rootsY.xRoots.forEach(tValue => {
            const x = centerX;
            const y = centerY - fY(tValue, 0) * scale;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();
        });

        console.log("Parametric Roots Found:", { rootsX, rootsY });
    }

    const ArgandPlane = Plotjs.drawComplex({
        formulaStr: '3 * (cos(x) + i * sin(x)) + 1.5 * (cos(4 * x) - i * sin(4 * x))',
        width: 600,
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
        Plotjs.drawAxis(ctx, 600, 600)
        Plotjs.drawGrid(ctx, 600, 600, 50)

        // --- Find where the complex curve hits the axes ---
        const formulaStr = '3 * (cos(x) + i * sin(x)) + 1.5 * (cos(4 * x) - i * sin(4 * x))';
        const roots = Plotjs.findRoots(formulaStr, [0, 2 * Math.PI]);

        const f = Plotjs._createFormula(formulaStr, ['x', 't'], { complex: true });
        const centerX = 300, centerY = 300, scale = 60;

        // xRoots in Complex Mode: Points where the curve hits the REAL axis (Im = 0)
        ctx.fillStyle = '#ff00ff'; // Magenta for Real axis hits
        roots.xRoots.forEach(t => {
            const val = f(t, 0);
            const x = centerX + val.re * scale;
            const y = centerY - val.im * scale;
            ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
        });

        // iotaRoots in Complex Mode: Points where the curve hits the IMAGINARY axis (Re = 0)
        ctx.fillStyle = '#ffff00'; // Yellow for Imaginary axis hits
        roots.iotaRoots.forEach(t => {
            const val = f(t, 0);
            const x = centerX + val.re * scale;
            const y = centerY - val.im * scale;
            ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
        });

        console.log("Complex Axis Intersections (t-values):", roots);
    }

    // --- NEW: High-Complexity Multi-Harmonic Graph ---
    const ComplexLace = Plotjs.drawComplex({
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
        Plotjs.drawAxis(ctx, 700, 700)
        Plotjs.drawGrid(ctx, 700, 700, 50)

        // --- Find where the high-frequency lace hits the axes ---
        const formulaStr = '2.5 * (cos(x) + i * sin(x)) + 1.2 * (cos(5*x) + i * sin(5*x)) + 0.6 * (cos(13*x) - i * sin(13*x)) + 0.3 * (cos(23*x) + i * sin(23*x))';
        const roots = Plotjs.findRoots(formulaStr, [0, 2 * Math.PI], 5000); // Higher steps for higher frequencies

        const f = Plotjs._createFormula(formulaStr, ['x', 't'], { complex: true });
        const centerX = 350, centerY = 350, scale = 70;

        // Mark REAL axis crossings (Im = 0)
        ctx.fillStyle = '#ff00ff'; 
        roots.xRoots.forEach(t => {
            const val = f(t, 0);
            const x = centerX + val.re * scale;
            const y = centerY - val.im * scale;
            ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
        });

        // Mark IMAGINARY axis crossings (Re = 0)
        ctx.fillStyle = '#ffff00'; 
        roots.iotaRoots.forEach(t => {
            const val = f(t, 0);
            const x = centerX + val.re * scale;
            const y = centerY - val.im * scale;
            ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
        });

        console.log("Complex Lace Intersections:", roots);
    }
});