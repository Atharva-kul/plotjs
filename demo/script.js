

document.addEventListener('DOMContentLoaded', () => {
    const graphContainer = document.getElementById('graph-container');

    // Example 1: Sine wave
    const sineCanvas = Plotjs.drawTrig({
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
    }

    // Example 2: Cosine wave
    const cosineCanvas = Plotjs.drawTrig({
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
    const complexCanvas = Plotjs.drawTrig({
        formulaStr: 'x^2',
        width: 600,
        height: 300,
        lineColor: '#a9a9a9',
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
        formulaStr: '2 + sin(5 * t)',
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
        formulaXStr: '3 * cos(t) + 2 * cos(3 * t)',
        formulaYStr: '3 * sin(t) - 2 * sin(3 * t)',
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

        Plotjs.addText(parametric.getContext('2d'), 'parametric curve', 10, 20, '16px Arial', '#47ff56');
        Plotjs.drawAxis(parametric.getContext('2d'), 600, 600);
        Plotjs.drawGrid(parametric.getContext('2d'), 600, 600, 50);
        //Plotjs.loopAnimate(parametric, lineColor='#47ff56', bgColor='#282c34', scale=50, formulaXStr='3 * cos(t) + 2 * cos(3 * t)', formulaYStr='3 * sin(t) - 2 * sin(3 * t)', tStart=0, tEnd=20 * Math.PI, tStep=0.1, delay=30);
    }

    

});