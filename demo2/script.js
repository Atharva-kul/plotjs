document.addEventListener('DOMContentLoaded', () => {
    const leftSocket = document.getElementById('left-eye');
    const rightSocket = document.getElementById('right-eye');

    const config = {
        width: 420,
        height: 420,
        bgColor: 'transparent',
        scale: 65, 
        steps: 10000 // Ultra-high detail
    };

    function drawSentinelEye(container, isLeft) {
        container.style.position = 'relative';

        const detailStr = isLeft
            ? '2.4 * (cos(x) + i * sin(x)) + 0.5 * (cos(31*x - t) + i * sin(31*x - t))'
            : '2.4 * (cos(x) + i * sin(x)) + 0.5 * (cos(31*x + t) + i * sin(31*x + t))';

        const compiledDetail = Plotjs._createFormula(detailStr, ['x', 't'], { complex: true });

        const canvas = Plotjs.createCanvas(420, 420);
        container.appendChild(canvas);

        let frameCount = 0;
        let lastFpsUpdate = 0;
        let fps = 0;

        Plotjs.loopAnimate({
            ...config,
            canvas: canvas,
            showAxis: false, 
            showGrid: true,
            gpu: true,
            layers: [
                { 
                    type: 'complex', 
                    formulaStr: isLeft 
                        ? '2.4 * (cos(x + 0.2*t) + i * sin(x + 0.2*t)) + 0.6 * (cos(11*x - t) + i * sin(11*x - t))'
                        : '2.4 * (cos(x - 0.2*t) + i * sin(x - 0.2*t)) + 0.6 * (cos(11*x + t) + i * sin(11*x + t))',
                    lineColor: '#8b1313', lineWidth: 2, speed: 1.2, steps: 8000 
                },
                { type: 'complex', formulaStr: detailStr, lineColor: '#ff8c00', lineWidth: 1.5, speed: 1.2, steps: 10000 },
                { type: 'polar', formulaStr: '0.9 + 0.1 * sin(5 * x + 2 * t)', lineColor: '#0f00b5', lineWidth: 4, speed: 1.6, steps: 2000 },
                { type: 'polar', formulaStr: '0.35 + 0.05 * sin(12 * x + 4 * t)', lineColor: '#ff0000', lineWidth: 5, speed: 1.8, steps: 1500 }
            ],
            onFrame: (ctx, t) => {
                frameCount++;
                const now = performance.now();
                if (now - lastFpsUpdate >= 1000) {
                    fps = frameCount;
                    frameCount = 0;
                    lastFpsUpdate = now;
                }

                Plotjs.addText(ctx, `FPS: ${fps}`, 10, 25, '14px Courier New', '#ff3e3e');

                ctx.strokeStyle = 'rgba(251, 0, 0, 0.27)';
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(210, 210, 208, 0, Math.PI * 2); ctx.stroke();
            }
        });
    }

    drawSentinelEye(leftSocket, true);
    drawSentinelEye(rightSocket, false);
});
