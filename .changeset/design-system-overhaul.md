---
"tajerp_ui": minor
---

Design-system overhaul: i18n (ru/tg/en), density modes, ERP/POS components, bug fixes and quality tooling.

**Foundations**

- `TajUIProvider` sets the locale, per-namespace string overrides, currency and portal container (`scopedPortal` for the Frappe desk).
- `useFormat()` / `formatMoney()` print `1 234,50 с`, and `parseNumber()` accepts `,` and `.`.
- New tokens:
  - `text-ui-*` type scale
  - `--tj-z-*` layers
  - density-aware control heights (`data-density`)
  - `ring-focus`
  - 8-colour chart palette
  - warm cream surfaces
  - `danger-solid`
  - overlay and rail tokens
- Brand-derived values now use `color-mix()`.
- `base.css` (shadcn names) and `frappe-theme.css` now derive from the brand tokens in both themes. `styles/index.css` includes the frappe remaps, as documented.
- Self-hosted Inter: `styles/fonts-local.css`.
- Status inks are darker so badges keep 4.5:1 contrast on tinted backgrounds.

**Fixes**

- Card: presets keep their own shadow, because `elevation` no longer has a default.
- Form:
  - guards throw outside `FormField` / `FormItem`
  - `aria-describedby` only references a description that exists
- Autocomplete:
  - forwards `id` / `name` / `aria-*` to the input
  - re-syncs text when a controlled value changes
  - reverts an uncommitted query on blur
  - skips disabled options when navigating with the keyboard
- NumberField:
  - accepts comma decimals
  - steps by the exact step (no float noise), and supports ArrowUp/ArrowDown and `onClear`
  - `prefix` accepts ReactNode
- DataTable:
  - keeps the page when the parent re-renders
  - keeps the header in empty and loading states
- Toast: separate polite and assertive live regions, so nothing is announced twice.
- Sidebar:
  - opens the active item's group when `activeId` changes
  - labelled navigation landmark
- Dialog / Sheet / Popover / Tooltip and the other Radix wrappers forward refs on React 18.
- Danger buttons are readable in dark mode.

**New props**

- DataTable: controlled and server-side sort, `maxHeight` (sticky header), `density`, pinned columns, `footer` totals row, `renderExpanded`, shift-click range selection, `dataTableToCSV`, `titleAs`.
- Field sizes: `size` on Input, Select, SearchField, NumberField and Autocomplete. Button gains the `xl`, `icon-sm` and `icon-lg` sizes.
- Toast: `toast.loading`, `toast.update`, `toast.promise`, `action`, Toaster `limit`.
- Tabs: `keepMounted`, `variant="pills"`, `badge`, `id`.
- Card: `surface` (including `warm`). Avatar: `size`. Dialog: `size`. Slider: `thumbLabels`.
- Routing: Sidebar and Breadcrumb `renderLink`, Link `asChild`.
- Checkbox / Switch: `name` / `value` for native forms.

**New components**

- Overlays: DropdownMenu, AlertDialog + `confirm()`, HoverCard.
- Search: Command palette + `useHotkey`, MultiSelect.
- Dates: Calendar, DatePicker, DateRangePicker.
- Choice controls: RadioGroup, Toggle, ToggleGroup.
- Feedback and layout: Progress, Collapsible, ScrollArea, Alert, Banner, Kbd, Stepper.
- Data display: DescriptionList, StatCard / Delta / Sparkline, ActivityTimeline, FileUpload, Pagination, StateView, InputGroup.
- POS:
  - Money, MoneyInput, PhoneInput (+992), Numpad, BarcodeInput + `useBarcodeScanner`
  - ProductTile, CartLine, CartSummary, PaymentSplit
  - ReceiptPreview + `printReceipt`, SyncStatus / OfflineIndicator + `useOnlineStatus`
- TijoratAI: ApprovalCard, ChatBubble, AIAssistantPanel.
- Shell and business: AppShell, Topbar, BranchSwitcher, LanguageSwitcher, FilterBar, ExportMenu, `toCSV` / `downloadFile`.
- Charts: AxisChart gains area and stacked series, value formats, the token palette, loading and empty states, and an accessible data table. DonutChart is new.

**Deprecations** (they still work)

- SegmentedControl / Autocomplete `onChange` → `onValueChange`
- Card `tone` → `surface`
- Pill `dark` → `surface="dark"`

**Behaviour changes**

- Component strings now follow the locale and default to Russian. Some defaults were English before ("Close", "No results", "Search…"); they are now Russian unless `<TajUIProvider locale="en">` is set.
- `Input`'s `size` prop is now the control size (`sm | md | lg`). Use `htmlSize` for the native attribute.
- Table borders moved from rows to cells (`border-separate`) so sticky headers keep their borders.
- The bundle now ships one module per component, so bundlers tree-shake per component (Button + Card ≈ 10 kB brotli instead of the whole library).
