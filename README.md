# Plotjs - Isomorphic Mathematical Graphing Library

Plotjs is a lightweight, high-performance JavaScript library for drawing mathematical functions directly on an HTML canvas or in Node.js. It features a custom math transpiler that supports real and complex analysis, shorthand notation, and automatic root-finding.

## 🚀 Features

*   **Advanced Math Transpiler**: Supports shorthand (e.g., `2x`, `x sin(x)`), power operator (`^`), and full complex number support.
*   **Complex Plane (Argand) Support**: Plot complex functions and Fourier-style series with ease.
*   **Universal Root Finder**: Identify $x$-intercepts, $y$-intercepts, and $iota$-axis crossings for any function.
*   **Isomorphic**: Runs seamlessly in modern browsers and Node.js (via `node-canvas`).
*   **High-Frequency Support**: Optimized point generation for high-frequency oscillations and detailed "lace" patterns.
*   **Interactive & Animated**: Built-in animation loop for time-dependent ($t$) functions.

## 📦 Installation (not supported now. Planned for future)

```bash
npm install plotjs
```

## 🛠 Usage

### 1. In the Browser (ESM)

```html
<script type="module">
  import Plotjs from './dist/index.browser.js';

  const canvas = Plotjs.drawCartesian({
    formulaStr: 'sin(x^2) - log(x)',
    width: 800,
    height: 400,
    lineColor: '#61dafb'
  });
  document.body.appendChild(canvas);
</script>
```

### 2. In Node.js

```javascript
import fs from 'fs';
import Plotjs from 'plotjs';

const canvas = Plotjs.drawComplex({
  formulaStr: '3 * (cos(x) + i * sin(x)) + 1.5 * (cos(4x) - i * sin(4x))',
  width: 600,
  height: 600,
  scale: 60
});

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('graph.png', buffer);
```

## 🧮 Advanced Root Finding

The `findRoots` function automatically detects complex formulas and identifies all axis intersections.

```javascript
// Finds roots for a parametric curve
const roots = Plotjs.findRoots('3sin(x) - 2sin(3x)', [0, 2 * Math.PI]);

console.log(roots.xRoots);    // t-values where the curve hits the X-axis
console.log(roots.yRoots);    // Values where the curve hits the Y-axis
console.log(roots.iotaRoots); // t-values where the curve hits the Imaginary axis
```

## 🎨 Supported Graph Types

| Type | Description | Variable |
| :--- | :--- | :--- |
| **Cartesian** | Standard $y = f(x)$ plotting. | `x` |
| **Polar** | Angular plotting $r = f(\theta)$. | `x` (theta) |
| **Parametric** | $x = f(t), y = g(t)$ plotting. | `x` (parameter) |
| **Complex** | Mapping $z = f(x)$ on the Argand plane. | `x` (real parameter), `i` |

## 📐 Math Syntax

Plotjs uses a custom transpiler that makes writing math natural:
- **Shorthand**: `2x`, `(x+1)(x-1)`, `x sin(x)` are all valid.
- **Powers**: Use `^` for exponents (e.g., `x^2`).
- **Complex**: Simply include `i` in your formula (e.g., `exp(i * x)`).
- **Functions**: `sin`, `cos`, `tan`, `sec`, `cot`, `cosec`, `pow`, `sqrt`, `abs`, `log`.
- **Constants**: `PI`, `E`.

## 📜 License
This project is licensed under the ISC License.
