# Integrating tajerp_ui into TajERP apps

`tajerp_ui` is the single source of truth for TajERP UI/UX: design tokens, the
full theme (incl. frappe-ui-react remaps), shared components, and shared
ESLint/TS configs. Install it from npm:

```bash
npm install tajerp_ui
```

## tajerp_pos — done

1. **Dependency** — prefer a semver range from npm, e.g.
   `"tajerp_ui": "^0.1.0"` in `pos/package.json`. A local `"file:…"` link is
   fine only while developing the library itself.
2. **Theme centralized** — `pos/src/styles/index.css` no longer defines tokens.
   It imports frappe-ui-react theme + tailwindcss, `@source`s the library, then
   `@import "tajerp_ui/styles/index.css"`. All brand tokens, the frappe-ui-react
   `--color-*` remaps (light + dark), shadcn tokens and base resets now live in
   `tajerp_ui/styles/{tokens,frappe-theme,base}.css`. Only app-specific rules
   remain in pos (the `.tajerp-sidebar` overrides and full-screen viewport sizing).
3. **One `cn`** — `pos/src/lib/utils.ts` re-exports `cn` from `tajerp_ui`.
4. **Primitives are shims** — these re-export from `tajerp_ui` (APIs unchanged):
   `ui/card`, `ui/skeleton`, `ui/sheet`, `ui/TajERPLogo`, `ui/LoadingState`,
   `ui/ErrorState`.
5. **Data table migrated** — `components/data-table/data-table.tsx` is now a thin
   adapter over `tajerp_ui`'s `<DataTable>`. It keeps the app's historical API
   (`DataListColumn` with `label`/`renderCell`, string `rowKey`, boolean/config
   `pagination`, `bulkActions`, `string[]` selection) so all 14 consumers and
   their column definitions are untouched. The local rendering, sort/pagination/
   selection hooks (`dataTableHooks.ts`) and `SortArrows.tsx` are removed
   (stubbed). `dataTableUtils.ts` is kept for the shared types + width/pagination
   helpers; `_table.scss` is kept for the toolbar/search/row-button classes the
   pages still use. To enable POS parity the library `<DataTable>` gained:
   internal pagination (`autoPagination`), a numbered pager, a `footer` slot,
   `rowHeight`, `bordered`, and `stopPropagationColumnKeys`.

Verified: `tsc --noEmit -p tsconfig.app.json` passes; library builds clean.
(The Vite/Tailwind CSS build must be run on the host — it needs platform-native
`rolldown`/`lightningcss` binaries not present in every environment.)

6. **Radix is served by tajerp_ui** — POS no longer depends on `@radix-ui/*`.
   Those packages are normal dependencies of `tajerp_ui`; POS imports the wrapped
   overlays (`Dialog`, `Sheet`, …) from `tajerp_ui` only (e.g. `ResponsiveModal`
   was rewritten to drop its raw `@radix-ui/react-dialog` import). If you still
   use a symlinked `file:` dep during library development, keep Radix in
   Vite's `resolve.dedupe` so a second copy cannot resolve. With the npm
   package this is unnecessary.

## Run it

```bash
# consumer app (after tajerp_ui is on npm)
cd apps/tajerp_pos/pos && yarn install && yarn build

# optional: develop against a local checkout of the library
cd tajerp_ui && npm install && npm run build
# then point the app at "tajerp_ui": "file:…" / npm link
```

## Adopting in feature components (incremental)

The theme already restyles every frappe-ui-react widget, so the app is on-brand
without touching feature code. To deepen reuse, prefer `tajerp_ui` components in
new/edited code:

- Status chips → `Badge` / `StatusDot`; labels/CTAs → `Pill` / `Button`.
- Toggles (language, dark mode) → `SegmentedControl` / `Switch`.
- Modals → `Dialog` / `Sheet`; menus → `Popover`; hints → `Tooltip`.
- Zero-data → `EmptyState`; forms → `Input` / `Textarea` / `Select` / `Label`.

frappe-ui-react stays as the data-widget layer (TextInput, Select, charts, …);
`tajerp_ui` owns tokens/theme and presentational primitives.

## Reuse in other front-ends

`tajerp_hr/roster`, future apps, etc. can adopt the same way:

```bash
npm install tajerp_ui
```

Then import `tajerp_ui/styles/index.css`, extend `tajerp_ui/tsconfig.base.json`,
and use `tajerp_ui/eslint`. Prefer a versioned npm range (`^0.1.0`) for CI and
deploys instead of `file:` or git URLs.
