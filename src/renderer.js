(function(window) {
    const Plotjs = window.Plotjs || {};

    // Method: Draw the graph by connecting the points
    Plotjs._drawGraph = (points, ctx, config) => {
        const { lineColor = 'white', lineWidth = 2 } = config;
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();

        let currentSegment = [];
        for (const point of points) {
            if (point) {
                currentSegment.push(point);
            } else {
                if (currentSegment.length > 1) {
                    currentSegment.forEach((p, i) => {
                        if (i === 0) ctx.moveTo(p.x, p.y);
                        else ctx.lineTo(p.x, p.y);
                    });
                }
                currentSegment = [];
            }
        }

        if (currentSegment.length > 1) {
            currentSegment.forEach((p, i) => {
                if (i === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            });
        }
        ctx.stroke();
    };

    // Method: Generate points for Cartesian/Trig graphs
    Plotjs._generateCartesianPoints = (config) => {
        const { formula, width, height, scale = 50, xRange, yRange, t = 0 } = config;
        const points = [];
        const midX = width / 2;
        const midY = height / 2;

        for (let px = 0; px <= width; px++) {
            let x;
            if (xRange) {
                const [minX, maxX] = xRange;
                x = minX + (px / width) * (maxX - minX);
            } else {
                x = (px - midX) / scale;
            }

            let y = formula(x, t);
            if (y !== null && Number.isFinite(y)) {
                let py;
                if (yRange) {
                    const [minY, maxY] = yRange;
                    py = height - ((y - minY) / (maxY - minY)) * height;
                } else {
                    py = midY - (y * scale);
                }
                points.push({ x: px, y: py });
            } else {
                points.push(null);
            }
        }
        return points;
    };

    // Method: Generate points for Polar graphs
    Plotjs._generatePolarPoints = (config) => {
        const { formula, width, height, scale = 50, tRange = [0, 2 * Math.PI], steps = 1000, t = 0 } = config;
        const points = [];
        const midX = width / 2;
        const midY = height / 2;
        const [tMin, tMax] = tRange;

        for (let i = 0; i <= steps; i++) {
            let theta = tMin + (i / steps) * (tMax - tMin);
            let r = formula(theta, t);

            if (r !== null && Number.isFinite(r)) {
                let x = r * Math.cos(theta) * scale + midX;
                let y = midY - r * Math.sin(theta) * scale;
                points.push({ x, y });
            } else {
                points.push(null);
            }
        }
        return points;
    };

    // Method: Generate points for Parametric graphs
    Plotjs._generateParametricPoints = (config) => {
        const { fX, fY, width, height, scale = 50, tRange = [0, 2 * Math.PI], steps = 1000, t = 0 } = config;
        const points = [];
        const midX = width / 2;
        const midY = height / 2;
        const [tMin, tMax] = tRange;

        for (let i = 0; i <= steps; i++) {
            const u = tMin + (i / steps) * (tMax - tMin);
            const xVal = fX(u, t);
            const yVal = fY(u, t);

            if (xVal !== null && yVal !== null && Number.isFinite(xVal) && Number.isFinite(yVal)) {
                points.push({
                    x: midX + (xVal * scale),
                    y: midY - (yVal * scale)
                });
            } else {
                points.push(null);
            }
        }
        return points;
    };

    window.Plotjs = Plotjs;
})(window);
