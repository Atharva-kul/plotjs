import { createGraphlyjs } from './core/index.js';
import { nodeAdapter } from './node/adapter.js';

const Graphlyjs = createGraphlyjs(nodeAdapter);

export default Graphlyjs;