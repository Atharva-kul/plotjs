export const drawAxis = (ctx, width, height) => {
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
};

export const drawGrid = (
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
};

export const addText = (
    ctx, 
    text, 
    x, y, 
    font = '16px Arial', 
    color = 'white'
) => {
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
};