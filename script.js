import Plotjs from './plotjs.js';

document.addEventListener('DOMContentLoaded', () => {
    const graphContainer = document.getElementById('graph-container');

    // Example 1: Sine wave
    const sineCanvas = Plotjs.drawTrig({
        formulaStr: 'sin(x^2) - log(x)',
        width: 900,
        height: 300,
        lineColor: '#61dafb',
        bgColor: '#105a44',
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
    }

    // Example 2: Cosine wave
    const cosineCanvas = Plotjs.drawTrig({
        formulaStr: 'cos(x)',
        width: 600,
        height: 300,
        lineColor: '#ff69b4',
        bgColor: '#282c34',
        scale: 50
    });

    if (cosineCanvas) {
        const h2 = document.createElement('h2');
        h2.textContent = 'y = cos(x)';
        graphContainer.appendChild(h2);
        graphContainer.appendChild(cosineCanvas);
        Plotjs.drawAxis(cosineCanvas.getContext('2d'), 600, 300);
        Plotjs.addText(cosineCanvas.getContext('2d'), 'cosine curve ', 10, 20, '#ff69b4', '16px Arial');
    }

    // Example 3: A more complex function (e.g., x^2)
    const complexCanvas = Plotjs.drawTrig({
        formulaStr: 'x^2',
        width: 600,
        height: 300,
        lineColor: '#a9a9a9',
        bgColor: '#282c34',
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
});