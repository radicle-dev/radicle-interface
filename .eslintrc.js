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
    indent: ["error", 2, { "SwitchCase": 1 }],
    semi: "off", // We use the typescript-specific rule as it's more accurate.
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/semi": ["error"],
    "@typescript-eslint/member-delimiter-style": [
      "warn", {
        "multiline": {
          "delimiter": "semi",
          "requireLast": true,
        },
        "singleline": {
          "delimiter": "semi",
          "requireLast": false,
        }
      }
    ]
  },
  settings: {
    "svelte3/typescript": true,
  },
};
