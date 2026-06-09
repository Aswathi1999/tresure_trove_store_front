/** @type {import('lint-staged').Config} */
const config = {
  '*.{ts,tsx,js,jsx,mjs,cjs,json,md,yaml,yml,scss,css}': ['prettier --write'],
}

export default config
