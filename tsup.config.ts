import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/icons.ts", "src/charts.ts", "src/form.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
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
  target: "es2021",
  outDir: "dist",
});
