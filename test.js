import fs from 'fs';
import Plotjs from './dist/index.node.js';

// 1. Create a graph using the same API as the browser
const canvas = Plotjs.drawComplex({
        // 4 layers of rotating vectors with increasing frequencies
        formulaStr: '2.5 * (cos(x) + i * sin(x)) + 1.2 * (cos(5*x) + i * sin(5*x)) + 0.6 * (cos(13*x) - i * sin(13*x)) + 0.3 * (cos(23*x) + i * sin(23*x))',
        width: 700,
        height: 700,
        lineColor: '#ff00ff', // Neon Magenta
        bgColor: '#01050f',
        scale: 50,
        xRange: [0, 2 * Math.PI],
        steps: 5000 // Increased steps to capture the high-frequency detail
    })

// 2. Draw axis and grid (from enhancer.js)
const ctx = canvas.getContext('2d');
Plotjs.drawAxis(ctx, 800, 800);
Plotjs.drawGrid(ctx, 800, 800, 50);

// 3. Save the canvas to a file
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('./my-graph-3.png', buffer);

console.log("Success! Graph saved to: D:/coding/graph/mainLib/my-graph-3.png");
