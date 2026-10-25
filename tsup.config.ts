import { defineConfig } from "tsup";

export default defineConfig({
  // Every module is its own entry so bundlers can tree-shake per component
  // ("sideEffects" in package.json marks JS as side-effect free): importing
  // { Button } does not pull in DataTable or the calendar.
  entry: [
    "src/index.ts",
    "src/icons.ts",
    "src/charts.ts",
    "src/form.ts",
    "src/components/*.tsx",
    "src/lib/*.ts",
    "src/i18n/*.ts",
  ],
  format: ["esm"],
  // Type declarations only for the public entry points.
  dts: {
    entry: {
      index: "src/index.ts",
      icons: "src/icons.ts",
      charts: "src/charts.ts",
      form: "src/form.ts",
    },
  },
  sourcemap: true,
  clean: true,
  // esbuild already drops unused code; tsup's extra rollup tree-shake pass
  // would strip the "use client" banner below.
  treeshake: false,
  // Shared chunks keep ONE copy of each module across entry points, so
  // `tajerp_ui/charts` and `tajerp_ui` share the same TajUIProvider context
  // (locale, currency) instead of bundling separate copies.
  splitting: true,
  // React is provided by the host app — never bundle it.
  // Radix + lucide are real dependencies and stay external (imported at runtime
  // from tajerp_ui's install), so a single copy is shared with the host app.
  // Recharts is isolated in ./charts so server components can import Card/Button
  // without pulling class-based chart code into the RSC bundle. Likewise
  // react-hook-form is isolated in ./form (optional peer dep). embla stays
  // external and is imported at runtime from tajerp_ui's own install.
  external: [
    "react",
    "react-dom",
    "react/jsx-runtime",
    "recharts",
    "react-hook-form",
    "embla-carousel-react",
  ],
  // Components use hooks/context: mark the bundles as client modules for
  // React Server Component frameworks (Next.js app router).
  banner: { js: '"use client";' },
  target: "es2021",
  outDir: "dist",
});
