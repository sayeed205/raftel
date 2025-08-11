//  @ts-check
import { tanstackConfig } from '@tanstack/eslint-config';

export default [
  ...tanstackConfig,
  {
    rules: {
      'pnpm/json-enforce-catalog': 'off',
    },
  },
];
