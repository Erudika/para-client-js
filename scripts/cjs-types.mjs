import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const typesDir = path.resolve('dist/types');

// Remove old CommonJS declarations so deleted types do not linger.
const existing = await readdir(typesDir);
await Promise.all(
  existing.filter((file) => file.endsWith('.d.cts')).map((file) => rm(path.join(typesDir, file)))
);

const declarations = existing.filter((file) => file.endsWith('.d.ts'));

for (const file of declarations) {
  const source = await readFile(path.join(typesDir, file), 'utf8');
  // A .d.cts file is CommonJS, so its relative imports must point to .cjs files.
  const commonjs = source.replace(/(['"]\.\/[^'"]+)\.js(['"])/g, '$1.cjs$2');
  const target = file.replace(/\.d\.ts$/, '.d.cts');
  await writeFile(path.join(typesDir, target), commonjs);
}

console.log(`Generated ${declarations.length} CommonJS declaration files.`);
