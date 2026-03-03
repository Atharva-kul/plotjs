export const _createFormula = (formulaStr, args, options = {}) => {
    const isComplex = options.complex === true;

    // Security check
    const allowedPattern =
        /^(?:[xti0-9.+\-/*^(),\s]|sin|cos|tan|sec|cot|cosec|pow|sqrt|abs|log|PI|E)+$/;

    if (!allowedPattern.test(formulaStr)) {
        console.error(`Plotjs Security Error: The formula "${formulaStr}" contains unauthorized characters.`);
        return null;
    }

    const transpile = (formula, isComplexMode) => {
        const funcNames = ['sin','cos','tan','cosec','sec','cot','pow','sqrt','abs','log'];

        const tokens = formula.match(
            /sin|cos|tan|cosec|sec|cot|pow|sqrt|abs|log|PI|E|[xti]|\d*\.?\d+|\+|\-|\*|\/|\^|\(|\)|,/g
        );

        if (!tokens) return formula;

        let pos = 0;
        const peek = () => tokens[pos];
        const consume = () => tokens[pos++];

        const isImplicitMulToken = (tok) => {
            return (
                tok === '(' ||
                tok === 'x' ||
                tok === 't' ||
                tok === 'i' ||
                tok === 'PI' ||
                tok === 'E' ||
                funcNames.includes(tok)
            );
        };

        const parseExpression = () => {
            let node = parseTerm();
            while (peek() === '+' || peek() === '-') {
                const op = consume();
                const right = parseTerm();
                node = isComplexMode
                    ? (op === '+' ? `_add(${node},${right})` : `_sub(${node},${right})`)
                    : `(${node}${op}${right})`;
            }
            return node;
        };

        const parseTerm = () => {
            let node = parseFactor();
            while (peek() === '*' || peek() === '/') {
                const op = consume();
                const right = parseFactor();
                node = isComplexMode
                    ? (op === '*' ? `_mul(${node},${right})` : `_div(${node},${right})`)
                    : `(${node}${op}${right})`;
            }
            return node;
        };

        const parseFactor = () => {
            let node = parsePower();

            // Controlled implicit multiplication
            while (pos < tokens.length && isImplicitMulToken(peek())) {
                const right = parsePower();
                node = isComplexMode
                    ? `_mul(${node},${right})`
                    : `(${node}*${right})`;
            }

            return node;
        };

        const parsePower = () => {
            let node = parseUnary();
            while (peek() === '^') {
                consume();
                const right = parsePower(); // right associative
                node = isComplexMode
                    ? `_pow(${node},${right})`
                    : `pow(${node},${right})`;
            }
            return node;
        };

        const parseUnary = () => {
            if (peek() === '-') {
                consume();
                const operand = parseUnary();
                return isComplexMode
                    ? `_mul(-1,${operand})`
                    : `(-${operand})`;
            }
            return parsePrimary();
        };

        const parsePrimary = () => {
            const t = consume();

            if (t === '(') {
                const expr = parseExpression();
                consume(); // ')'
                return `(${expr})`;
            }

            if (funcNames.includes(t)) {
                consume(); // '('
                const argsList = [];
                argsList.push(parseExpression());
                while (peek() === ',') {
                    consume();
                    argsList.push(parseExpression());
                }
                consume(); // ')'
                return isComplexMode
                    ? `_${t}(${argsList.join(',')})`
                    : `${t}(${argsList.join(',')})`;
            }

            if (t === 'PI' || t === 'E') {
                return isComplexMode ? `Math.${t}` : t;
            }

            return t; // numbers, x, t, i
        };

        return parseExpression();
    };

    try {
        if (isComplex) {
            const transpiledExpr = transpile(formulaStr, true);
            const complexArgsSetup = args
                .map((arg, idx) => `var ${arg} = Complex.from(arguments[${idx}]);`)
                .join(' ');

            const functionBody = `
                var Complex = function(re, im) { this.re = re; this.im = im || 0; };
                Complex.from = function(v) {
                    if (v instanceof Complex) return v;
                    if (typeof v === 'number') return new Complex(v, 0);
                    return new Complex(0, 0);
                };

                Complex.add = function(a,b){ a=Complex.from(a); b=Complex.from(b); return new Complex(a.re+b.re,a.im+b.im); };
                Complex.sub = function(a,b){ a=Complex.from(a); b=Complex.from(b); return new Complex(a.re-b.re,a.im-b.im); };
                Complex.mul = function(a,b){
                    a=Complex.from(a); b=Complex.from(b);
                    return new Complex(a.re*b.re - a.im*b.im, a.re*b.im + a.im*b.re);
                };
                Complex.div = function(a,b){
                    a=Complex.from(a); b=Complex.from(b);
                    var d = b.re*b.re + b.im*b.im;
                    if(d===0) return new Complex(NaN,NaN);
                    return new Complex(
                        (a.re*b.re + a.im*b.im)/d,
                        (a.im*b.re - a.re*b.im)/d
                    );
                };

                Complex.exp = function(z){
                    z=Complex.from(z);
                    var r = Math.exp(z.re);
                    return new Complex(r*Math.cos(z.im), r*Math.sin(z.im));
                };

                Complex.log = function(z){
                    z=Complex.from(z);
                    return new Complex(
                        Math.log(Math.sqrt(z.re*z.re + z.im*z.im)),
                        Math.atan2(z.im,z.re)
                    );
                };

                Complex.pow = function(a,b){
                    a=Complex.from(a); b=Complex.from(b);
                    if(a.re===0 && a.im===0) return new Complex(0,0);
                    return Complex.exp(Complex.mul(b, Complex.log(a)));
                };

                var _add=Complex.add,_sub=Complex.sub,_mul=Complex.mul,_div=Complex.div,_pow=Complex.pow;

                var _sin = (z)=>{ z=Complex.from(z); return new Complex(Math.sin(z.re)*Math.cosh(z.im), Math.cos(z.re)*Math.sinh(z.im)); };
                var _cos = (z)=>{ z=Complex.from(z); return new Complex(Math.cos(z.re)*Math.cosh(z.im), -Math.sin(z.re)*Math.sinh(z.im)); };
                var _tan = (z)=>_div(_sin(z),_cos(z));
                var _sqrt=(z)=>{
                    z=Complex.from(z);
                    var r=Math.sqrt(z.re*z.re+z.im*z.im);
                    var re=Math.sqrt((r+z.re)/2);
                    var im=Math.sqrt((r-z.re)/2)*(z.im<0?-1:1);
                    return new Complex(re,im);
                };
                var _abs=(z)=>{ z=Complex.from(z); return new Complex(Math.sqrt(z.re*z.re+z.im*z.im),0); };
                var _log=Complex.log;
                var _sec=(z)=>_div(new Complex(1,0),_cos(z));
                var _cot=(z)=>_div(new Complex(1,0),_tan(z));
                var _cosec=(z)=>_div(new Complex(1,0),_sin(z));

                var i=new Complex(0,1);
                var PI=Math.PI,E=Math.E;
                ${complexArgsSetup}

                try{
                    return Complex.from(${transpiledExpr});
                }catch(e){
                    return null;
                }
            `;

            return new Function(...args, functionBody);
        }

        const transpiledExpr = transpile(formulaStr, false);

        const functionBody = `
            const {sin,cos,tan,PI,E,pow,sqrt,abs,log}=Math;
            const sec=(a)=>1/cos(a);
            const cot=(a)=>1/tan(a);
            const cosec=(a)=>1/sin(a);
            const result=${transpiledExpr};
            return Number.isFinite(result)?result:null;
        `;

        return new Function(...args, functionBody);

    } catch (error) {
        console.error(`Plotjs Error: The formula "${formulaStr}" is invalid.`);
        return null;
    }
};