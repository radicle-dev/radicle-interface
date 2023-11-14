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
    "prettier",
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
    "no-only-tests/no-only-tests": "warn",
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
    "@typescript-eslint/no-floating-promises": "warn",
    "@typescript-eslint/naming-convention": [
      "warn",
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
      // Disable @typescript-eslint/naming-convention format for imports
      // https://github.com/typescript-eslint/typescript-eslint/pull/7269#issuecomment-1777628591
      // https://github.com/typescript-eslint/typescript-eslint/issues/7892
      { selector: "import", format: null },
      {
        selector: ["objectLiteralProperty"],
        modifiers: ["requiresQuotes"],
        format: null,
      },
    ],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-namespace": ["error", { allowDeclarations: true }],
    "@typescript-eslint/member-ordering": [
      "warn",
      { default: ["field", "signature", "constructor", "method"] },
    ],

    "@typescript-eslint/no-invalid-void-type": ["warn"],
    // Disallow Unused Variables.
    // https://eslint.org/docs/rules/no-unused-vars
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    // Require using arrow functions as callbacks.
    // https://eslint.org/docs/rules/prefer-arrow-callback
    "prefer-arrow-callback": "warn",
    // Require using const for variables that are never modified after declared.
    // https://eslint.org/docs/rules/prefer-const
    "prefer-const": "warn",
    // Disallow modifying variables that are declared using const.
    // https://eslint.org/docs/rules/no-const-assign
    "no-const-assign": "error",
    // Require let or const instead of var.
    // https://eslint.org/docs/rules/no-var
    "no-var": "warn",
    // Require `===` and `!==` comparisons.
    eqeqeq: "warn",
    // Allow explict type annotations for additional clarity.
    "@typescript-eslint/no-inferrable-types": "off",
  },
};
