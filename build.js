import esbuild from 'esbuild';

// Build Browser ESM
esbuild.build({
  entryPoints: ['src/index.browser.js'],
  bundle: true,
  outfile: 'dist/index.browser.js',
  format: 'esm',
  platform: 'browser',
  target: ['es2020']
}).catch(() => process.exit(1));

// Build Browser UMD (minified)
esbuild.build({
  entryPoints: ['src/index.browser.js'],
  bundle: true,
  outfile: 'dist/plotjs.min.js',
  format: 'iife',
  minify: true,
  platform: 'browser',
  target: ['es2020']
}).catch(() => process.exit(1));

// Build Node ESM
esbuild.build({
  entryPoints: ['src/index.node.js'],
  bundle: true,
  outfile: 'dist/index.node.js',
  format: 'esm',
  platform: 'node',
  external: ['canvas'], // Don't bundle the native canvas module
  target: ['node14']
}).catch(() => process.exit(1));

// Build Node CJS
esbuild.build({
  entryPoints: ['src/index.node.js'],
  bundle: true,
  outfile: 'dist/index.node.cjs',
  format: 'cjs',
  platform: 'node',
  external: ['canvas'], // Don't bundle the native canvas module
  target: ['node14']
}).catch(() => process.exit(1));

console.log("Build complete!");