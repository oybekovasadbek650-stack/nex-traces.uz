import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist', 'node_modules'] },
  js.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser } },
    rules: { 'no-var': 'error', 'prefer-const': 'error', eqeqeq: 'error' },
  },
  { files: ['*.config.js', 'scripts/**'], languageOptions: { globals: globals.node } },
];
