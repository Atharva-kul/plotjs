import { createPlotjs } from './core/index.js';
import { nodeAdapter } from './node/adapter.js';

const Plotjs = createPlotjs(nodeAdapter);

export default Plotjs;