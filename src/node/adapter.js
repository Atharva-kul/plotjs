import { createCanvas } from 'canvas';

export const nodeAdapter = {
    createCanvas: (width, height) => {
        return createCanvas(width, height);
    },
    requestAnimationFrame: (cb) => setTimeout(() => cb(Date.now()), 1000 / 60),
    cancelAnimationFrame: (id) => clearTimeout(id)
};