export const browserAdapter = {
    createCanvas: (width, height) => {
        if (typeof document !== 'undefined') {
            const c = document.createElement('canvas');
            c.width = width;
            c.height = height;
            return c;
        }
        console.error("graphlyjs error: (601 document is not defined in browser environment)");
        throw new Error('document is not defined in this environment');
    },
    requestAnimationFrame: (cb) => {
        if (typeof window !== 'undefined' && window.requestAnimationFrame) {
            return window.requestAnimationFrame(cb);
        }
        return setTimeout(() => cb(Date.now()), 1000 / 60);
    },
    cancelAnimationFrame: (id) => {
        if (typeof window !== 'undefined' && window.cancelAnimationFrame) {
            return window.cancelAnimationFrame(id);
        }
        clearTimeout(id);
    }
};