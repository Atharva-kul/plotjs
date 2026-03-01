export const _createFormula = (formulaStr, args, options = {}) => {
    const isComplex = options.complex === true;
    
    // 1. Security Check (added 'i' to allowed characters)
    const allowedPattern = /^(?:[xti0-9.+\-/*^()\s]|sin|cos|tan|sec|cot|cosec|pow|sqrt|abs|log|PI|E|\^)+$/;
    if (!allowedPattern.test(formulaStr)) {
        console.error(`Plotjs Security Error: The formula "${formulaStr}" contains unauthorized characters.`);
        return null;
    }

    try {
        const processedFormula = formulaStr.replace(/\^/g, '**');

        if (isComplex) {
            // --- Internal Complex Transpiler ---
            const transpile = (formula) => {
                const tokens = formula.match(/[0-9.]+|sin|cos|tan|cosec|sec|cot|[xti]|\+|\-|\*|\/|\(|\)|\^/g);
                if (!tokens) return formula;
                let pos = 0;
                const peek = () => tokens[pos];
                const consume = () => tokens[pos++];

                const parsePrimary = () => {
                    let t = consume();
                    if (t === '(') {
                        let res = parseExpr();
                        consume(); // )
                        return res;
                    }
                    if (['sin', 'cos', 'tan', 'cosec', 'sec', 'cot'].includes(t)) {
                        consume(); // (
                        let arg = parseExpr();
                        consume(); // )
                        return `${t}(${arg})`;
                    }
                    return t;
                };

                const parseFactor = () => {
                    let node = parsePrimary();
                    // Handle shorthand: 3i, 3x, (x+1)i
                    while (['i', 'x', 't'].includes(peek())) {
                        node = `_mul(${node},${consume()})`;
                    }
                    return node;
                };

                const parseTerm = () => {
                    let node = parseFactor();
                    while (peek() === '*' || peek() === '/') {
                        let op = consume();
                        let right = parseFactor();
                        node = op === '*' ? `_mul(${node},${right})` : `_div(${node},${right})`;
                    }
                    return node;
                };

                const parseExpr = () => {
                    let node = parseTerm();
                    while (peek() === '+' || peek() === '-') {
                        let op = consume();
                        let right = parseTerm();
                        node = op === '+' ? `_add(${node},${right})` : `_sub(${node},${right})`;
                    }
                    return node;
                };

                try { return parseExpr(); } catch (e) { return formula; }
            };

            const transpiledExpr = transpile(processedFormula);

            const functionBody = `
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
            return new Function(...args, functionBody);
        }

        // Standard Real Mode
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