import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginTypescript from '@typescript-eslint/eslint-plugin';
import parserTypescript from '@typescript-eslint/parser';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  pluginJs.configs.recommended,
  {
    ignores: ['dist/'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
  },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parser: parserTypescript,
      parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': pluginTypescript,
    },
    rules: {
      eqeqeq: ['error', 'always'],
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      indent: ['error', 2],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'prefer-const': [
        'error',
        {
          destructuring: 'all',
          ignoreReadBeforeAssign: false,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
];
