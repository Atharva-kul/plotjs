
document.addEventListener('DOMContentLoaded', () => {
    
    // Set timestamp
    setInterval(() => {
        const now = new Date();
        document.getElementById('timestamp').textContent = now.toISOString().replace('T', ' ').substring(0, 19);
    }, 1000);

    const mainContainer = document.getElementById('main-graph');
    const polarContainer = document.getElementById('polar-graph');
    const parametricContainer = document.getElementById('parametric-graph');

    // --- Main Animated Graph (Complex Interference) ---
    // Using a more intricate formula to create a futuristic wave pattern
    const mainFormula = 'sin(x - t) + cos(x * 0.5 + t) + sin(x * 1.5 - t * 0.7)';
    
    const mainCanvas = document.createElement('canvas');
    mainCanvas.width = 900;
    mainCanvas.height = 300;
    mainContainer.appendChild(mainCanvas);

    Plotjs.loopAnimate({
        formulaStr: mainFormula,
        canvas: mainCanvas,
        width: 900,
        height: 300,
        lineColor: '#00f3ff', // neon blue
        lineWidth: 2,
        bgColor: 'transparent',
        scale: 60,
        speed: 1.5,
        showAxis: true,
        showGrid: true
    });

    // --- Side Graph 1: Polar (Intricate Rose Curve) ---
    // Formula for an intricate rose curve
    const polarCanvas = Plotjs.drawPolar({
        formulaStr: '2 * sin(6 * t) + cos(12 * t)',
        width: 600,
        height: 600,
        lineColor: '#ff00ff', // neon magenta
        lineWidth: 1.5,
        bgColor: 'transparent',
        scale: 80, // Increased scale for larger canvas
        tRange: [0, 2 * Math.PI],
        steps: 1200
    });

    if (polarCanvas) {
        polarContainer.appendChild(polarCanvas);
        const ctx = polarCanvas.getContext('2d');
        Plotjs.drawGrid(ctx, 600, 600, 50, 'rgba(0, 243, 255, 0.1)', 0.5);
    }

    // --- Side Graph 2: Parametric (Hypotrochoid) ---
    // A complex parametric curve (spirograph-like)
    const parametricCanvas = Plotjs.drawParametric({
        formulaXStr: '4 * cos(t) + 2 * cos(7 * t)',
        formulaYStr: '4 * sin(t) - 2 * sin(7 * t)',
        width: 600,
        height: 600,
        lineColor: '#00ff41', // neon green
        lineWidth: 1.5,
        bgColor: 'transparent',
        scale: 50, // Increased scale for larger canvas
        tRange: [0, 2 * Math.PI],
        steps: 1000
    });

    if (parametricCanvas) {
        parametricContainer.appendChild(parametricCanvas);
        const ctx = parametricCanvas.getContext('2d');
        Plotjs.drawGrid(ctx, 600, 600, 50, 'rgba(0, 243, 255, 0.1)', 0.5);
    }
});
