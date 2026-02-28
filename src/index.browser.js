import { createPlotjs } from './core/index.js';
import { browserAdapter } from './browser/adapter.js';

const Plotjs = createPlotjs(browserAdapter);

// Expose to window for <script> tag users
if (typeof window !== 'undefined') {
    window.Plotjs = Plotjs;
}

// Still export for ESM users (Vite/Webpack)
export { Plotjs };
export default Plotjs;
