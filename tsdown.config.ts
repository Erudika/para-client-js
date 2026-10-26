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
const aws4Shim = path.resolve(dirname, 'shims/aws4.js');

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
    deps: {
      neverBundle: dependencies
    },
    outputOptions: {
      exports: 'named'
    }
  },
  {
    name: 'browser-bundle',
    entry: {
      'para-client-js.global': './lib/browser.js'
    },
    format: ['iife'],
    outDir: 'dist/browser',
    target: 'es2019',
    platform: 'browser',
    clean: false,
    dts: false,
    minify: true,
    sourcemap: true,
    globalName: 'ParaClient',
    alias: {
      assert: assertShim,
      aws4: aws4Shim
    },
    deps: {
      alwaysBundle: dependencies
    },
    outputOptions: {
      exports: 'default'
    }
  }
]);
