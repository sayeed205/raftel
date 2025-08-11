import { tanstackConfig } from '@tanstack/config/eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  ...tanstackConfig,
  {
    rules: {
      'pnpm/json-enforce-catalog': 'off',
      'sort-imports': 'off',
    },
  },
  eslintConfigPrettier,
  globalIgnores([
    '!/src',
    '!index.html',
    '!package.json',
    '!tailwind.config.js',
    '!tsconfig.json',
    '!tsconfig.node.json',
    '!vite.config.ts',
    '!.prettierrc',
    '!README.md',
    '!eslint.config.js',
    '!postcss.config.js',
    '!/wrangler.jsonc',

    '/src/routeTree.gen.ts',
  ]),
]);
