# Plotjs - A Simple JavaScript Graphing Library

Plotjs is a lightweight JavaScript library for drawing trigonometric, polar, and other mathematical function graphs directly on an HTML canvas. It's designed for simplicity and ease of integration into web projects.

## Features

*   **Trigonometric & Cartesian Functions**: Draw functions like `sin(x)`, `cos(x)`, `x^2`, etc.
*   **Polar Curves**: Support for polar coordinate equations (e.g., `r = 2 + sin(5t)`).
*   **Coordinate Helpers**: Built-in methods to draw axes, grids, and labels.
*   **Highly Configurable**: Control width, height, colors, scale, and ranges.
*   **Security Minded**: Includes a formula sanitizer to prevent unauthorized code execution.
*   **Lightweight & Module-based**: Easy to import and use in modern web applications.

## Project Structure

The project is organized to separate the core library from demonstration and server code:

```
mainLib/
├── src/
│   └── plotjs.js          # Core Library
├── demo/
│   ├── index.html         # Demo Page
│   ├── script.js          # Demo Implementation
│   └── style.css          # Demo Styling
├── server/
│   └── express-server.js  # Local Development Server
├── package.json           # Project Configuration
└── README.md
```

## Setup and Installation

1.  Clone the repository or download the files.
2.  Install dependencies for the demo server:
    ```bash
    npm install
    ```

## Usage

### 1. Import the Library

In your JavaScript module, import `Plotjs` from the `src` directory:

```javascript
import Plotjs from '../src/plotjs.js';
```

### 2. Draw a Cartesian Graph

Use `drawTrig` for functions based on `x`.

```javascript
const canvas = Plotjs.drawTrig({
    formulaStr: 'sin(x^2)',
    width: 600,
    height: 300,
    lineColor: '#61dafb',
    bgColor: '#282c34',
    scale: 50,
    xRange: [-5, 5] // Optional
});

document.body.appendChild(canvas);
```

### 3. Draw a Polar Graph

Use `drawPolar` for functions based on `t` (theta).

```javascript
const polarCanvas = Plotjs.drawPolar({
    formulaStr: '2 + sin(5 * t)',
    width: 500,
    height: 500,
    lineColor: '#ff6347',
    bgColor: '#101217',
    scale: 50,
    tRange: [0, 2 * Math.PI] // Optional
});

document.body.appendChild(polarCanvas);
```

### 4. Use Helper Methods

Enhance your graphs with axes, grids, and text:

```javascript
const ctx = canvas.getContext('2d');
Plotjs.drawAxis(ctx, canvas.width, canvas.height);
Plotjs.drawGrid(ctx, canvas.width, canvas.height, 50);
Plotjs.addText(ctx, 'y = sin(x^2)', 10, 20, '16px Arial', '#ffffff');
```

## API Reference

### `Plotjs.drawTrig(config)`
| Property | Type | Description |
| :--- | :--- | :--- |
| `formulaStr` | `string` | The mathematical formula using `x` (e.g., `sin(x)`). |
| `width`/`height` | `number` | Canvas dimensions (Default: 500x250). |
| `lineColor` | `string` | Color of the graph line. |
| `bgColor` | `string` | Background color of the canvas. |
| `scale` | `number` | Zoom level/pixels per unit. |
| `xRange`/`yRange` | `[min, max]` | Optional specific ranges to display. |

### `Plotjs.drawPolar(config)`
| Property | Type | Description |
| :--- | :--- | :--- |
| `formulaStr` | `string` | The mathematical formula using `t` (e.g., `2 * t`). |
| `tRange` | `[min, max]` | Range of theta (Default: `[0, 2*PI]`). |
| `steps` | `number` | Number of points to calculate (Default: 1000). |

## Running the Demo Locally

A pre-configured Express server is included to serve the library and demo files correctly.

1.  **Start the server**:
    ```bash
    npm start
    ```
2.  **Open your browser**:
    Navigate to `http://localhost:8000`

## License
This project is licensed under the ISC License.
