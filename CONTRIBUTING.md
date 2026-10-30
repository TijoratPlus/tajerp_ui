# Contributing to tajerp_ui

`tajerp_ui` is the Tijorat+ design system: React components and design tokens
shared by every TajERP front-end (POS, CRM, HR, warehouse, accounting,
TijoratAI). Users are small and mid-sized businesses in Tajikistan. They work
in Russian, Tajik and English, count money in somoni, and often run the POS
on a tablet or phone with patchy internet.

## Setup

```bash
npm install
npm run storybook     # http://localhost:6006
npm test              # unit + a11y tests (Vitest, jsdom)
make check            # typecheck + lint + test + build (the CI gate)
```

## Component conventions

### Files and exports

- Each component lives in `src/components/<Name>.tsx`. Its story goes in
  `stories/components/<Name>.stories.tsx` and its tests in `tests/<Name>.test.tsx`.
- Use named exports only. Export the props type as `<Name>Props`. Register
  the component and its types in `src/index.ts`, or in `src/charts.ts` /
  `src/form.ts` when it needs recharts or react-hook-form.
- Every component that renders DOM uses `React.forwardRef`, sets
  `displayName`, and puts `data-slot="<kebab-name>"` on its root and on its
  parts. The peer range is React ≥ 18, and React 18 drops `ref` on plain
  function components.
- `className` is merged last with `cn()`, so consumers can override.

### Styling: tokens only

- **Colour:** use token utilities only, such as `bg-ui-surface`,
  `bg-ui-surface-2`, `bg-ui-surface-warm`, `text-ink-1…4`, `border-hairline`,
  `bg-brand-solid` + `text-on-brand`, `bg-mist` + `text-mist-ink`,
  `text-tj-{success,warning,error,info}-ink`, `bg-ui-overlay` and `rail-*`.
  - Never use hex, `text-white`, `bg-black/…` or Tailwind palette colours (`gray-500`).
  - For text on a coloured fill, use the `*-ink` / `on-brand` pairs; they hold
    4.5:1 contrast.
- **Text size:** use the `text-ui-*` role scale only: `micro` 11, `caption`
  12.5, `helper` 13, `label` 14, `body` 15, `control` 15, `title` 17,
  `heading` 20, `display` 24. Never use `text-[13px]`.
- **Text colour:** `text-ink-3` for meta text (timestamps, captions), and
  `text-ink-4` only for placeholders, disabled text and decorative separators.
- **Weight:** `font-semibold` for titles, tabs and buttons; `font-bold` only for
  the primary (`solid`) button and counters.
- **Surfaces:** cards are flat (hairline edge, no shadow). Separate sections
  with whitespace before reaching for borders; brand green is for primary
  actions, not for decoration or selected rows.
- **Control height:** use `h-control-sm|md|lg` / `size-control-*`, which follow
  `data-density` (`compact` / `comfortable` / `touch`). Fields take a
  `size?: "sm" | "md" | "lg"` prop that defaults to `"md"`.
  - The recipes live in `src/lib/control.ts`: `controlSize`, `controlFrame`,
    `controlFocus`, `controlFocusWithin`, `controlInvalid`, `focusRing`.
- **Focus:** every interactive element has a visible `focus-visible` ring
  using `ring-focus`.
- **Layering:** use `z-(--tj-z-sticky|dropdown|overlay|modal|popover|tooltip|toast)`.
  Never use bare `z-50`.
- **Radius:** use `!rounded-*`. The `!` beats the Frappe desk's Bootstrap
  `!important` utilities.
- **Motion:** prefix movement with `motion-safe:`. Enter/exit animations use
  the `animate-in` / `animate-out` vocabulary defined in `styles/tokens.css`.

### Behaviour

- **State:** support both controlled and uncontrolled use, with these names:
  - `value` / `defaultValue` / `onValueChange`
  - `open` / `defaultOpen` / `onOpenChange`
  - `checked` / `defaultChecked` / `onCheckedChange`
- **Tone vocabulary:** `brand | neutral | success | warning | danger | info`.
  Existing components also accept `error` as an alias of `danger`.
- **Overlays:** portal into `usePortalContainer()` (from `TajUIProvider`), so
  the Frappe desk can scope them under `.tj-react-root`.
- **Strings:** never hard-code UI text.
  - Declare defaults with `defineMessages("<namespace>", { ru, tg, en })` next
    to the component.
  - Read them with `useMessages(defs, props.labels)`.
  - Expose a `labels?: Partial<…>` prop.
  - Shared words (close, cancel, loading, …) come from `useCommonMessages()`.
- **Numbers, money, dates:** use `useFormat()`. It prints `1 234,50 с` in
  ru/tg, and `parseNumber()` accepts both `,` and `.` decimals.
- **Accessibility:** target WCAG 2.2 AA.
  - Composite widgets are keyboard-operable; use `useRovingFocus` for arrow-key
    groups.
  - Icons inside buttons are `aria-hidden`, and icon-only buttons carry a
    label.
  - Pointer targets are at least 24×24 px, and 44 px in `touch` density.
  - Status is never conveyed by colour alone.

### Stories

- Title stories `Components/<Group>/<Name>`. Groups are Actions, Inputs,
  Layout, Data Display, Navigation, Feedback, Overlays, POS and Business.
- Write realistic Russian content, and add at least one Tajik example (the
  letters ӣ ӯ ҳ қ ғ ҷ).
- Add a docs description that says when to use the component.

### Tests

Use `renderWithUI` and `expectNoA11yViolations` from `tests/utils.tsx`. Cover
the keyboard path and the controlled/uncontrolled contract.

## Changes and releases

- Run `npx changeset` for every user-visible change; it writes the next
  CHANGELOG entry.
- For breaking changes, keep the old prop or name working as a deprecated alias
  (with a `@deprecated` JSDoc) for at least one minor release.
- Releases are tag-driven; see the README.
