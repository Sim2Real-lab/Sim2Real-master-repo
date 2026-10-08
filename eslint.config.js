import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'node_modules/**',
    'dist/**',
    'landing_page/frontend/**',
    'landing_page/static/**',
    'staticfiles/**',
    'media/**',
    '.venv/**',
    'venv/**',
    '.ci-venv/**',
  ]),

  {
    files: ['src/**/*.{js,jsx}'],

    plugins: {
      react,
    },

    extends: [
      js.configs.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },

      globals: {
        ...globals.browser,
      },
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      'no-unused-vars': 'off',
      'react/jsx-uses-vars': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unknown-property': 'off',
    },
  },

  {
    files: ['vite.config.js'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      globals: {
        ...globals.node,
      },
    },
  },
])