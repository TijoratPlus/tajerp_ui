# tajerp_ui

Tijorat+ design system — the shared React component library and design tokens
for TajERP front-ends (POS, CRM, HR, …).

It is a **standalone library**, not a Frappe app. Published on npm as
[`tajerp_ui`](https://www.npmjs.com/package/tajerp_ui).

## What's inside

- **Design tokens** (`styles/tokens.css`) — the single source of truth for the
  brand.
  - Palette: green palette, warm cream surfaces, an 8-hue chart palette, and
    status colours with text-safe `*-ink` variants.
  - Inter type plus a role-based UI type scale (`text-ui-*`).
  - Radii, shadows, motion, z-index layers and a focus-ring token.
  - **Density** modes (`data-density="compact" | "comfortable" | "touch"`)
    and a built-in dark theme.
  - Exposed both as CSS variables and as Tailwind v4 `@theme` utilities
    (`bg-brand-solid`, `text-ink-1`, `h-control-md`, `ring-focus`, …).
- **Full theme** (`styles/index.css`) — tokens, the frappe-ui-react `--color-*`
  remaps (`frappe-theme.css`) and shadcn-compatible tokens with base resets
  (`base.css`), all derived from the same `--ui-*` tokens. One import themes an
  entire TajERP app. Dark mode works via `.dark` or `[data-theme="dark"]` on
  `<html>`.
- **Fonts** — `styles/fonts-local.css` (self-hosted Inter, including the
  Cyrillic-ext subset for Tajik ӣ ӯ ҳ қ ғ ҷ; works offline) or
  `styles/fonts.css` (Google Fonts).
- **i18n** — every component string in Russian, Tajik and English.
  `TajUIProvider` sets the locale, string overrides, currency and portal
  container. `useFormat()` / `formatMoney()` print somoni the Tijorat+ way
  (`1 234,50 с`), and `parseNumber()` accepts "," and ".".
- **Components** (WCAG 2.2 AA, keyboard-operable, `forwardRef` everywhere):
  - Actions & inputs: `Button`, `Input`, `InputGroup`, `Textarea`, `Select`,
    `NumberField`, `MoneyInput`, `PhoneInput`, `Checkbox`, `Switch`,
    `RadioGroup`, `Toggle`, `ToggleGroup`, `SegmentedControl`, `Slider`,
    `SearchField`, `Autocomplete`, `MultiSelect`, `Calendar`, `DatePicker`,
    `DateRangePicker`, `FileUpload`, `Label`, `Form*` (`tajerp_ui/form`).
  - Data display: `DataTable` (sorting incl. server-side, sticky header,
    pinned columns, totals row, expandable rows, range selection, CSV export),
    `Table` primitives, `Pagination`, `StatCard` / `Delta` / `Sparkline`,
    `DescriptionList`, `ActivityTimeline`, `Badge`, `Pill`, `StatusDot`,
    `Avatar`, `Kbd`, `Money`, `Accordion`, `Carousel`.
  - Charts (`tajerp_ui/charts`): `AxisChart` (bar / line / area, stacked,
    money formats, accessible data table) and `DonutChart`.
  - Navigation & layout: `AppShell`, `Topbar`, `Sidebar`, `Breadcrumb`, `Tabs`,
    `Stepper`, `Command` palette (⌘K), `BranchSwitcher`, `LanguageSwitcher`,
    `FilterBar`, `ExportMenu`, `Card`, `Separator`, `ScrollArea`,
    `Collapsible`.
  - Overlays: `Dialog`, `Sheet`, `AlertDialog` + imperative `confirm()`,
    `Popover`, `HoverCard`, `DropdownMenu`, `Tooltip`.
  - Feedback: `Toast` (actions, loading, promise), `Alert`, `Banner`,
    `Progress`, `Skeleton`, `Spinner`, `EmptyState`, `ErrorState`,
    `LoadingState`, `StateView`.
  - POS: `ProductTile`, `CartLine`, `CartSummary`, `PaymentSplit` (cash, card,
    Alif Pay, Eskhata), `Numpad`, `BarcodeInput` + `useBarcodeScanner`,
    `ReceiptPreview` (58/80 mm) + `printReceipt`, `SyncStatus` /
    `OfflineIndicator` + `useOnlineStatus`.
  - TijoratAI: `ApprovalCard`, `ChatBubble`, `AIAssistantPanel`.
  - Brand: `TajERPLogo`. Helpers: `cn`, `Slot`, `useHotkey`, `toCSV`,
    `downloadFile`, date utilities.
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
@import "tajerp_ui/styles/fonts-local.css"; /* self-hosted Inter (offline) */
@import "@rtcamp/frappe-ui-react/theme"; /* if you use frappe-ui-react */
@import "tailwindcss";
@source "../../node_modules/tajerp_ui/dist";
@import "tajerp_ui/styles/index.css"; /* tokens + frappe remaps + base */
```

Wrap the app once (optional — without it everything defaults to Russian, TJS
and `<body>` portals):

```tsx
import { ConfirmHost, TajUIProvider, Toaster, TooltipProvider } from "tajerp_ui";

<TajUIProvider locale="ru" /* "tg" | "en" */>
  <TooltipProvider>
    <App />
  </TooltipProvider>
  <Toaster />
  <ConfirmHost />
</TajUIProvider>
```

In the **Frappe desk** (no Tailwind build) load
`tajerp_ui/styles/compiled.css`, wrap pages in `.tj-react-root` and use
`<TajUIProvider scopedPortal>` so dialogs and popovers stay styled.

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

### Dark mode & density

Set `data-theme="dark"` (or `.dark`) on `<html>`. All components switch
automatically because their colours resolve through the `--ui-*` runtime
variables. Overlays portal into `<body>`, so set the theme on `<html>`, not on
an inner wrapper.

Set `data-density="touch"` on the POS (44px+ controls) or `"compact"` on dense
reports. Any element works, so one region can differ from the rest of the
page.

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
Tailwind utilities). The enter/exit animations used by `Dialog`, `Sheet`,
`Popover`, `Tooltip` and `Toast` (`animate-in`, `fade-in-0`, `slide-in-from-*`,
…) ship in `styles/tokens.css`, so `tw-animate-css` is no longer required; apps
that already use it can keep it. Animations fall back to a plain fade under
`prefers-reduced-motion`.

### Accessibility

Components target WCAG 2.2 AA: text tokens hold 4.5:1 contrast in light and dark
themes, every control has a visible `focus-visible` ring, small controls (checkbox,
slider thumb, close/clear buttons, carousel dots) meet the 24px pointer target, and composite widgets (`Tabs`, `SegmentedControl`, `DataTable`
sorting/rows/pager, `Autocomplete`) are fully keyboard-operable. Use the
text-safe colour utilities (`bg-brand-solid`, `text-tj-*-ink`) for text — see
**Foundations → Colors** in Storybook.

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

| Script                 | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `npm run build`        | Bundle ESM (one module per component) + types + CSS      |
| `npm run dev`          | Rebuild on change                                        |
| `npm run typecheck`    | `tsc --noEmit` over src, tests, stories and configs      |
| `npm test`             | Unit + accessibility tests (Vitest, Testing Library, axe) |
| `npm run test:stories` | Render every story in Chromium (light + dark) and run axe |
| `npm run lint:package` | publint + are-the-types-wrong on the packed package      |
| `npm run size`         | size-limit budgets (full bundle, tree-shaken Button+Card) |
| `npm run format`       | Prettier (+ Tailwind class sorting)                      |
| `npm run changeset`    | Record a user-visible change for the next release        |
| `npm run storybook`    | Component explorer                                       |

## Publishing

Releases go to [npm](https://www.npmjs.com/package/tajerp_ui) via GitHub Actions
when a version tag is pushed:

1. Every PR with user-visible changes adds a changeset (`npx changeset`).
2. To release, run `npx changeset version`. It bumps `package.json` and
   writes `CHANGELOG.md`. Commit and push to `main`.
3. Tag and push:
   ```bash
   git tag v0.1.1
   git push origin v0.1.1
   ```

The `Release` workflow runs `make check`, verifies the tag matches
`package.json`, runs `npm publish --access public --provenance` and creates a
GitHub release with generated notes. Storybook is deployed to GitHub Pages on
every push to `main` (enable Pages → "GitHub Actions" in the repo settings).

The repo needs an Actions secret `NPM_TOKEN` — an npm **granular** (or
**automation**) token that can publish and bypass 2FA.

## Conventions

See [CONTRIBUTING.md](./CONTRIBUTING.md). In short:

- Components are presentational and unopinionated about data.
- Tokens only: no hex colours, no `text-[13px]`, no `text-white`.
- `forwardRef`, `data-slot`, controlled + uncontrolled state, localized
  strings, WCAG 2.2 AA.
- Deprecated props keep working for at least one minor release.
