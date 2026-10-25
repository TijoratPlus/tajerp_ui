---
"tajerp_ui": minor
---

Typography and dialog polish for data-dense apps.

- `body` now sets `font-size: var(--tj-fs-ui-body)` and `line-height: var(--tj-lh-body)`. Unsized text no longer falls back to the browser's 16px.
- Dialog, AlertDialog, Sheet, Popover and DropdownMenu content render at `text-ui-body`.
- Dialog:
  - New `DialogBody`: a scrolling middle between a fixed header and footer, with unclipped focus rings.
  - `DialogContent` is a flex column with `p-5 gap-4`.
  - `DialogHeader` is left-aligned on every breakpoint.
  - `DialogTitle` / `AlertDialogTitle` use `text-ui-title font-semibold`.
  - `DialogDescription` / `SheetDescription` use `text-ui-label`.
- Sheet:
  - Header and footer padding are 16px.
  - Title uses `text-ui-title`.
- Card:
  - `CardTitle` uses `text-ui-title`.
  - `CardDescription` uses `text-ui-label`.
- StatCard:
  - The value is 18px (`--tj-fs-md`).
  - New `valueClassName` prop.
- StateView / EmptyState:
  - `compact` uses a 40px icon.
  - The description uses `text-ui-label`.
- Table header cells follow the density (`py-cell-y`).
- Breadcrumb no longer wraps; the last item truncates.
- Underline Tabs scroll horizontally without a visible scrollbar, and triggers no longer wrap.
