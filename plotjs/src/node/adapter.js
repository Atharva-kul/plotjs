import { createCanvas } from 'canvas';

export const nodeAdapter = {
    createCanvas: (width, height) => {
        try {
            return createCanvas(width, height);
        } catch (e) {
            console.error(`graphlyjs error: (701 failed to create canvas in Node.js: ${e.message})`);
            throw e;
        }
    },
    requestAnimationFrame: (cb) => setTimeout(() => cb(Date.now()), 1000 / 60),
    cancelAnimationFrame: (id) => clearTimeout(id)
};