import js from '@eslint/js';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginN from 'eslint-plugin-n';
import eslintPluginPromise from 'eslint-plugin-promise';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
  {
    ignores: ['dist/**', 'node_modules/**']
  },
  {
    ...js.configs.recommended,
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      import: eslintPluginImport,
      n: eslintPluginN,
      promise: eslintPluginPromise,
      prettier: eslintPluginPrettier
    },
    rules: {
      'import/no-unresolved': 'error',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: ['test/**', '**/*.config.js', '**/*.config.ts']
        }
      ],
      'n/no-unsupported-features/node-builtins': 'off',
      'promise/always-return': 'off',
      'prettier/prettier': 'error'
    }
  },
  {
    files: ['lib/**/*.js', 'test/**/*.js'],
    rules: {
      'prettier/prettier': 'off'
    }
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.mocha
      }
    }
  }
];
