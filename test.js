import test from 'node:test';
import assert from 'node:assert';
import Graphlyjs from './dist/index.node.js';

test('Math Transpiler: Basic Arithmetic', () => {
    const f = Graphlyjs._createFormula('2x + 5', ['x']);
    assert.strictEqual(f(10), 25);
    assert.strictEqual(f(0), 5);
    assert.strictEqual(f(-5), -5);
});

test('Math Transpiler: Powers and Brackets', () => {
    const f = Graphlyjs._createFormula('(x + 2)^2', ['x']);
    assert.strictEqual(f(0), 4);
    assert.strictEqual(f(3), 25);
    assert.strictEqual(f(-2), 0);
});

test('Math Transpiler: Trigonometry', () => {
    const f = Graphlyjs._createFormula('sin(x)', ['x']);
    // Floating point precision check
    assert.ok(Math.abs(f(Math.PI / 2) - 1) < 1e-10);
    assert.ok(Math.abs(f(0)) < 1e-10);
});

test('Math Transpiler: Complex Numbers', () => {
    const f = Graphlyjs._createFormula('x + i', ['x'], { complex: true });
    const res = f(2);
    assert.strictEqual(res.re, 2);
    assert.strictEqual(res.im, 1);
});

test('Analysis: findRoots', () => {
    // x^2 - 4 has roots at -2 and 2
    const roots = Graphlyjs.findRoots('x^2 - 4', [-5, 5]);
    
    assert.ok(roots.xRoots.some(r => Math.abs(r - (-2)) < 0.1));
    assert.ok(roots.xRoots.some(r => Math.abs(r - 2) < 0.1));
    // y-intercept at x=0 is -4
    assert.strictEqual(roots.yRoots[0], -4);
});

test('Analysis: findExtrema', () => {
    // x^2 has a minimum at x=0
    const extrema = Graphlyjs.findExtrema('x^2', [-5, 5]);
    assert.ok(extrema.minima.some(p => Math.abs(p.x) < 0.1 && Math.abs(p.y) < 0.1));
});

test('Generator: Cartesian Points', () => {
    const formula = Graphlyjs._createFormula('x', ['x', 't']);
    const points = Graphlyjs._generateCartesianPoints({
        formula,
        width: 100,
        height: 100,
        scale: 1,
        xRange: [-50, 50],
        t: 0
    });
    
    assert.ok(points.length > 0);
    // Center is (50, 50). For x=0, y=0, canvas coord should be (50, 50)
    const centerPoint = points.find(p => p && Math.abs(p.x - 50) < 1);
    assert.ok(centerPoint);
    assert.ok(Math.abs(centerPoint.y - 50) < 1);
});
