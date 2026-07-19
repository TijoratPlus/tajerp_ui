# tajerp_ui

Tijorat+ design system — the shared React component library and design tokens
for TajERP front-ends (POS, CRM, HR, …).

It is a **standalone library**, not a Frappe app. Published on npm as
[`tajerp_ui`](https://www.npmjs.com/package/tajerp_ui).

## What's inside

- **Design tokens** (`styles/tokens.css`) — the single source of truth for the
  brand: green palette, Inter / Faster One type, spacing, radii, shadows, motion,
  plus a built-in dark theme. Exposed both as plain CSS variables and as
  Tailwind v4 `@theme` tokens (`bg-brand`, `text-ink-1`, `border-hairline`, …).
- **Full theme** (`styles/index.css`) — tokens **plus** the frappe-ui-react
  `--color-*` remaps (`styles/frappe-theme.css`) and shadcn-compatible tokens +
  base resets (`styles/base.css`). This is the single import that themes an
  entire TajERP app (including frappe-ui-react widgets). Dark mode works via
  either `.dark` (next-themes class strategy) or `[data-theme="dark"]`.
- **Components**
  - Primitives: `Button`, `Card` (+ parts), `Input`, `Textarea`, `Select`,
    `Label`, `Badge`, `Pill`, `Switch`, `SegmentedControl`, `Separator`,
    `Skeleton`, `Spinner`, `StatusDot`, `Avatar`.
  - Form: `Checkbox` (+ the form fields above).
  - Data: `Table` primitives (`TableContainer`, `TableHeader`, `TableBody`,
    `TableRow`, `TableHead`, `TableCell`, …) and a generic, column-driven
    `DataTable` (toolbar + search, sortable headers, row selection with a
    contextual action bar, presentational pagination, empty + loading states).
  - Overlays: `Dialog`, `Sheet`, `Popover`, `Tooltip`.
  - States: `LoadingState`, `ErrorState`, `EmptyState`.
  - Brand: `TajERPLogo`. Helper: `cn`.
- **Shareable configs** — `tajerp_ui/eslint` (flat ESLint config) and
  `tajerp_ui/tsconfig.base.json`, so every TajERP front-end lints and compiles
  the same way.

## Install

```bash
npm install tajerp_ui
# or: yarn add tajerp_ui / pnpm add tajerp_ui
```

```jsonc
// consumer package.json
{
  "dependencies": {
    "tajerp_ui": "^0.1.0"
  }
}
```

The published package includes a prebuilt `dist/`. For local library development
against a consumer app, you can still link with `npm link` / `"tajerp_ui": "file:…"`
and run `npm run build` in this repo.

## Usage

Theme + tokens are required for the components to render. Import the full theme
**once** in your app's CSS entry and point Tailwind at the library so it picks up
the utility classes used inside the components:

```css
/* src/styles/index.css */
@import "@rtcamp/frappe-ui-react/theme"; /* if you use frappe-ui-react */
@import "tailwindcss";
@source "../../node_modules/tajerp_ui/dist";
@import "tajerp_ui/styles/index.css"; /* tokens + frappe remaps + base */
```

If you only need the raw brand tokens (no frappe-ui-react / shadcn remaps),
import `tajerp_ui/styles/tokens.css` instead of `styles/index.css`.

### Shared configs

```js
// eslint.config.js
import tajerp from "tajerp_ui/eslint";
export default [...tajerp, { /* overrides */ }];
```

```jsonc
// tsconfig.json
{ "extends": "tajerp_ui/tsconfig.base.json" }
```

Then use components anywhere:

```tsx
import { Button, Card, CardHeader, CardTitle, TajERPLogo } from "tajerp_ui";

export function Example() {
  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Tijorat+</CardTitle>
      </CardHeader>
      <Button>Оплатить</Button>
    </Card>
  );
}
```

### Dark mode

Set `data-theme="dark"` on any ancestor (typically `<html>` or `#root`); all
components flip automatically because their colors resolve through the
`--ui-*` runtime variables.

## Dependencies & singletons

Only **`react` / `react-dom` (>= 18)** are peer dependencies — they must be the
host app's copy. Everything else a component needs (Radix primitives, lucide,
clsx, tailwind-merge, cva) is a **normal dependency of `tajerp_ui`**, so it is
installed transitively. **Consumers should not install Radix themselves** —
import the wrapped components (`Dialog`, `Sheet`, `Popover`, `Tooltip`, …) from
`tajerp_ui` instead. Radix wires `Root`→`Title` through React context, which
breaks if two physical copies are loaded; routing all Radix through `tajerp_ui`
guarantees a single copy.

> If you use a symlinked / `file:` copy of `tajerp_ui` and a bundler resolves a
> second Radix copy, add the Radix packages to your bundler's dedupe list
> (Vite: `resolve.dedupe`). This is not needed when installing from npm.

Icons are available without depending on lucide directly:

```tsx
import { Search, Plus } from "tajerp_ui/icons";
```

The consuming app must also have **Tailwind CSS v4** (components are styled with
Tailwind utilities) and, for the slide/fade animations on `Sheet`/`Dialog`,
`tw-animate-css`.

## Storybook

Every component has stories with a light/dark toolbar toggle and the brand
tokens wired in:

```bash
npm run storybook        # dev server at http://localhost:6006
npm run build-storybook  # static build → ./storybook-static
```

## Scripts & Makefile

A `Makefile` wraps the common commands (run `make help` to list them):

```bash
make install        make build         make dev
make typecheck      make lint          make format
make storybook      make storybook-build
make check          # typecheck + lint + build (CI gate)
make release        # check, then npm publish (local)
```

| Script              | Description                    |
| ------------------- | ------------------------------ |
| `npm run build`     | Bundle ESM + type declarations |
| `npm run dev`       | Rebuild on change              |
| `npm run typecheck` | `tsc --noEmit`                 |
| `npm run storybook` | Component explorer             |

## Publishing

Releases go to [npm](https://www.npmjs.com/package/tajerp_ui) via GitHub Actions
when a version tag is pushed:

1. Bump `"version"` in `package.json` (keep it in sync with the tag).
2. Commit and push to `main`.
3. Tag and push:
   ```bash
   git tag v0.1.1
   git push origin v0.1.1
   ```

The `Release` workflow runs `make check`, verifies the tag matches
`package.json`, and runs `npm publish --access public --provenance`.

The repo needs an Actions secret `NPM_TOKEN` — an npm **granular** (or
**automation**) token that can publish and bypass 2FA.

## Conventions

- Components are presentational and unopinionated about data.
- All colors go through tokens — never hard-code hex values in a component.
- Component public APIs mirror the primitives they replaced in `tajerp_pos`,
  so they are drop-in compatible.
