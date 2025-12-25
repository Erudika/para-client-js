import { defineConfig } from 'tsdown';
import { createRequire } from 'module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');
const dependencies = Object.keys(pkg.dependencies ?? {});
const nodeTarget = (() => {
  const engine = pkg.engines?.node;
  if (!engine) return 'node18';
  const match = engine.match(/\d+/);
  return match ? `node${match[0]}` : 'node18';
})();
const dirname = path.dirname(fileURLToPath(import.meta.url));
const assertShim = path.resolve(dirname, 'shims/assert.js');

export default defineConfig([
  {
    name: 'node-distribution',
    entry: ['./lib/index.js'],
    format: ['esm', 'cjs'],
    outDir: 'dist',
    target: nodeTarget,
    clean: true,
    dts: false,
    sourcemap: true,
    minify: false,
    treeshake: true,
    skipNodeModulesBundle: true,
    external: dependencies,
    outputOptions: {
      exports: 'named'
    }
  },
  {
    name: 'browser-bundle',
    entry: {
      'para-client-js.global': './lib/index.js'
    },
    format: ['iife'],
    outDir: 'dist/browser',
    target: 'es2019',
    clean: false,
    dts: false,
    minify: true,
    sourcemap: true,
    globalName: 'ParaClient',
    skipNodeModulesBundle: false,
    alias: {
      assert: assertShim
    },
    noExternal: dependencies,
    outputOptions: {
      exports: 'named'
    }
  }
]);
