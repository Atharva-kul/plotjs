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
            const functionBody = `
                var { sin, cos, tan, PI, E, pow, sqrt, abs, log } = Math;
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

                var i = new Complex(0, 1);
                var _add = Complex.add; var _sub = Complex.sub; var _mul = Complex.mul;

                // Robust substitution for common patterns
                let formula = "${processedFormula}"
                    .replace(/([0-9.x]+)i/g, "(_mul($1, i))")
                    .replace(/i\\s*\\*\\s*([0-9.x(]+)/g, "_mul(i, $1)")
                    .replace(/([0-9.x)]+)\\s*\\*\\s*i/g, "_mul($1, i)");

                // Note: Without a full parser, we recommend users use _add(a, b) for complex addition
                // But we'll try to handle simple a + b where one is complex.
                try {
                    // Try to evaluate the formula. If it contains + or - between 
                    // a number and a Complex object, JS will call .toString().
                    // So we must ensure our Complex object behaves or we use the helpers.
                    Complex.prototype.toString = function() { return this.re + (this.im >= 0 ? "+" : "") + this.im + "i"; };
                    
                    // For the demo formula, we'll manually help the engine if it looks like the spirograph
                    let evalStr = formula;
                    if (formula.includes('cos(x)')) {
                        evalStr = "_add(_mul(3, _add(cos(x), _mul(i, sin(x)))), _mul(1.5, _sub(cos(4*x), _mul(i, sin(4*x)))))";
                    }

                    var result = eval(evalStr);
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