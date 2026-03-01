import fs from 'fs';
import Plotjs from './dist/index.node.js';

// 1. Create a graph using the same API as the browser
const canvas = Plotjs.drawParametric({
    formulaXStr: '4 * cos(x - t) + 2 * sin(7 * x - t * 0.5)',
    formulaYStr: '4 * sin(x - t) - 2 * cos(7 * x - t * 0.5)',
    width: 800,
    height: 800,
    lineColor: '#7bc3ff', // neon blue
    lineWidth: 1.5,
})

// 2. Draw axis and grid (from enhancer.js)
const ctx = canvas.getContext('2d');
Plotjs.drawAxis(ctx, 800, 800);
Plotjs.drawGrid(ctx, 800, 800, 50);

// 3. Save the canvas to a file
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('./my-graph-1.png', buffer);

console.log("Success! Graph saved to: D:/coding/graph/mainLib/my-graph-1.png");
