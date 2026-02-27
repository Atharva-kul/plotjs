# Plotjs - A Simple JavaScript Graphing Library

Plotjs is a lightweight JavaScript library for drawing trigonometric, polar, and other mathematical function graphs directly on an HTML canvas. It's designed for simplicity and ease of integration into web projects.

## Features

*   **Trigonometric & Cartesian Functions**: Draw functions like `sin(x)`, `cos(x)`, `x^2`, etc.
*   **Polar Curves**: Support for polar coordinate equations (e.g., `r = 2 + sin(5t)`).
*   **Parametric Curves**: Support for parametric equations (e.g., `x = f(t), y = g(t)`).
*   **Animation**: Loop and animate graphs over time.
*   **Coordinate Helpers**: Built-in methods to draw axes, grids, and labels.
*   **Highly Configurable**: Control width, height, colors, scale, and ranges.
*   **Security Minded**: Includes a formula sanitizer to prevent unauthorized code execution.
*   **Lightweight & Easy to Use**: Simple to include and use in any web page.

## Project Structure

The project is organized to separate the core library from demonstration code:

```
mainLib/
├── src/
│   └── plotjs.js          # Core Library
├── demo/
│   ├── index.html         # Demo Page
│   ├── script.js          # Demo Implementation
│   └── style.css          # Demo Styling
├── package.json           # Project Configuration
└── README.md
```

## Setup and Installation

1.  Clone the repository or download the files.
2.  No installation steps are required for the library itself.

## Usage

### 1. Include the Library in Your HTML

Add the `plotjs.js` file to your HTML page using a `<script>` tag. Ensure it's loaded before any scripts that depend on it.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plotjs Graph Example</title>
    <link rel="stylesheet" href="demo/style.css">
</head>
<body>
    <div id="graph-container">
        <!-- The graph canvas will be inserted here by JavaScript -->
    </div>
    <!-- Load Plotjs library first -->
    <script src="src/plotjs.js"></script>
    <!-- Your script that uses Plotjs -->
    <script src="demo/script.js"></script>
</body>
</html>
```

### 2. Draw a Cartesian Graph

Use `drawTrig` for functions based on `x`.

```javascript
// Assuming script.js is loaded after plotjs.js
document.addEventListener('DOMContentLoaded', () => {
    const canvas = Plotjs.drawTrig({
        formulaStr: 'sin(x^2)',
        width: 600,
        height: 300,
        lineColor: '#61dafb',
        bgColor: '#282c34',
        scale: 50,
        xRange: [-5, 5] // Optional
    });

    document.getElementById('graph-container').appendChild(canvas);
});
```

### 3. Draw a Polar Graph

Use `drawPolar` for functions based on `t` (theta).

```javascript
// Assuming script.js is loaded after plotjs.js
document.addEventListener('DOMContentLoaded', () => {
    const polarCanvas = Plotjs.drawPolar({
        formulaStr: '2 + sin(5 * t)',
        width: 500,
        height: 500,
        lineColor: '#ff6347',
        bgColor: '#101217',
        scale: 50,
        tRange: [0, 2 * Math.PI] // Optional
    });

    document.getElementById('graph-container').appendChild(polarCanvas);
});
```

### 4. Use Helper Methods

Enhance your graphs with axes, grids, and text:

```javascript
// Assuming script.js is loaded after plotjs.js
document.addEventListener('DOMContentLoaded', () => {
    const canvas = Plotjs.drawTrig({ /* ... config ... */ });
    const ctx = canvas.getContext('2d');
    Plotjs.drawAxis(ctx, canvas.width, canvas.height);
    Plotjs.drawGrid(ctx, canvas.width, canvas.height, 50);
    Plotjs.addText(ctx, 'y = sin(x^2)', 10, 20, '16px Arial', '#ffffff');
});
```

## Running the Demo Locally

To see the library in action, simply open the `demo/index.html` file directly in your web browser. No local server is required.

1.  Clone the repository or download the files.
2.  Navigate to the `demo` directory.
3.  Double-click `index.html` to open it in your browser.

## License
This project is licensed under the ISC License.
