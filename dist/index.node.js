// src/core/math.js
var _createFormula = (formulaStr, args) => {
  const allowedPattern = /^(?:[xt0-9.+\-/*^()\s]|sin|cos|tan|sec|cot|cosec|pow|sqrt|abs|log|PI|E|\^)+$/;
  if (!allowedPattern.test(formulaStr)) {
    console.error(`Plotjs Security Error: The formula "${formulaStr}" contains unauthorized characters.`);
    return null;
  }
  try {
    const processedFormula = formulaStr.replace(/\^/g, "**");
    const functionBody = `
            // Make only approved Math functions available in scope
            const { sin, cos, tan, PI, E, pow, sqrt, abs, log } = Math;
            
            // Define custom helper functions
            const sec = (a) => 1 / cos(a);
            const cot = (a) => 1 / tan(a);
            const cosec = (a) => 1 / sin(a);

            // Calculate and return the result
            const result = ${processedFormula};
            
            // Ensure the result is a finite number
            return Number.isFinite(result) ? result : null;
        `;
    return new Function(...args, functionBody);
  } catch (error) {
    console.error(`Plotjs Error: The formula "${formulaStr}" is invalid.`);
    return null;
  }
};

// src/core/generator.js
var _generateCartesianPoints = (config) => {
  const { formula, width, height, scale = 50, xRange, yRange, t = 0 } = config;
  const points = [];
  const midX = width / 2;
  const midY = height / 2;
  for (let px = 0; px <= width; px++) {
    let x;
    if (xRange) {
      const [minX, maxX] = xRange;
      x = minX + px / width * (maxX - minX);
    } else {
      x = (px - midX) / scale;
    }
    let y = formula(x, t);
    if (y !== null && Number.isFinite(y)) {
      let py;
      if (yRange) {
        const [minY, maxY] = yRange;
        py = height - (y - minY) / (maxY - minY) * height;
      } else {
        py = midY - y * scale;
      }
      points.push({ x: px, y: py });
    } else {
      points.push(null);
    }
  }
  return points;
};
var _generatePolarPoints = (config) => {
  const { formula, width, height, scale = 50, tRange = [0, 2 * Math.PI], steps = 1e3, t = 0 } = config;
  const points = [];
  const midX = width / 2;
  const midY = height / 2;
  const [tMin, tMax] = tRange;
  for (let i = 0; i <= steps; i++) {
    let theta = tMin + i / steps * (tMax - tMin);
    let r = formula(theta, t);
    if (r !== null && Number.isFinite(r)) {
      let x = r * Math.cos(theta) * scale + midX;
      let y = midY - r * Math.sin(theta) * scale;
      points.push({ x, y });
    } else {
      points.push(null);
    }
  }
  return points;
};
var _generateParametricPoints = (config) => {
  const { fX, fY, width, height, scale = 50, tRange = [0, 2 * Math.PI], steps = 1e3, t = 0 } = config;
  const points = [];
  const midX = width / 2;
  const midY = height / 2;
  const [tMin, tMax] = tRange;
  for (let i = 0; i <= steps; i++) {
    const u = tMin + i / steps * (tMax - tMin);
    const xVal = fX(u, t);
    const yVal = fY(u, t);
    if (xVal !== null && yVal !== null && Number.isFinite(xVal) && Number.isFinite(yVal)) {
      points.push({
        x: midX + xVal * scale,
        y: midY - yVal * scale
      });
    } else {
      points.push(null);
    }
  }
  return points;
};

// src/core/drawer.js
var _drawGraph = (points, ctx, config) => {
  const { lineColor = "white", lineWidth = 2 } = config;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  let currentSegment = [];
  for (const point of points) {
    if (point) {
      currentSegment.push(point);
    } else {
      if (currentSegment.length > 1) {
        currentSegment.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
      }
      currentSegment = [];
    }
  }
  if (currentSegment.length > 1) {
    currentSegment.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
  }
  ctx.stroke();
};

// src/core/enhancer.js
var drawAxis = (ctx, width, height) => {
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  let xLabel = "x-axis";
  let yLabel = "y-axis";
  ctx.font = "12px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(xLabel, width - 50, height / 2 - 10);
  ctx.fillText(yLabel, width / 2 + 10, 20);
  ctx.stroke();
};
var drawGrid = (ctx, width, height, gridSpacing = 50, lineColor = "#555555", lineWidth = 0.5) => {
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  for (let x = gridSpacing; x < width; x += gridSpacing) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = gridSpacing; y < height; y += gridSpacing) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();
};
var addText = (ctx, text, x, y, font = "16px Arial", color = "white") => {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
};

// src/core/index.js
function createPlotjs(adapter) {
  const { createCanvas: createCanvas2, requestAnimationFrame, cancelAnimationFrame } = adapter;
  return {
    createCanvas: createCanvas2,
    _createFormula,
    _generateCartesianPoints,
    _generatePolarPoints,
    _generateParametricPoints,
    _drawGraph,
    drawAxis,
    drawGrid,
    addText,
    drawCartesian: (config) => {
      const {
        formulaStr,
        canvas: existingCanvas,
        width = 500,
        height = 250,
        lineColor = "white",
        lineWidth = 2,
        bgColor = "black",
        xRange,
        yRange,
        scale = 50,
        t = 0
      } = config;
      if (!formulaStr) {
        console.error("Plotjs Error: parameter formulaStr must be passed to draw the graph");
        return null;
      }
      const formula = _createFormula(formulaStr, ["x", "t"]);
      if (!formula) return null;
      const canvas = existingCanvas || createCanvas2(width, height);
      if (!existingCanvas && canvas.style) {
        canvas.style.backgroundColor = bgColor;
      }
      const ctx = canvas.getContext("2d");
      const points = _generateCartesianPoints({
        formula,
        width: canvas.width || width,
        height: canvas.height || height,
        scale,
        xRange,
        yRange,
        t
      });
      _drawGraph(points, ctx, { lineColor, lineWidth });
      return canvas;
    },
    drawPolar: (config) => {
      const {
        formulaStr,
        canvas: existingCanvas,
        width = 500,
        height = 500,
        lineColor = "white",
        lineWidth = 2,
        bgColor = "black",
        scale = 50,
        tRange = [0, 2 * Math.PI],
        steps = 1e3,
        t = 0
      } = config;
      if (!formulaStr) {
        console.error("Plotjs Error: parameter formulaStr must be passed");
        return null;
      }
      const formula = _createFormula(formulaStr, ["x", "t"]);
      if (!formula) return null;
      const canvas = existingCanvas || createCanvas2(width, height);
      if (!existingCanvas && canvas.style) {
        canvas.style.backgroundColor = bgColor;
      }
      const ctx = canvas.getContext("2d");
      const points = _generatePolarPoints({
        formula,
        width: canvas.width || width,
        height: canvas.height || height,
        scale,
        tRange,
        steps,
        t
      });
      _drawGraph(points, ctx, { lineColor, lineWidth });
      return canvas;
    },
    drawParametric: (config) => {
      const {
        formulaXStr,
        formulaYStr,
        canvas: existingCanvas,
        width = 500,
        height = 500,
        lineColor = "white",
        lineWidth = 2,
        bgColor = "black",
        scale = 50,
        tRange = [0, 2 * Math.PI],
        steps = 1e3,
        t = 0
      } = config;
      if (!formulaXStr || !formulaYStr) {
        console.error("Plotjs Error: parameter formulaXStr and formulaYStr must be passed");
        return null;
      }
      const fX = _createFormula(formulaXStr, ["x", "t"]);
      const fY = _createFormula(formulaYStr, ["x", "t"]);
      if (!fX || !fY) return null;
      const canvas = existingCanvas || createCanvas2(width, height);
      if (!existingCanvas && canvas.style) {
        canvas.style.backgroundColor = bgColor;
      }
      const ctx = canvas.getContext("2d");
      const points = _generateParametricPoints({
        fX,
        fY,
        width: canvas.width || width,
        height: canvas.height || height,
        scale,
        tRange,
        steps,
        t
      });
      _drawGraph(points, ctx, { lineColor, lineWidth });
      return canvas;
    },
    loopAnimate: (config) => {
      const {
        type = "cartesian",
        // 'cartesian', 'polar', 'parametric'
        formulaStr,
        formulaXStr,
        formulaYStr,
        canvas: existingCanvas,
        width = 500,
        height = 250,
        lineColor = "white",
        lineWidth = 2,
        bgColor = "black",
        scale = 50,
        xRange,
        yRange,
        tRange,
        steps,
        duration = Infinity,
        speed = 1,
        showAxis = true,
        showGrid = true
      } = config;
      let formula, fX, fY;
      if (type === "parametric") {
        fX = _createFormula(formulaXStr, ["x", "t"]);
        fY = _createFormula(formulaYStr, ["x", "t"]);
        if (!fX || !fY) return null;
      } else {
        if (!formulaStr) {
          console.error("Plotjs Error: formulaStr required for " + type);
          return null;
        }
        formula = _createFormula(formulaStr, ["x", "t"]);
        if (!formula) return null;
      }
      const canvas = existingCanvas || createCanvas2(width, height);
      if (!existingCanvas && canvas.style) {
        canvas.style.backgroundColor = bgColor;
      }
      const ctx = canvas.getContext("2d");
      const cw = canvas.width || width;
      const ch = canvas.height || height;
      let startTime = null;
      let animationId = null;
      const renderFrame = (timeStamp) => {
        if (!startTime) startTime = timeStamp;
        const elapsed = timeStamp - startTime;
        if (elapsed > duration) {
          cancelAnimationFrame(animationId);
          return;
        }
        const t = elapsed / 1e3 * speed;
        ctx.clearRect(0, 0, cw, ch);
        if (showGrid) drawGrid(ctx, cw, ch, 50);
        if (showAxis) drawAxis(ctx, cw, ch);
        let points;
        const genConfig = { ...config, width: cw, height: ch, t };
        if (type === "polar") {
          points = _generatePolarPoints({ formula, ...genConfig });
        } else if (type === "parametric") {
          points = _generateParametricPoints({ fX, fY, ...genConfig });
        } else {
          points = _generateCartesianPoints({ formula, ...genConfig });
        }
        _drawGraph(points, ctx, { lineColor, lineWidth });
        animationId = requestAnimationFrame(renderFrame);
      };
      animationId = requestAnimationFrame(renderFrame);
      return {
        canvas,
        stop: () => cancelAnimationFrame(animationId),
        play: () => {
          cancelAnimationFrame(animationId);
          startTime = null;
          animationId = requestAnimationFrame(renderFrame);
        }
      };
    }
  };
}

// src/node/adapter.js
import { createCanvas } from "canvas";
var nodeAdapter = {
  createCanvas: (width, height) => {
    return createCanvas(width, height);
  },
  requestAnimationFrame: (cb) => setTimeout(() => cb(Date.now()), 1e3 / 60),
  cancelAnimationFrame: (id) => clearTimeout(id)
};

// src/index.node.js
var Plotjs = createPlotjs(nodeAdapter);
var index_node_default = Plotjs;
export {
  index_node_default as default
};
