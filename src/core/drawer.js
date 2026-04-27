const glCache = new Map();
const bufferCache = new Map();

export const _drawGraph = (points, ctx, options = {}) => {
    if (!points || points.length === 0) return;
    const { lineColor = 'white', lineWidth = 2 } = options;
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    if (points instanceof Float32Array) {
        for (let i = 0; i < points.length; i += 2) {
            const px = points[i], py = points[i+1];
            if (isNaN(px)) continue;
            if (i === 0 || isNaN(points[i-2])) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
    } else {
        let started = false;
        for (const p of points) {
            if (p) {
                if (!started) { ctx.moveTo(p.x, p.y); started = true; }
                else ctx.lineTo(p.x, p.y);
            } else { started = false; }
        }
    }
    ctx.stroke();
};

export const _drawGraphWebGL = (points, canvas, options = {}) => {
    const gl = canvas.getContext('webgl', { antialias: true, powerPreference: 'high-performance' });
    if (!gl) return;
    const { lineColor = 'white', lineWidth = 2 } = options;
    let hex = lineColor.replace('#', '');
    let rgb = [parseInt(hex.slice(0,2),16)/255, parseInt(hex.slice(2,4),16)/255, parseInt(hex.slice(4,6),16)/255];
    let ctxCache = glCache.get(gl);
    if (!ctxCache) { ctxCache = { programs: new Map(), buffers: new Map() }; glCache.set(gl, ctxCache); }
    let buffer = ctxCache.buffers.get('line_buffer');
    if (!buffer) { buffer = gl.createBuffer(); ctxCache.buffers.set('line_buffer', buffer); }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.DYNAMIC_DRAW);
    let pInfo = ctxCache.programs.get('basic_line');
    if (!pInfo) {
        const vs = `attribute vec2 a; uniform vec2 r,o; void main(){gl_Position=vec4(((a+o)/r*2.0-1.0)*vec2(1,-1),0,1);}`;
        const fs = `precision lowp float; uniform vec4 c; void main(){gl_FragColor=c;}`;
        const create = (t, s) => { 
            const sh = gl.createShader(t); gl.shaderSource(sh,s); gl.compileShader(sh); 
            return sh; 
        };
        const prog = gl.createProgram();
        gl.attachShader(prog, create(gl.VERTEX_SHADER, vs));
        gl.attachShader(prog, create(gl.FRAGMENT_SHADER, fs));
        gl.linkProgram(prog);
        pInfo = { prog, a: gl.getAttribLocation(prog, "a"), r: gl.getUniformLocation(prog, "r"), c: gl.getUniformLocation(prog, "c"), o: gl.getUniformLocation(prog, "o") };
        ctxCache.programs.set('basic_line', pInfo);
    }
    gl.useProgram(pInfo.prog);
    gl.enableVertexAttribArray(pInfo.a);
    gl.vertexAttribPointer(pInfo.a, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(pInfo.r, canvas.width, canvas.height);
    gl.uniform4f(pInfo.c, rgb[0], rgb[1], rgb[2], 1.0);
    const passes = Math.min(lineWidth, 3);
    for (let i = 0; i < passes; i++) {
        gl.uniform2f(pInfo.o, (i-1)*0.5, (i-1)*0.5);
        gl.drawArrays(gl.LINE_STRIP, 0, points.length / 2);
    }
};

export const _drawGraphGPUEvaluated = (glConfig, canvas, options = {}) => {
    const gl = canvas.getContext('webgl', { antialias: true, powerPreference: 'high-performance' });
    if (!gl) return;

    const { formulaGLSL, t, steps = 1000, scale = 50, lineColor = 'white' } = glConfig;

    let ctxCache = glCache.get(gl);
    if (!ctxCache) { ctxCache = { programs: new Map(), buffers: new Map() }; glCache.set(gl, ctxCache); }

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
        const create = (t, s) => { 
            const sh = gl.createShader(t); gl.shaderSource(sh,s); gl.compileShader(sh); 
            if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.error("Shader:", gl.getShaderInfoLog(sh));
            return sh; 
        };
        const prog = gl.createProgram();
        gl.attachShader(prog, create(gl.VERTEX_SHADER, vsSource));
        gl.attachShader(prog, create(gl.FRAGMENT_SHADER, fsSource));
        gl.linkProgram(prog);
        pInfo = { 
            prog, aIdx: gl.getAttribLocation(prog, "aIdx"),
            uT: gl.getUniformLocation(prog, "uT"), uSteps: gl.getUniformLocation(prog, "uSteps"),
            uScale: gl.getUniformLocation(prog, "uScale"), uRes: gl.getUniformLocation(prog, "uRes"),
            uCol: gl.getUniformLocation(prog, "uCol")
        };
        ctxCache.programs.set(formulaGLSL, pInfo);
    }

    let idxBuffer = ctxCache.buffers.get('static_indices');
    if (!idxBuffer) {
        const indices = new Float32Array(20000);
        for(let i=0; i<20000; i++) indices[i] = i;
        idxBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, idxBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        ctxCache.buffers.set('static_indices', idxBuffer);
    }

    gl.useProgram(pInfo.prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, idxBuffer);
    gl.enableVertexAttribArray(pInfo.aIdx);
    gl.vertexAttribPointer(pInfo.aIdx, 1, gl.FLOAT, false, 0, 0);
    gl.uniform1f(pInfo.uT, t);
    gl.uniform1f(pInfo.uSteps, steps);
    gl.uniform1f(pInfo.uScale, scale);
    gl.uniform2f(pInfo.uRes, canvas.width, canvas.height);
    let hex = lineColor.replace('#', '');
    let rgb = [parseInt(hex.slice(0,2),16)/255, parseInt(hex.slice(2,4),16)/255, parseInt(hex.slice(4,6),16)/255];
    gl.uniform4f(pInfo.uCol, rgb[0], rgb[1], rgb[2], 1.0);
    gl.drawArrays(gl.LINE_STRIP, 0, Math.min(steps, 20000));
};
