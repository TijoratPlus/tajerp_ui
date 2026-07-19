import tajerp from "./config/eslint.config.js";

/** Library-local overrides on top of the shared TajERP ESLint config. */
export default [
  ...tajerp,
  {
    // Design-system packages co-export variants, hooks, and helpers with components.
    // react-refresh is for Vite app HMR, not published libraries.
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  {
    // Storybook CSF `render` callbacks are not components; hooks inside them are fine.
    files: ["stories/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
      "react-refresh/only-export-components": "off",
    },
  },
];
