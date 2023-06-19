module.exports = {
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:svelte/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    project: ["./tsconfig.json"],
    tsconfigRootDir: __dirname,
    extraFileExtensions: [".svelte"],
  },
  overrides: [
    {
      files: ["*.svelte"],
      parser: "svelte-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
      },
    },
  ],
  settings: {
    svelte: {
      ignoreWarnings: ["svelte/no-at-html-tags"],
    },
  },
  // Workaround until $$Generic is supported:
  // https://github.com/sveltejs/svelte-eslint-parser/issues/306#issuecomment-1480844814
  globals: {
    $$Generic: "readonly",
  },
  plugins: ["@typescript-eslint", "no-only-tests"],
  rules: {
    semi: "off",
    "no-only-tests/no-only-tests": "error",
    curly: ["error", "multi-line", "consistent"],
    "keyword-spacing": ["error"],
    "no-implicit-globals": ["error"],
    "no-restricted-globals": [
      "error",
      "name",
      "event",
      "frames",
      "history",
      "length",
      "content",
      "origin",
      "status",
    ],
    "no-trailing-spaces": ["error"],
    "no-multi-spaces": ["error"],
    "no-multiple-empty-lines": ["error"],
    "space-before-blocks": ["error"],
    "object-curly-spacing": ["error", "always"],
    "array-bracket-spacing": ["error", "never"],
    "space-before-function-paren": [
      "error",
      {
        anonymous: "always",
        named: "never",
        asyncArrow: "always",
      },
    ],
    "eol-last": ["error"],
    "key-spacing": ["error"],
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/object-curly-spacing": ["error", "always"],
    "@typescript-eslint/type-annotation-spacing": ["error"],
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "enumMember",
        format: ["PascalCase"],
      },
      {
        selector: "objectLiteralProperty",
        format: ["PascalCase", "camelCase"],
      },
      {
        selector: "default",
        format: ["camelCase"],
        leadingUnderscore: "allow",
        trailingUnderscore: "allow",
      },
      {
        selector: "variable",
        modifiers: ["const"],
        format: ["camelCase", "PascalCase", "UPPER_CASE"],
        leadingUnderscore: "allow",
        trailingUnderscore: "allow",
      },
      {
        selector: "typeLike",
        format: ["PascalCase"],
      },
      {
        selector: ["objectLiteralProperty"],
        modifiers: ["requiresQuotes"],
        format: null,
      },
    ],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-namespace": ["error", { allowDeclarations: true }],
    "@typescript-eslint/semi": ["error"],
    "@typescript-eslint/member-delimiter-style": [
      "error",
      {
        multiline: {
          delimiter: "semi",
          requireLast: true,
        },
        singleline: {
          delimiter: "semi",
          requireLast: false,
        },
      },
    ],
    "@typescript-eslint/member-ordering": [
      "error",
      { default: ["field", "signature", "constructor", "method"] },
    ],

    "@typescript-eslint/no-invalid-void-type": ["error"],
    // Disallow Unused Variables.
    // https://eslint.org/docs/rules/no-unused-vars
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    // Require using arrow functions as callbacks.
    // https://eslint.org/docs/rules/prefer-arrow-callback
    "prefer-arrow-callback": "error",
    // Require using const for variables that are never modified after declared.
    // https://eslint.org/docs/rules/prefer-const
    "prefer-const": "error",
    // Disallow modifying variables that are declared using const.
    // https://eslint.org/docs/rules/no-const-assign
    "no-const-assign": "error",
    // Require let or const instead of var.
    // https://eslint.org/docs/rules/no-var
    "no-var": "error",
    // Require `===` and `!==` comparisons.
    eqeqeq: "error",
    // Allow explict type annotations for additional clarity.
    "@typescript-eslint/no-inferrable-types": "off",
  },
};
