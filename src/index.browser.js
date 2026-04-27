import { createGraphlyjs } from './core/index.js';
import { browserAdapter } from './browser/adapter.js';

const Graphlyjs = createGraphlyjs(browserAdapter);

// Expose to window for <script> tag users
if (typeof window !== 'undefined') {
    window.Graphlyjs = Graphlyjs;
}

// Still export for ESM users (Vite/Webpack)
export { Graphlyjs };
export default Graphlyjs;
