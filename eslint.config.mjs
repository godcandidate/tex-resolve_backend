import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import pluginTs from "@typescript-eslint/eslint-plugin";

/** @type {import('eslint').Linter.Config} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      globals: globals.browser,
      parser: tsParser,
    },
  },
  {
    plugins: {
      "@typescript-eslint": pluginTs,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Disable the rule globally
    },
  },
  {
    rules: {
      // Recommended ESLint rules (from eslint:recommended)
      "no-unused-vars": "warn",
      //"no-console": "warn",
      "eqeqeq": "error",
      "semi": ["error", "always"],

      // Recommended TypeScript rules (from plugin:@typescript-eslint/recommended)
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
];
