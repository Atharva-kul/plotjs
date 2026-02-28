# Plotjs - A Simple JavaScript Graphing Library

Plotjs is a lightweight JavaScript library for drawing trigonometric, polar, and other mathematical function graphs directly on an HTML canvas. It's designed for simplicity and ease of integration into web projects.

## Features

*   **Trigonometric & Cartesian Functions**: Draw functions like `sin(x)`, `cos(x)`, `x^2`, etc.
*   **Polar Curves**: Support for polar coordinate equations (e.g., `r = 2 + sin(5x)`).
*   **Parametric Curves**: Support for parametric equations (e.g., `x = f(x, t), y = g(x, t)`).
*   **Universal Animation**: A powerful `loopAnimate` function that works for all graph types.
*   **Enhanced Visualization**: Separate module for drawing axes, grids, and labels.
*   **Highly Configurable**: Control width, height, colors, scale, and ranges.
*   **Security Minded**: Includes a formula sanitizer to prevent unauthorized code execution.
*   **Modular Design**: Core logic, point generation, and visualization enhancements are separated.

## Project Structure

The project is organized into core logic, rendering, and optional enhancements:

```
mainLib/
├── src/
│   ├── plotjs.js          # Core Library (API and formula parser)
│   ├── renderer.js        # Rendering (Point generation and drawing)
│   └── enhancer.js        # Enhancements (Axes, Grids, Text)
├── demo/                  # Standard Demo
├── futuristic/            # Advanced HUD-style Demo
├── package.json
└── README.md
```

## Setup and Installation

1.  Clone the repository or download the files.
2.  Include the desired scripts in your project.

## Usage

### 1. Include the Library in Your HTML

To use the full feature set, include `plotjs.js`, `renderer.js`, and `enhancer.js` in that order.

```html
<script src="src/plotjs.js"></script>
<script src="src/renderer.js"></script>
<script src="src/enhancer.js"></script>
<script src="script.js"></script>
```

### 2. Universal Animation Example

Animate any type of graph using the `type` parameter: `'trig'` (default), `'polar'`, or `'parametric'`.

```javascript
// Animate a Polar Graph
Plotjs.loopAnimate({
    type: 'polar',
    formulaStr: '2 + sin(5 * x + t)', // x is angle, t is time
    width: 600,
    height: 600,
    lineColor: '#ff6347',
    scale: 80,
    speed: 1.5
});

// Animate a Parametric Graph
Plotjs.loopAnimate({
    type: 'parametric',
    formulaXStr: '4 * cos(x + t)',     // x is parameter u, t is time
    formulaYStr: '4 * sin(x * 1.5 + t)',
    width: 600,
    height: 600,
    lineColor: '#00ff41'
});
```

### 3. Draw a Cartesian Graph (Static)

```javascript
const canvas = Plotjs.drawTrig({
    formulaStr: 'sin(x^2)',
    width: 600,
    height: 300,
    lineColor: '#61dafb',
    scale: 50
});
```

### Variable Convention Note
Across all graph types and the math parser:
*   **`x`**: Represents the "independent variable" (x-coordinate, theta angle, or parametric u).
*   **`t`**: Represents the "animation time" variable.

## License
This project is licensed under the ISC License.
