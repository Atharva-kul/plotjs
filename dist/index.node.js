// src/core/math.js
var _createFormula = (formulaStr, args, options = {}) => {
  const isComplex = options.complex === true;
  const allowedPattern = /^(?:[xti0-9.+\-/*^(),\s]|sin|cos|tan|sec|cot|cosec|pow|sqrt|abs|log|PI|E)+$/;
  if (!allowedPattern.test(formulaStr)) {
    console.error(`Graphlyjs Security Error: The formula "${formulaStr}" contains unauthorized characters.`);
    return null;
  }
  const transpile = (formula, mode) => {
    const funcNames = ["sin", "cos", "tan", "cosec", "sec", "cot", "pow", "sqrt", "abs", "log"];
    const tokens = formula.match(/sin|cos|tan|cosec|sec|cot|pow|sqrt|abs|log|PI|E|[xti]|\d*\.?\d+|\+|\-|\*|\/|\^|\(|\)|,/g);
    if (!tokens) return formula;
    let pos = 0;
    const peek = () => tokens[pos];
    const consume = () => tokens[pos++];
    const parseExpression = () => {
      let node = parseTerm();
      while (peek() === "+" || peek() === "-") {
        const op = consume();
        const right = parseTerm();
        if (mode === "glsl-complex") node = op === "+" ? `c_add(${node}, ${right})` : `c_sub(${node}, ${right})`;
        else if (mode === "complex") node = op === "+" ? `_add(${node}, ${right})` : `_sub(${node}, ${right})`;
        else node = `(${node}${op}${right})`;
      }
      return node;
    };
    const parseTerm = () => {
      let node = parseFactor();
      while (peek() === "*" || peek() === "/") {
        const op = consume();
        const right = parseFactor();
        if (mode === "glsl-complex") node = op === "*" ? `c_mul(${node}, ${right})` : `c_div(${node}, ${right})`;
        else if (mode === "complex") node = op === "*" ? `_mul(${node}, ${right})` : `_div(${node}, ${right})`;
        else node = `(${node}${op}${right})`;
      }
      return node;
    };
    const parseFactor = () => {
      let node = parsePower();
      while (pos < tokens.length && ["(", "x", "t", "i", "PI", "E", "sin", "cos", "tan", "pow", "sqrt", "log"].includes(peek())) {
        const right = parsePower();
        if (mode === "glsl-complex") node = `c_mul(${node}, ${right})`;
        else if (mode === "complex") node = `_mul(${node}, ${right})`;
        else node = `(${node}*${right})`;
      }
      return node;
    };
    const parsePower = () => {
      let node = parseUnary();
      while (peek() === "^") {
        consume();
        const right = parsePower();
        if (mode === "glsl-complex") node = `c_pow(${node}, ${right})`;
        else if (mode === "complex") node = `_pow(${node}, ${right})`;
        else node = `pow(${node}, ${right})`;
      }
      return node;
    };
    const parseUnary = () => {
      if (peek() === "-") {
        consume();
        const op = parseUnary();
        if (mode === "glsl-complex") return `c_mul(vec2(-1.0,0.0), ${op})`;
        if (mode === "complex") return `_mul(-1, ${op})`;
        return `(-${op})`;
      }
      return parsePrimary();
    };
    const parsePrimary = () => {
      const t = consume();
      if (t === "(") {
        const e = parseExpression();
        consume();
        return `(${e})`;
      }
      if (funcNames.includes(t)) {
        consume();
        const argsList = [];
        argsList.push(parseExpression());
        while (peek() === ",") {
          consume();
          argsList.push(parseExpression());
        }
        consume();
        if (mode === "glsl-complex") return `c_${t}(${argsList.join(",")})`;
        if (mode === "complex") return `_${t}(${argsList.join(",")})`;
        return `${t}(${argsList.join(",")})`;
      }
      if (t === "PI") return mode === "glsl-complex" ? "vec2(3.14159265, 0.0)" : "Math.PI";
      if (t === "E") return mode === "glsl-complex" ? "vec2(2.71828182, 0.0)" : "Math.E";
      if (t === "i" && mode === "glsl-complex") return "vec2(0.0, 1.0)";
      if (t === "x" && mode === "glsl-complex") return "vec2(x, 0.0)";
      if (t === "t" && mode === "glsl-complex") return "vec2(t, 0.0)";
      if (/^\d/.test(t) && mode === "glsl-complex") {
        const val = t.includes(".") ? t : t + ".0";
        return `vec2(${val}, 0.0)`;
      }
      return t;
    };
    return parseExpression();
  };
  if (options.glsl) {
    return transpile(formulaStr, isComplex ? "glsl-complex" : "glsl-real");
  }
  try {
    if (isComplex) {
      const transpiledExpr2 = transpile(formulaStr, "complex");
      const complexArgsSetup = args.map((arg, idx) => `var ${arg} = Complex.from(arguments[${idx}]);`).join(" ");
      const functionBody2 = `
                var m_sin=Math.sin, m_cos=Math.cos, m_cosh=Math.cosh, m_sinh=Math.sinh;
                var {PI,E,pow:m_pow,sqrt:m_sqrt,abs:m_abs,log:m_log,atan2:m_atan2,exp:m_exp}=Math;
                function Complex(re, im){this.re=re;this.im=im||0;};
                Complex.from=function(v){if(v&&typeof v.re==='number')return v;return new Complex(v||0,0);};
                var _add=(a,b)=>{a=Complex.from(a);b=Complex.from(b);return new Complex(a.re+b.re,a.im+b.im);};
                var _sub=(a,b)=>{a=Complex.from(a);b=Complex.from(b);return new Complex(a.re-b.re,a.im-b.im);};
                var _mul=(a,b)=>{a=Complex.from(a);b=Complex.from(b);return new Complex(a.re*b.re-a.im*b.im,a.re*b.im+a.im*b.re);};
                var _div=(a,b)=>{a=Complex.from(a);b=Complex.from(b);var d=b.re*b.re+b.im*b.im;return d===0?new Complex(NaN,NaN):new Complex((a.re*b.re+a.im*b.im)/d,(a.im*b.re-a.re*b.im)/d);};
                var _pow=(a,b)=>{a=Complex.from(a);b=Complex.from(b);if(a.re===0&&a.im===0)return new Complex(0,0);var mag=m_sqrt(a.re*a.re+a.im*a.im),arg=m_atan2(a.im,a.re),l_re=m_log(mag),m_re=b.re*l_re-b.im*arg,m_im=b.re*arg+b.im*l_re,r=m_exp(m_re);return new Complex(r*m_cos(m_im),r*m_sin(m_im));};
                var _sin_c=(z)=>{z=Complex.from(z);return new Complex(m_sin(z.re)*m_cosh(z.im),m_cos(z.re)*m_sinh(z.im));};
                var _cos_c=(z)=>{z=Complex.from(z);return new Complex(m_cos(z.re)*m_cosh(z.im),-m_sin(z.re)*m_sinh(z.im));};
                var _tan_c=(z)=>_div(_sin_c(z),_cos_c(z));
                var _sqrt_c=(z)=>{z=Complex.from(z);var r=m_sqrt(z.re*z.re+z.im*z.im);return new Complex(m_sqrt((r+z.re)/2),m_sqrt((r-z.re)/2)*(z.im<0?-1:1));};
                var _sin=_sin_c,_cos=_cos_c,_tan=_tan_c,_sec=(z)=>_div(new Complex(1,0),_cos_c(z)),_cot=(z)=>_div(new Complex(1,0),_tan_c(z)),_cosec=(z)=>_div(new Complex(1,0),_sin_c(z)),_sqrt=_sqrt_c,_abs=(z)=>{z=Complex.from(z);return new Complex(m_sqrt(z.re*z.re+z.im*z.im),0);},_log=(z)=>{z=Complex.from(z);return new Complex(m_log(m_sqrt(z.re*z.re+z.im*z.im)),m_atan2(z.im,z.re));};
                var sin=_sin,cos=_cos,tan=_tan,sec=_sec,cot=_cot,cosec=_cosec,sqrt=_sqrt,abs=_abs,log=_log,i=new Complex(0,1);
                ${complexArgsSetup}
                try { return Complex.from(${transpiledExpr2}); } catch(e) { return null; }
            `;
      return new Function(...args, functionBody2);
    }
    const transpiledExpr = transpile(formulaStr, "real");
    const functionBody = `const {sin,cos,tan,PI,E,pow,sqrt,abs,log}=Math;const sec=(a)=>1/cos(a),cot=(a)=>1/tan(a),cosec=(a)=>1/sin(a),result=${transpiledExpr};return Number.isFinite(result)?result:null;`;
    return new Function(...args, functionBody);
  } catch (e) {
    return null;
  }
};

// src/core/generator.js
var _generateCartesianPoints = (config) => {
  const {
    formula,
    width,
    height,
    scale = 50,
    xRange,
    t = 0,
    steps,
    flat = false,
    buffer = null
  } = config;
  const numSteps = steps || width;
  const midX = width / 2;
  const midY = height / 2;
  if (flat) {
    const points2 = buffer || new Float32Array((numSteps + 1) * 2);
    for (let i = 0; i <= numSteps; i++) {
      const px = i / numSteps * width;
      const x = xRange ? xRange[0] + i / numSteps * (xRange[1] - xRange[0]) : (px - midX) / scale;
      const y = formula(x, t);
      points2[i * 2] = px;
      points2[i * 2 + 1] = y !== null && isFinite(y) ? midY - y * scale : NaN;
    }
    return points2;
  }
  const points = [];
  for (let px = 0; px <= width; px++) {
    const x = xRange ? xRange[0] + px / width * (xRange[1] - xRange[0]) : (px - midX) / scale;
    const y = formula(x, t);
    points.push(y !== null && isFinite(y) ? { x: px, y: midY - y * scale } : null);
  }
  return points;
};
var _generatePolarPoints = (config) => {
  const { formula, width, height, scale = 50, tRange = [0, 2 * Math.PI], steps = 1e3, t = 0, flat = false, buffer = null } = config;
  const midX = width / 2;
  const midY = height / 2;
  const [tMin, tMax] = tRange;
  if (flat) {
    const points2 = buffer || new Float32Array((steps + 1) * 2);
    for (let i = 0; i <= steps; i++) {
      const theta = tMin + i / steps * (tMax - tMin);
      const r = formula(theta, t);
      if (r !== null && isFinite(r)) {
        points2[i * 2] = r * Math.cos(theta) * scale + midX;
        points2[i * 2 + 1] = midY - r * Math.sin(theta) * scale;
      } else {
        points2[i * 2] = points2[i * 2 + 1] = NaN;
      }
    }
    return points2;
  }
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const theta = tMin + i / steps * (tMax - tMin);
    const r = formula(theta, t);
    points.push(r !== null && isFinite(r) ? { x: r * Math.cos(theta) * scale + midX, y: midY - r * Math.sin(theta) * scale } : null);
  }
  return points;
};
var _generateParametricPoints = (config) => {
  const { fX, fY, width, height, scale = 50, tRange = [0, 2 * Math.PI], steps = 1e3, t = 0, flat = false, buffer = null } = config;
  const midX = width / 2;
  const midY = height / 2;
  const [tMin, tMax] = tRange;
  if (flat) {
    const points2 = buffer || new Float32Array((steps + 1) * 2);
    for (let i = 0; i <= steps; i++) {
      const u = tMin + i / steps * (tMax - tMin);
      const vx = fX(u, t), vy = fY(u, t);
      if (vx !== null && vy !== null && isFinite(vx) && isFinite(vy)) {
        points2[i * 2] = midX + vx * scale;
        points2[i * 2 + 1] = midY - vy * scale;
      } else {
        points2[i * 2] = points2[i * 2 + 1] = NaN;
      }
    }
    return points2;
  }
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const u = tMin + i / steps * (tMax - tMin);
    const vx = fX(u, t), vy = fY(u, t);
    points.push(vx !== null && vy !== null && isFinite(vx) && isFinite(vy) ? { x: midX + vx * scale, y: midY - vy * scale } : null);
  }
  return points;
};
var _generateComplexPoints = (config) => {
  const { formula, width, height, scale = 50, xRange = [-10, 10], steps = 1e3, t = 0, flat = false, buffer = null } = config;
  const midX = width / 2;
  const midY = height / 2;
  const [xMin, xMax] = xRange;
  if (flat) {
    const points2 = buffer || new Float32Array((steps + 1) * 2);
    for (let i = 0; i <= steps; i++) {
      const x = xMin + i / steps * (xMax - xMin);
      const res = formula(x, t);
      if (res && typeof res.re === "number") {
        points2[i * 2] = midX + res.re * scale;
        points2[i * 2 + 1] = midY - res.im * scale;
      } else if (typeof res === "number" && isFinite(res)) {
        points2[i * 2] = midX + res * scale;
        points2[i * 2 + 1] = midY;
      } else {
        points2[i * 2] = points2[i * 2 + 1] = NaN;
      }
    }
    return points2;
  }
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const x = xMin + i / steps * (xMax - xMin);
    const res = formula(x, t);
    if (res && typeof res.re === "number") {
      points.push({ x: midX + res.re * scale, y: midY - res.im * scale });
    } else if (typeof res === "number" && isFinite(res)) {
      points.push({ x: midX + res * scale, y: midY });
    } else {
      points.push(null);
    }
  }
  return points;
};

// src/core/drawer.js
var glCache = /* @__PURE__ */ new Map();
var _drawGraph = (points, ctx, options = {}) => {
  if (!points || points.length === 0) return;
  const { lineColor = "white", lineWidth = 2 } = options;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  if (points instanceof Float32Array) {
    for (let i = 0; i < points.length; i += 2) {
      const px = points[i], py = points[i + 1];
      if (isNaN(px)) continue;
      if (i === 0 || isNaN(points[i - 2])) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
  } else {
    let started = false;
    for (const p of points) {
      if (p) {
        if (!started) {
          ctx.moveTo(p.x, p.y);
          started = true;
        } else ctx.lineTo(p.x, p.y);
      } else {
        started = false;
      }
    }
  }
  ctx.stroke();
};
var _drawGraphWebGL = (points, canvas, options = {}) => {
  const gl = canvas.getContext("webgl", { antialias: true, powerPreference: "high-performance" });
  if (!gl) return;
  const { lineColor = "white", lineWidth = 2 } = options;
  let hex = lineColor.replace("#", "");
  let rgb = [parseInt(hex.slice(0, 2), 16) / 255, parseInt(hex.slice(2, 4), 16) / 255, parseInt(hex.slice(4, 6), 16) / 255];
  let ctxCache = glCache.get(gl);
  if (!ctxCache) {
    ctxCache = { programs: /* @__PURE__ */ new Map(), buffers: /* @__PURE__ */ new Map() };
    glCache.set(gl, ctxCache);
  }
  let buffer = ctxCache.buffers.get("line_buffer");
  if (!buffer) {
    buffer = gl.createBuffer();
    ctxCache.buffers.set("line_buffer", buffer);
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, points, gl.DYNAMIC_DRAW);
  let pInfo = ctxCache.programs.get("basic_line");
  if (!pInfo) {
    const vs = `attribute vec2 a; uniform vec2 r,o; void main(){gl_Position=vec4(((a+o)/r*2.0-1.0)*vec2(1,-1),0,1);}`;
    const fs = `precision lowp float; uniform vec4 c; void main(){gl_FragColor=c;}`;
    const create = (t, s) => {
      const sh = gl.createShader(t);
      gl.shaderSource(sh, s);
      gl.compileShader(sh);
      return sh;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, create(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, create(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    pInfo = { prog, a: gl.getAttribLocation(prog, "a"), r: gl.getUniformLocation(prog, "r"), c: gl.getUniformLocation(prog, "c"), o: gl.getUniformLocation(prog, "o") };
    ctxCache.programs.set("basic_line", pInfo);
  }
  gl.useProgram(pInfo.prog);
  gl.enableVertexAttribArray(pInfo.a);
  gl.vertexAttribPointer(pInfo.a, 2, gl.FLOAT, false, 0, 0);
  gl.uniform2f(pInfo.r, canvas.width, canvas.height);
  gl.uniform4f(pInfo.c, rgb[0], rgb[1], rgb[2], 1);
  const passes = Math.min(lineWidth, 3);
  for (let i = 0; i < passes; i++) {
    gl.uniform2f(pInfo.o, (i - 1) * 0.5, (i - 1) * 0.5);
    gl.drawArrays(gl.LINE_STRIP, 0, points.length / 2);
  }
};
var _drawGraphGPUEvaluated = (glConfig, canvas, options = {}) => {
  const gl = canvas.getContext("webgl", { antialias: true, powerPreference: "high-performance" });
  if (!gl) return;
  const { formulaGLSL, t, steps = 1e3, scale = 50, lineColor = "white" } = glConfig;
  let ctxCache = glCache.get(gl);
  if (!ctxCache) {
    ctxCache = { programs: /* @__PURE__ */ new Map(), buffers: /* @__PURE__ */ new Map() };
    glCache.set(gl, ctxCache);
  }
  const glslLib = `
        precision highp float;
        float sinh(float x) { return (exp(x) - exp(-x)) * 0.5; }
        float cosh(float x) { return (exp(x) + exp(-x)) * 0.5; }
        vec2 c_add(vec2 a, vec2 b) { return a + b; }
        vec2 c_sub(vec2 a, vec2 b) { return a - b; }
        vec2 c_mul(vec2 a, vec2 b) { return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x); }
        vec2 c_div(vec2 a, vec2 b) { float d = dot(b, b); return vec2(dot(a, b), a.y*b.x - a.x*b.y) / d; }
        vec2 c_exp(vec2 z) { return exp(z.x) * vec2(cos(z.y), sin(z.y)); }
        vec2 c_sin(vec2 z) { return vec2(sin(z.x) * cosh(z.y), cos(z.x) * sinh(z.y)); }
        vec2 c_cos(vec2 z) { return vec2(cos(z.x) * cosh(z.y), -sin(z.x) * sinh(z.y)); }
        vec2 c_log(vec2 z) { return vec2(log(length(z)), atan(z.y, z.x)); }
        vec2 c_pow(vec2 a, vec2 b) { if(length(a) == 0.0) return vec2(0.0); return c_exp(c_mul(b, c_log(a))); }
        vec2 c_sqrt(vec2 z) { float r = length(z); return vec2(sqrt((r+z.x)/2.0), sqrt((r-z.x)/2.0) * (z.y < 0.0 ? -1.0 : 1.0)); }
    `;
  const vsSource = `
        attribute float aIdx;
        uniform float uT, uSteps, uScale;
        uniform vec2 uRes;
        ${glslLib}
        void main() {
            float x = (aIdx / uSteps) * 20.0 - 10.0;
            float t = uT;
            vec2 res = ${formulaGLSL}; 
            vec2 pos = res * uScale;
            vec2 clip = ((pos + uRes/2.0) / uRes) * 2.0 - 1.0;
            gl_Position = vec4(clip * vec2(1, -1), 0, 1);
            gl_PointSize = 2.0;
        }
    `;
  const fsSource = `precision mediump float; uniform vec4 uCol; void main() { gl_FragColor = uCol; }`;
  let pInfo = ctxCache.programs.get(formulaGLSL);
  if (!pInfo) {
    const create = (t2, s) => {
      const sh = gl.createShader(t2);
      gl.shaderSource(sh, s);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.error("Shader:", gl.getShaderInfoLog(sh));
      return sh;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, create(gl.VERTEX_SHADER, vsSource));
    gl.attachShader(prog, create(gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(prog);
    pInfo = {
      prog,
      aIdx: gl.getAttribLocation(prog, "aIdx"),
      uT: gl.getUniformLocation(prog, "uT"),
      uSteps: gl.getUniformLocation(prog, "uSteps"),
      uScale: gl.getUniformLocation(prog, "uScale"),
      uRes: gl.getUniformLocation(prog, "uRes"),
      uCol: gl.getUniformLocation(prog, "uCol")
    };
    ctxCache.programs.set(formulaGLSL, pInfo);
  }
  let idxBuffer = ctxCache.buffers.get("static_indices");
  if (!idxBuffer) {
    const indices = new Float32Array(2e4);
    for (let i = 0; i < 2e4; i++) indices[i] = i;
    idxBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, idxBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    ctxCache.buffers.set("static_indices", idxBuffer);
  }
  gl.useProgram(pInfo.prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, idxBuffer);
  gl.enableVertexAttribArray(pInfo.aIdx);
  gl.vertexAttribPointer(pInfo.aIdx, 1, gl.FLOAT, false, 0, 0);
  gl.uniform1f(pInfo.uT, t);
  gl.uniform1f(pInfo.uSteps, steps);
  gl.uniform1f(pInfo.uScale, scale);
  gl.uniform2f(pInfo.uRes, canvas.width, canvas.height);
  let hex = lineColor.replace("#", "");
  let rgb = [parseInt(hex.slice(0, 2), 16) / 255, parseInt(hex.slice(2, 4), 16) / 255, parseInt(hex.slice(4, 6), 16) / 255];
  gl.uniform4f(pInfo.uCol, rgb[0], rgb[1], rgb[2], 1);
  gl.drawArrays(gl.LINE_STRIP, 0, Math.min(steps, 2e4));
};

// src/core/enhancer.js
var drawAxis = (ctx, width, height) => {
  const w = width || ctx.canvas.width;
  const h = height || ctx.canvas.height;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w / 2, h);
  let xLabel = "x-axis";
  let yLabel = "y-axis";
  ctx.font = "12px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(xLabel, w - 50, h / 2 - 10);
  ctx.fillText(yLabel, w / 2 + 10, 20);
  ctx.stroke();
};
var drawGrid = (ctx, width, height, gridSpacing = 50, lineColor = "#555555", lineWidth = 0.5) => {
  const w = width || ctx.canvas.width;
  const h = height || ctx.canvas.height;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  for (let x = gridSpacing; x < w; x += gridSpacing) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = gridSpacing; y < h; y += gridSpacing) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();
};
var addText = (ctx, text, config = {}) => {
  const {
    point = null,
    color = "white",
    font = "16px Arial",
    scale = 50
  } = config;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  let canvasX, canvasY;
  if (!point || point.length < 2) {
    canvasX = 5;
    canvasY = 5;
  } else {
    canvasX = w / 2 + point[0] * scale;
    canvasY = h / 2 - point[1] * scale;
  }
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textBaseLine = "top";
  ctx.textAlign = "left";
  ctx.fillText(text, canvasX, canvasY);
};
var findRoots = (formula, range = [-10, 10], steps = 1e3, t = 0, precision = 1e-7) => {
  const [min, max] = range;
  const dx = (max - min) / steps;
  const res = { xRoots: [], yRoots: [], iotaRoots: [] };
  const isComplex = typeof formula === "string" && /\b(i)\b/.test(formula);
  const f = typeof formula === "string" ? _createFormula(formula, ["x", "t"], { complex: isComplex }) : formula;
  if (!f) return res;
  const getVal = (x) => {
    const v = f(x, t);
    return v && typeof v.re !== "undefined" ? v : { re: v, im: 0 };
  };
  for (let i = 0; i < steps; i++) {
    let x1 = min + i * dx, x2 = min + (i + 1) * dx;
    let v1 = getVal(x1), v2 = getVal(x2);
    let target1 = v1.im === 0 && v2.im === 0 ? v1.re : v1.im;
    let target2 = v1.im === 0 && v2.im === 0 ? v2.re : v2.im;
    if (target1 * target2 <= 0 && !isNaN(target1) && !isNaN(target2)) {
      let a = x1, b = x2, ya = target1;
      while (b - a > precision) {
        let mid = (a + b) / 2, vm = getVal(mid);
        let ym = v1.im === 0 && v2.im === 0 ? vm.re : vm.im;
        if (Math.abs(ym) < precision) {
          a = b = mid;
          break;
        }
        if (ya * ym < 0) {
          b = mid;
        } else {
          a = mid;
          ya = ym;
        }
      }
      res.xRoots.push((a + b) / 2);
    }
    if (v1.re * v2.re <= 0 && !isNaN(v1.re) && !isNaN(v2.re)) {
      let a = x1, b = x2, xa = v1.re;
      while (b - a > precision) {
        let mid = (a + b) / 2, xm = getVal(mid).re;
        if (Math.abs(xm) < precision) {
          a = b = mid;
          break;
        }
        if (xa * xm < 0) {
          b = mid;
        } else {
          a = mid;
          xa = xm;
        }
      }
      res.iotaRoots.push((a + b) / 2);
    }
  }
  if (min <= 0 && max >= 0) {
    const valAtZero = getVal(0);
    res.yRoots.push(valAtZero.re);
  }
  const clean = (arr) => arr.filter((v, i, a) => i === 0 || Math.abs(v - a[i - 1]) > precision * 2);
  res.xRoots = clean(res.xRoots);
  res.iotaRoots = clean(res.iotaRoots);
  return res;
};
var drawRoots = (ctx, roots, config) => {
  const {
    type = "cartesian",
    formula,
    // Main formula (Cartesian/Complex string or function)
    formulaX,
    // For parametric
    formulaY,
    // For parametric
    width,
    height,
    scale = 50,
    xColor = "#ff4747",
    yColor = "#4775ff",
    iotaColor = "#ffff00",
    radius = 5
  } = config;
  const w = width || ctx.canvas.width;
  const h = height || ctx.canvas.height;
  const centerX = w / 2;
  const centerY = h / 2;
  const compile = (f2, isComplex) => typeof f2 === "string" ? _createFormula(f2, ["x", "t"], { complex: isComplex }) : f2;
  const f = compile(formula, formula && /\b(i)\b/.test(formula));
  const fX = compile(formulaX, false);
  const fY = compile(formulaY, false);
  const plot = (xVal, yVal, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(centerX + xVal * scale, centerY - yVal * scale, radius, 0, Math.PI * 2);
    ctx.fill();
  };
  if (type === "parametric") {
    if (fX) roots.xRoots.forEach((t) => {
      const v = fX(t, 0);
      if (v !== null) plot(v, 0, xColor);
    });
    if (fY) roots.iotaRoots.forEach((t) => {
      const v = fY(t, 0);
      if (v !== null) plot(0, v, yColor);
    });
  } else if (type === "complex") {
    roots.xRoots.forEach((t) => {
      const val = f(t, 0);
      if (val && typeof val.re !== "undefined") plot(val.re, val.im, xColor);
    });
    roots.iotaRoots.forEach((t) => {
      const val = f(t, 0);
      if (val && typeof val.re !== "undefined") plot(val.re, val.im, iotaColor);
    });
  } else {
    roots.xRoots.forEach((x) => plot(x, 0, xColor));
    roots.yRoots.forEach((y) => plot(0, y, yColor));
  }
};
var findExtrema = (formula, range = [-10, 10], steps = 1e3, t = 0) => {
  const [min, max] = range;
  const dx = (max - min) / steps;
  const res = { maxima: [], minima: [] };
  const isComplex = typeof formula === "string" && /\b(i)\b/.test(formula);
  const f = typeof formula === "string" ? _createFormula(formula, ["x", "t"], { complex: isComplex }) : formula;
  if (!f) return res;
  const getVal = (x) => {
    const v = f(x, t);
    return v && typeof v.re !== "undefined" ? v.re : v;
  };
  let prevY = getVal(min);
  let currY = getVal(min + dx);
  for (let i = 2; i <= steps; i++) {
    let x = min + i * dx;
    let nextY = getVal(x);
    if (currY > prevY && currY > nextY) {
      res.maxima.push({ x: x - dx, y: currY });
    } else if (currY < prevY && currY < nextY) {
      res.minima.push({ x: x - dx, y: currY });
    }
    prevY = currY;
    currY = nextY;
  }
  return res;
};
var drawExtrema = (ctx, extrema, config) => {
  const {
    width,
    height,
    scale = 50,
    maxColor = "#ffcf47",
    minColor = "#47ffcf",
    radius = 5
  } = config;
  const w = width || ctx.canvas.width;
  const h = height || ctx.canvas.height;
  const centerX = w / 2;
  const centerY = h / 2;
  const plot = (p, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(centerX + p.x * scale, centerY - p.y * scale, radius, 0, Math.PI * 2);
    ctx.fill();
  };
  extrema.maxima.forEach((p) => plot(p, maxColor));
  extrema.minima.forEach((p) => plot(p, minColor));
};
var showCoordinates = (canvas, config = {}) => {
  const {
    scale = 50,
    color = "#ffffff",
    font = "12px monospace"
  } = config;
  if (canvas.dataset.hasCoordinates) return () => {
  };
  canvas.dataset.hasCoordinates = "true";
  let wrapper = canvas.parentElement;
  if (!wrapper || !wrapper.classList.contains("graphlyjs-wrapper")) {
    wrapper = document.createElement("div");
    wrapper.classList.add("graphlyjs-wrapper");
    wrapper.style.position = "relative";
    wrapper.style.display = "inline-block";
    canvas.parentNode.insertBefore(wrapper, canvas);
    wrapper.appendChild(canvas);
  }
  const overlay = document.createElement("canvas");
  const oCtx = overlay.getContext("2d");
  overlay.style.position = "absolute";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.pointerEvents = "none";
  overlay.style.zIndex = "10";
  wrapper.appendChild(overlay);
  const syncOverlay = () => {
    const rect = canvas.getBoundingClientRect();
    overlay.width = canvas.width;
    overlay.height = canvas.height;
    overlay.style.width = rect.width + "px";
    overlay.style.height = rect.height + "px";
  };
  syncOverlay();
  const ro = new ResizeObserver(() => syncOverlay());
  ro.observe(canvas);
  const originalCursor = canvas.style.cursor;
  canvas.style.cursor = "crosshair";
  const handleMouseMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    const mathX = ((mouseX - canvas.width / 2) / scale).toFixed(2);
    const mathY = ((canvas.height / 2 - mouseY) / scale).toFixed(2);
    oCtx.clearRect(0, 0, overlay.width, overlay.height);
    oCtx.save();
    oCtx.strokeStyle = color;
    oCtx.setLineDash([2, 2]);
    oCtx.globalAlpha = 0.4;
    oCtx.beginPath();
    oCtx.moveTo(mouseX, 0);
    oCtx.lineTo(mouseX, canvas.height);
    oCtx.moveTo(0, mouseY);
    oCtx.lineTo(canvas.width, mouseY);
    oCtx.stroke();
    oCtx.globalAlpha = 1;
    oCtx.fillStyle = color;
    oCtx.font = font;
    const textOffset = 4;
    let textX = mouseX + textOffset;
    let textY = mouseY - textOffset;
    if (textX > canvas.width - 80) textX = mouseX - 85;
    if (textY < 20) textY = mouseY + 20;
    oCtx.fillText(`(${mathX}, ${mathY})`, textX, textY);
    oCtx.restore();
  };
  const handleMouseLeave = () => {
    oCtx.clearRect(0, 0, overlay.width, overlay.height);
  };
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseleave", handleMouseLeave);
  return () => {
    ro.disconnect();
    canvas.removeEventListener("mousemove", handleMouseMove);
    canvas.removeEventListener("mouseleave", handleMouseLeave);
    canvas.style.cursor = originalCursor;
    if (wrapper.contains(overlay)) {
      wrapper.removeChild(overlay);
    }
    delete canvas.dataset.hasCoordinates;
  };
};

// src/core/index.js
function createGraphlyjs(adapter) {
  const { createCanvas: createCanvas2, requestAnimationFrame, cancelAnimationFrame } = adapter;
  return {
    createCanvas: createCanvas2,
    _createFormula,
    _generateCartesianPoints,
    _generatePolarPoints,
    _generateParametricPoints,
    _generateComplexPoints,
    _drawGraph,
    _drawGraphWebGL,
    _drawGraphGPUEvaluated,
    drawAxis,
    drawGrid,
    addText,
    findRoots,
    drawRoots,
    findExtrema,
    drawExtrema,
    showCoordinates,
    //Method 1: draaw Cartesian graph
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
        console.error("1. GraphlyJs error: formula string required");
        return null;
      }
      ;
      const formula = _createFormula(formulaStr, ["x", "t"]);
      if (!formula) {
        console.error("2. GraphlyJs error: there was problem in converting formula string into actual formula");
        return null;
      }
      ;
      const canvas = existingCanvas || createCanvas2(width, height);
      if (!existingCanvas && canvas.style) {
        canvas.style.backgroundColor = bgColor;
      }
      ;
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
      _drawGraph(
        points,
        ctx,
        { lineColor, lineWidth }
      );
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
        console.error("1. GraphlyJs error: formula string required");
        return null;
      }
      ;
      const formula = _createFormula(formulaStr, ["x", "t"]);
      if (!formula) {
        console.error("2. GraphlyJs error: there was problem in converting formula string into actual formula");
        return null;
      }
      ;
      const canvas = existingCanvas || createCanvas2(width, height);
      if (!existingCanvas && canvas.style) {
        canvas.style.backgroundColor = bgColor;
      }
      ;
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
      _drawGraph(
        points,
        ctx,
        { lineColor, lineWidth }
      );
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
        console.error("1. GraphlyJs error: formula string required");
        return null;
      }
      ;
      const fX = _createFormula(formulaXStr, ["x", "t"]);
      const fY = _createFormula(formulaYStr, ["x", "t"]);
      if (!fX || !fY) {
        console.error("2. GraphlyJs error: there was problem in converting formula string into actual formula");
        return null;
      }
      ;
      const canvas = existingCanvas || createCanvas2(width, height);
      if (!existingCanvas && canvas.style) {
        canvas.style.backgroundColor = bgColor;
      }
      ;
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
        console.error("1. GraphlyJs error: formula string required");
        return null;
      }
      ;
      const formula = _createFormula(
        formulaStr,
        ["x", "t"],
        { complex: true }
      );
      if (!formula) {
        console.error("2. GraphlyJs error: there was problem in converting formula string into actual formula");
        return null;
      }
      ;
      const canvas = existingCanvas || createCanvas2(width, height);
      if (!existingCanvas && canvas.style) {
        canvas.style.backgroundColor = bgColor;
      }
      ;
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
      const { layers = [], canvas: existingCanvas, width = 500, height = 500, bgColor = "black", scale = 50, duration = Infinity, showAxis = true, showGrid = true, gpu = false } = config;
      const animationLayers = layers.length > 0 ? layers : [config];
      const canvas = existingCanvas || createCanvas2(width, height);
      const cw = canvas.width || width, ch = canvas.height || height;
      let uiCanvas = null, uiCtx = null;
      if (gpu) {
        uiCanvas = createCanvas2(cw, ch);
        uiCanvas.style.position = "absolute";
        uiCanvas.style.left = "0";
        uiCanvas.style.top = "0";
        uiCanvas.style.pointerEvents = "none";
        canvas.style.position = "relative";
        if (canvas.parentElement) {
          canvas.parentElement.style.position = "relative";
          canvas.parentElement.appendChild(uiCanvas);
        }
        uiCtx = uiCanvas.getContext("2d");
      }
      const ctx = gpu ? uiCtx : canvas.getContext("2d");
      if (!existingCanvas && canvas.style) canvas.style.backgroundColor = bgColor;
      const compiledLayers = animationLayers.map((layer) => {
        const lType = layer.type || "cartesian";
        const lSteps = layer.steps || config.steps || 1e3;
        const formulaGLSL = _createFormula(layer.formulaStr, ["x", "t"], { glsl: true, complex: true });
        let formula, fX, fY;
        if (lType === "parametric") {
          fX = _createFormula(layer.formulaXStr, ["x", "t"]);
          fY = _createFormula(layer.formulaYStr, ["x", "t"]);
        } else {
          const isComplex = lType === "complex" || layer.formulaStr && /\b(i)\b/.test(layer.formulaStr);
          formula = _createFormula(layer.formulaStr, ["x", "t"], { complex: isComplex });
        }
        return { ...layer, type: lType, formula, fX, fY, formulaGLSL, buffer: gpu ? new Float32Array((lSteps + 1) * 2) : null };
      });
      let startTime = null, animationId = null;
      const renderFrame = (timeStamp) => {
        if (!startTime) startTime = timeStamp;
        const elapsed = timeStamp - startTime;
        if (elapsed > duration) {
          cancelAnimationFrame(animationId);
          return;
        }
        if (gpu) {
          const gl = canvas.getContext("webgl");
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
          uiCtx.clearRect(0, 0, cw, ch);
          if (showGrid) drawGrid(uiCtx, cw, ch, 50);
          if (showAxis) drawAxis(uiCtx, cw, ch);
        } else {
          ctx.clearRect(0, 0, cw, ch);
          if (showGrid) drawGrid(ctx, cw, ch, 50);
          if (showAxis) drawAxis(ctx, cw, ch);
        }
        compiledLayers.forEach((layer) => {
          const t = elapsed / 1e3 * (layer.speed || 1);
          const genConfig = { ...config, ...layer, width: cw, height: ch, t, flat: gpu, buffer: layer.buffer };
          if (gpu && layer.formulaGLSL && layer.type === "complex") {
            _drawGraphGPUEvaluated({
              formulaGLSL: layer.formulaGLSL,
              t,
              steps: layer.steps || 1e3,
              scale: layer.scale || config.scale || 50,
              lineColor: layer.lineColor || "white"
            }, canvas);
            return;
          }
          let points;
          if (layer.type === "polar") points = _generatePolarPoints(genConfig);
          else if (layer.type === "parametric") points = _generateParametricPoints(genConfig);
          else if (layer.type === "complex") points = _generateComplexPoints(genConfig);
          else points = _generateCartesianPoints(genConfig);
          if (gpu) _drawGraphWebGL(points, canvas, { lineColor: layer.lineColor || "white", lineWidth: layer.lineWidth || 2 });
          else _drawGraph(points, ctx, { lineColor: layer.lineColor || "white", lineWidth: layer.lineWidth || 2 });
        });
        if (config.onFrame) config.onFrame(gpu ? uiCtx : ctx, elapsed / 1e3 * (config.speed || 1));
        animationId = requestAnimationFrame(renderFrame);
      };
      animationId = requestAnimationFrame(renderFrame);
      return { canvas, stop: () => cancelAnimationFrame(animationId) };
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
var Graphlyjs = createGraphlyjs(nodeAdapter);
var index_node_default = Graphlyjs;
export {
  index_node_default as default
};
