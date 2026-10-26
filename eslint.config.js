import js from '@eslint/js';
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
      n: eslintPluginN,
      promise: eslintPluginPromise,
      prettier: eslintPluginPrettier
    },
    rules: {
      'n/no-missing-import': 'error',
      'n/no-extraneous-import': 'error',
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
    },
    rules: {
      'n/no-extraneous-import': 'off'
    }
  },
  {
    files: ['eslint.config.js', '**/*.config.js', '**/*.config.ts'],
    rules: {
      'n/no-extraneous-import': 'off'
    }
  }
];
