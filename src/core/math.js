// checks the math terms forn solving them

export const _createFormula = (formulaStr, args, options = {}) => {
    const isComplex = options.complex === true;

    const allowedPattern = /^(?:[xti0-9.+\-/*^(),\s]|sin|cos|tan|sec|cot|cosec|pow|sqrt|abs|log|PI|E)+$/;
    if (!allowedPattern.test(formulaStr)) {
        console.error(`Graphlyjs Security Error: The formula "${formulaStr}" contains unauthorized characters.`);
        return null;
    }

    const transpile = (formula, mode) => {
        const funcNames = ['sin','cos','tan','cosec','sec','cot','pow','sqrt','abs','log'];
        const tokens = formula.match(/sin|cos|tan|cosec|sec|cot|pow|sqrt|abs|log|PI|E|[xti]|\d*\.?\d+|\+|\-|\*|\/|\^|\(|\)|,/g);
        if (!tokens) return formula;

        let pos = 0;
        const peek = () => tokens[pos];
        const consume = () => tokens[pos++];


        // follows logical order of BODMAS

        //very last addition and subtraction
        const parseExpression = () => {
            let node = parseTerm(); // all other methods are executed first like bracket open, power solving, multiplication, division. 
            while (peek() === '+' || peek() === '-') {
                const op = consume();
                const right = parseTerm();
                if (mode === 'glsl-complex') node = op === '+' ? `c_add(${node}, ${right})` : `c_sub(${node}, ${right})`;
                else if (mode === 'complex') node = op === '+' ? `_add(${node}, ${right})` : `_sub(${node}, ${right})`; // addition subtraction check
                else node = `(${node}${op}${right})`;
            }
            return node;
        };

        const parseTerm = () => {
            // after bracket open and power solving
            let node = parseFactor();
            while (peek() === '*' || peek() === '/') {
                const op = consume();
                const right = parseFactor();
                if (mode === 'glsl-complex') node = op === '*' ? `c_mul(${node}, ${right})` : `c_div(${node}, ${right})`;
                else if (mode === 'complex') node = op === '*' ? `_mul(${node}, ${right})` : `_div(${node}, ${right})`; //multiplication aand division
                else node = `(${node}${op}${right})`;
            }
            return node;
        };

        const parseFactor = () => {
            // after checking power and brackets check all the tokens to multiply, divide, add, sub.
            let node = parsePower();
            while (pos < tokens.length && ['(','x','t','i','PI','E','sin','cos','tan','pow','sqrt','log'].includes(peek())) {
                const right = parsePower();
                if (mode === 'glsl-complex') node = `c_mul(${node}, ${right})`;
                else if (mode === 'complex') node = `_mul(${node}, ${right})`;
                else node = `(${node}*${right})`;
            }
            return node;
        };

        const parsePower = () => {

            // after bracket open
            let node = parseUnary();
            while (peek() === '^') {
                consume();
                const right = parsePower();
                if (mode === 'glsl-complex') node = `c_pow(${node}, ${right})`;
                else if (mode === 'complex') node = `_pow(${node}, ${right})`;
                else node = `pow(${node}, ${right})`;
            }
            return node;
        };

        // check the signs of equation to determine the variables are positive or negative
        const parseUnary = () => {
            if (peek() === '-') { 
                consume(); 
                const op = parseUnary();
                if (mode === 'glsl-complex') return `c_mul(vec2(-1.0,0.0), ${op})`;
                if (mode === 'complex') return `_mul(-1, ${op})`;
                return `(-${op})`;
            }
            return parsePrimary();
        };

        // very first bracked open
        const parsePrimary = () => {
            const t = consume();
            // if there are any calculation needed before opening the bracket
            if (t === '(') { const e = parseExpression(); consume(); return `(${e})`; }
            if (funcNames.includes(t)) {
                consume();
                const argsList = [];
                argsList.push(parseExpression());
                while (peek() === ',') { consume(); argsList.push(parseExpression()); }
                consume();
                if (mode === 'glsl-complex') return `c_${t}(${argsList.join(',')})`;
                if (mode === 'complex') return `_${t}(${argsList.join(',')})`;
                return `${t}(${argsList.join(',')})`;
            }
            if (t === 'PI') return mode === 'glsl-complex' ? 'vec2(3.14159265, 0.0)' : 'Math.PI';
            if (t === 'E') return mode === 'glsl-complex' ? 'vec2(2.71828182, 0.0)' : 'Math.E';
            if (t === 'i' && mode === 'glsl-complex') return 'vec2(0.0, 1.0)';
            if (t === 'x' && mode === 'glsl-complex') return 'vec2(x, 0.0)';
            if (t === 't' && mode === 'glsl-complex') return 'vec2(t, 0.0)';
            if (/^\d/.test(t) && mode === 'glsl-complex') {
                const val = t.includes('.') ? t : t + '.0';
                return `vec2(${val}, 0.0)`;
            }
            return t;
        };

        return parseExpression();
    };

    if (options.glsl) {
        return transpile(formulaStr, isComplex ? 'glsl-complex' : 'glsl-real');
    }

    try {
        if (isComplex) {
            const transpiledExpr = transpile(formulaStr, 'complex');
            const complexArgsSetup = args.map((arg, idx) => `var ${arg} = Complex.from(arguments[${idx}]);`).join(' ');
            const functionBody = `
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
                try { return Complex.from(${transpiledExpr}); } catch(e) { return null; }
            `;
            return new Function(...args, functionBody);
        }
        const transpiledExpr = transpile(formulaStr, 'real');
        const functionBody = `const {sin,cos,tan,PI,E,pow,sqrt,abs,log}=Math;const sec=(a)=>1/cos(a),cot=(a)=>1/tan(a),cosec=(a)=>1/sin(a),result=${transpiledExpr};return Number.isFinite(result)?result:null;`;
        return new Function(...args, functionBody);
    } catch (e) { return null; }
};
