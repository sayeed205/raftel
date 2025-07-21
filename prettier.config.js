//  @ts-check

/** @type {import('prettier').Config} */
const config = {
  tabWidth: 2,
  printWidth: 80,
  singleQuote: true,
  jsxSingleQuote: true,
  trailingComma: 'all',
  'bracketSpacing': true,
  'endOfLine': 'lf',
  'plugins': [
    'prettier-plugin-tailwindcss',
  ],
};

export default config;
