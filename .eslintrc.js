module.exports = {
  env: {
    browser: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: [
    "svelte3",
    "@typescript-eslint"
  ],
  overrides: [
    {
      files: ["*.svelte"],
      processor: "svelte3/svelte3",
    }
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    indent: ["error", 2, { "SwitchCase": 1 }]
  },
  settings: {
    "svelte3/typescript": true,
  },
};
