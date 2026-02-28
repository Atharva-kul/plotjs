import fs from 'fs';
import Plotjs from './dist/index.node.js';

// 1. Create a graph using the same API as the browser
const canvas = Plotjs.drawCartesian({
    formulaStr: "sin(x) * cos(x * 0.5)",
    width: 800,
    height: 400,
    lineColor: 'cyan',
    bgColor: '#01050f'
});

// 2. Draw axis and grid (from enhancer.js)
const ctx = canvas.getContext('2d');
Plotjs.drawAxis(ctx, 800, 400);
Plotjs.drawGrid(ctx, 800, 400, 50);

// 3. Save the canvas to a file
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('./my-graph.png', buffer);

console.log("Success! Graph saved to: D:/coding/graph/mainLib/my-graph.png");
