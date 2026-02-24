# Plotjs - A Simple JavaScript Graphing Library

Plotjs is a lightweight JavaScript library for drawing trigonometric and other mathematical function graphs directly on an HTML canvas. It's designed for simplicity and ease of integration into web projects.

## Features

*   Draws trigonometric functions (e.g., sin(x), cos(x)).
*   Supports custom mathematical formulas (e.g., x^2).
*   Configurable graph properties: width, height, line color, background color, scale.
*   Handles discontinuities in functions.

## Setup and Installation

To use Plotjs, you need the following files in your project directory:

*   `plotjs.js`: The core Plotjs library.
*   `index.html`: Your main HTML file where you'll display the graphs.
*   `script.js`: Your JavaScript file to initialize and draw graphs using Plotjs.
*   `style.css`: (Optional) For basic styling of your webpage.
*   `express-server.js`: (Optional) A Node.js server for local development.
*   `package.json`: (Optional) For Node.js project management.

Ensure your directory structure looks like this:

```
your-project/
├── index.html
├── plotjs.js
├── script.js
├── style.css
├── express-server.js
└── package.json
```

## Usage

### 1. Include Files in `index.html`

Your `index.html` file should link to your `style.css` and include `script.js` as a module. `plotjs.js` will be imported by `script.js`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plotjs Graph Example</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Plotjs Graph Example</h1>
    <div id="graph-container">
        <!-- Graphs will be inserted here by JavaScript -->
    </div>
    <script type="module" src="script.js"></script>
</body>
</html>
```

### 2. Draw Graphs with `script.js`

In your `script.js` file, import the `Plotjs` library and use its `drawTrig` method to create canvas elements with your desired graphs. Append these canvases to an HTML container.

```javascript
import Plotjs from './plotjs.js';

document.addEventListener('DOMContentLoaded', () => {
    const graphContainer = document.getElementById('graph-container');

    // Example 1: Sine wave
    const sineCanvas = Plotjs.drawTrig({
        formulaStr: 'sin(x)',
        width: 600,
        height: 300,
        lineColor: '#61dafb',
        bgColor: '#282c34',
        scale: 50
    });

    if (sineCanvas) {
        const h2 = document.createElement('h2');
        h2.textContent = 'y = sin(x)';
        graphContainer.appendChild(h2);
        graphContainer.appendChild(sineCanvas);
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
    }
});
```

### 3. Basic Styling (`style.css`)

```css
body {
    font-family: Arial, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    margin: 0;
    background-color: #282c34;
    color: white;
}

h1 {
    margin-bottom: 20px;
}

#graph-container {
    border: 1px solid #61dafb;
    box-shadow: 0 0 10px rgba(97, 218, 251, 0.5);
    margin-bottom: 20px;
}

canvas {
    display: block;
}
```

## Running Locally with a Web Server (Recommended)

Due to browser security restrictions (CORS) with JavaScript modules, it's highly recommended to serve your `index.html` file using a local HTTP server during development.

### Option 1: Python's Simple HTTP Server

This is a quick and easy way if you have Python installed.

1.  Open your terminal or command prompt in your project's root directory (`your-project/`).
2.  Run the following command:
    ```bash
    python -m http.server 8000
    ```
3.  Open your web browser and navigate to:
    ```
    http://localhost:8000/index.html
    ```
    You should see your graphs displayed.

To stop the server, go back to your terminal and press `Ctrl+C`.

### Option 2: JavaScript Server with Node.js and Express

This option is great if you're already working within a Node.js ecosystem.

1.  **Ensure Node.js is installed** on your system.
2.  **Initialize npm** in your project directory (if you haven't already):
    ```bash
    npm init -y
    ```
3.  **Install Express.js**:
    ```bash
    npm install express
    ```
4.  **Create `express-server.js`**:
    Create a file named `express-server.js` in your project root with the following content:
    ```javascript
    const express = require('express');
    const path = require('path');
    const app = express();
    const port = 8000; // Or any port you prefer

    // Serve static files from the current directory
    app.use(express.static(__dirname));

    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'index.html'));
    });

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
    ```
5.  **Run the server**:
    Open your terminal in the project root and run:
    ```bash
    node express-server.js
    ```
6.  **Open your web browser** and navigate to:
    ```
    http://localhost:8000/
    ```
    You should see your graphs displayed.

To stop the server, go back to your terminal and press `Ctrl+C`.

## Deployment

For deploying your static website, you can use serverless hosting platforms like:
*   GitHub Pages
*   Netlify
*   Vercel
*   AWS S3 with CloudFront
*   Firebase Hosting

These platforms are designed to serve static files efficiently and globally.
