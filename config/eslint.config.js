// Shared ESLint flat config for TajERP React front-ends.
//
// Usage in a consumer's eslint.config.js:
//
//   import tajerp from "tajerp_ui/eslint";
//   export default [
//     ...tajerp,
//     { /* project-specific overrides */ },
//   ];
//
// Peer tooling expected in the consumer: eslint, typescript-eslint,
// eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals.
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

/** @type {import("eslint").Linter.Config[]} */
export default [
  { ignores: ["dist", "node_modules"] },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2021,
      globals: globals.browser,
    },
  },
].flat();
