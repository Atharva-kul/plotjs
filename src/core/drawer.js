export const _drawGraph = (points, ctx, config) => {
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