var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.node.js
var index_node_exports = {};
__export(index_node_exports, {
  default: () => index_node_default
});
module.exports = __toCommonJS(index_node_exports);

// src/core/math.js
var _createFormula = (formulaStr, args, options = {}) => {
  const isComplex = options.complex === true;
  const allowedPattern = /^(?:[xti0-9.+\-/*^()\s]|sin|cos|tan|sec|cot|cosec|pow|sqrt|abs|log|PI|E|\^)+$/;
  if (!allowedPattern.test(formulaStr)) {
    console.error(`Plotjs Security Error: The formula "${formulaStr}" contains unauthorized characters.`);
    return null;
  }
  try {
    const processedFormula = formulaStr.replace(/\^/g, "**");
    if (isComplex) {
      const transpile = (formula) => {
        const tokens = formula.match(/[0-9.]+|sin|cos|tan|cosec|sec|cot|[xti]|\+|\-|\*|\/|\(|\)|\^/g);
        if (!tokens) return formula;
        let pos = 0;
        const peek = () => tokens[pos];
        const consume = () => tokens[pos++];
        const parsePrimary = () => {
          let t = consume();
          if (t === "(") {
            let res = parseExpr();
            consume();
            return res;
          }
          if (["sin", "cos", "tan", "cosec", "sec", "cot"].includes(t)) {
            consume();
            let arg = parseExpr();
            consume();
            return `${t}(${arg})`;
          }
          return t;
        };
        const parseFactor = () => {
          let node = parsePrimary();
          while (["i", "x", "t"].includes(peek())) {
            node = `_mul(${node},${consume()})`;
          }
          return node;
        };
        const parseTerm = () => {
          let node = parseFactor();
          while (peek() === "*" || peek() === "/") {
            let op = consume();
            let right = parseFactor();
            node = op === "*" ? `_mul(${node},${right})` : `_div(${node},${right})`;
          }
          return node;
        };
        const parseExpr = () => {
          let node = parseTerm();
          while (peek() === "+" || peek() === "-") {
            let op = consume();
            let right = parseTerm();
            node = op === "+" ? `_add(${node},${right})` : `_sub(${node},${right})`;
          }
          return node;
        };
        try {
          return parseExpr();
        } catch (e) {
          return formula;
        }
      };
      const transpiledExpr = transpile(processedFormula);
      const functionBody2 = `
                var _sin = Math.sin, _cos = Math.cos, _tan = Math.tan;
                var { PI, E, pow, sqrt, abs, log } = Math;
                
                var Complex = function(re, im) { this.re = re; this.im = im || 0; };
                Complex.from = function(v) { 
                    if (v instanceof Complex) return v;
                    if (typeof v === 'number') return new Complex(v, 0);
                    return new Complex(0, 0);
                };
                Complex.add = function(a, b) { a = Complex.from(a); b = Complex.from(b); return new Complex(a.re + b.re, a.im + b.im); };
                Complex.sub = function(a, b) { a = Complex.from(a); b = Complex.from(b); return new Complex(a.re - b.re, a.im - b.im); };
                Complex.mul = function(a, b) { 
                    a = Complex.from(a); b = Complex.from(b);
                    return new Complex(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
                };
                Complex.div = function(a, b) {
                    a = Complex.from(a); b = Complex.from(b);
                    var d = b.re * b.re + b.im * b.im;
                    return new Complex((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
                };

                var sin = function(z) { return _sin(z instanceof Complex ? z.re : z); };
                var cos = function(z) { return _cos(z instanceof Complex ? z.re : z); };
                var tan = function(z) { return _tan(z instanceof Complex ? z.re : z); };

                var i = new Complex(0, 1);
                var _add = Complex.add, _sub = Complex.sub, _mul = Complex.mul, _div = Complex.div;

                try {
                    var result = ${transpiledExpr};
                    return Complex.from(result);
                } catch(e) {
                    return null;
                }
            `;
      return new Function(...args, functionBody2);
    }
    const functionBody = `
            const { sin, cos, tan, PI, E, pow, sqrt, abs, log } = Math;
            const sec = (a) => 1 / cos(a);
            const cot = (a) => 1 / tan(a);
            const cosec = (a) => 1 / sin(a);
            const result = ${processedFormula};
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
var _generateComplexPoints = (config) => {
  const {
    formula,
    width,
    height,
    scale = 50,
    xRange = [-10, 10],
    yRange = [-10, 10],
    t = 0,
    steps = 1e3
  } = config;
  const points = [];
  const midX = width / 2;
  const midY = height / 2;
  const [xMin, xMax] = xRange;
  for (let i = 0; i <= steps; i++) {
    const x = xMin + i / steps * (xMax - xMin);
    const rawResult = formula(x, t);
    let re = 0, im = 0;
    if (rawResult !== null && typeof rawResult === "object" && "re" in rawResult) {
      re = rawResult.re;
      im = rawResult.im || 0;
    } else if (typeof rawResult === "number" && isFinite(rawResult)) {
      re = rawResult;
      im = 0;
    } else {
      points.push(null);
      continue;
    }
    points.push({
      x: midX + re * scale,
      y: midY - im * scale
    });
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
    drawComplex: (config) => {
      const {
        formulaStr,
        canvas: existingCanvas,
        width = 500,
        height = 500,
        lineColor = "white",
        lineWidth = 2,
        bgColor = "black",
        scale = 50,
        xRange = [-10, 10],
        steps = 1e3,
        t = 0
      } = config;
      if (!formulaStr) {
        console.error("PlotJs Error: parameter formulaStr must be passed");
        return null;
      }
      const formula = _createFormula(formulaStr, ["x", "t"], {
        complex: true
      });
      if (!formula) return null;
      const canvas = existingCanvas || createCanvas2(width, height);
      if (!existingCanvas && canvas.style) {
        canvas.style.backgroundColor = bgColor;
      }
      const ctx = canvas.getContext("2d");
      const points = _generateComplexPoints({
        formula,
        width: canvas.width || width,
        height: canvas.height || height,
        scale,
        xRange,
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
var import_canvas = require("canvas");
var nodeAdapter = {
  createCanvas: (width, height) => {
    return (0, import_canvas.createCanvas)(width, height);
  },
  requestAnimationFrame: (cb) => setTimeout(() => cb(Date.now()), 1e3 / 60),
  cancelAnimationFrame: (id) => clearTimeout(id)
};

// src/index.node.js
var Plotjs = createPlotjs(nodeAdapter);
var index_node_default = Plotjs;
