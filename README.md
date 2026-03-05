# Plotjs - Isomorphic Mathematical Graphing Library

Plotjs is a lightweight, high-performance JavaScript library for drawing mathematical functions directly on an HTML canvas or in Node.js. It features a custom math transpiler that supports real and complex analysis, shorthand notation, and automatic root-finding, with optional **WebGL GPU acceleration**.

## Features

*   **Advanced Math Transpiler**: Supports shorthand (e.g., `2x`, `x sin(x)`), power operator (`^`), and full complex number support.
*   **WebGL & GPU Acceleration**: Render complex animations at 60fps using custom GLSL shaders.
*   **Complex Plane (Argand) Support**: Plot complex functions and Fourier-style series with ease.
*   **Mathematical Analysis**: 
    *   **Root Finder**: Identify $x$-intercepts, $y$-intercepts, and $iota$-axis crossings.
    *   **Extrema Detection**: Automatically find local maxima and minima.
*   **Isomorphic**: Runs seamlessly in modern browsers and Node.js (via `canvas`).
*   **UI Enhancements**: Built-in support for grids, axes, labels, and point markers.
*   **Multi-layer Animations**: Animate multiple independent functions simultaneously.

## Installation (Planned for future)

```bash
npm install plotjs
```
*(Note: Ensure you have `canvas` installed if using in Node.js)*

---

## API Reference

### 1. Core Rendering Methods
These methods generate static graphs on a canvas.

### Note: 't' is time variable in each method except polar graph where t is the axis

#### `drawCartesian(config)`
Renders a standard $y = f(x)$ function.
- **Config Properties**: `formulaStr`, `width`, `height`, `lineColor`, `lineWidth`, `bgColor`, `xRange`, `yRange`, `scale`, `t`.

#### `drawPolar(config)`
Renders an angular function where radius $r = f(\theta)$.
- **Config Properties**: `formulaStr` (use `x` for $\theta$), `tRange` (Default `[0, 2π]`), `steps`, `scale`, `t`.

#### `drawParametric(config)`
Renders a curve defined by $x = f(t)$ and $y = g(t)$.
- **Config Properties**: `formulaXStr`, `formulaYStr`, `tRange`, `steps`, `scale`, `t`.

#### `drawComplex(config)`
Renders a complex function $z = f(x)$ on the Argand plane.
- **Config Properties**: `formulaStr` (contains `i`), `xRange`, `steps`, `scale`, `t`.

---

### 2. Animation Engine

#### `loopAnimate(config)`
The high-performance engine for time-dependent ($t$) mathematical animations.
- **Key Config Properties**:
    - `gpu` (Boolean): If `true`, utilizes **WebGL** for 60fps rendering.
    - `layers` (Array): Array of layer objects (Cartesian/Polar/Complex) to render together.
    - `speed` (Number): Multiplier for time variable `t`.
    - `showGrid` / `showAxis` (Boolean): Toggle UI helpers.
    - `onFrame` (Function): Callback for custom drawing per frame.
- **Returns**: `{ canvas, stop }`

---

### 3. Mathematical Analysis

#### `findRoots(formula, range, steps, t)`
Analyzes a function to find intercepts.
- **Returns**: `{ xRoots, yRoots, iotaRoots }`
    - `xRoots`: Intersections with the Real axis.
    - `iotaRoots`: Intersections with the Imaginary axis.

#### `findExtrema(formula, range, steps, t)`
Locates local turning points (peaks and valleys).
- **Returns**: `{ maxima, minima }` containing `[{x, y}, ...]` coordinates.

---

### 4. UI & Enhancement Tools

- `drawAxis(ctx, width, height)`: Draws X/Y axes with labels.
- `drawGrid(ctx, width, height, spacing)`: Draws a coordinate grid.
- `drawRoots(ctx, roots, config)`: Plots markers on intercepts.
- `drawExtrema(ctx, extrema, config)`: Plots markers on maxima/minima.
- `addText(ctx, text, x, y, font, color)`: Overlays text on the canvas.

---

## Math Syntax

Plotjs uses a custom transpiler that makes writing math natural:
- **Shorthand**: `2x`, `(x+1)(x-1)`, `x sin(x)` are all valid.
- **Powers**: Use `^` for exponents (e.g., `x^2`).
- **Complex**: Simply include `i` in your formula (e.g., `exp(i * x)`).
- **Functions**: `sin`, `cos`, `tan`, `sec`, `cot`, `cosec`, `pow`, `sqrt`, `abs`, `log`.
- **Constants**: `PI`, `E`.

## License
This project is licensed under the ISC License.
