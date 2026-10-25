# tajerp_ui

## 0.4.0

### Minor Changes

- aff7ce1: CRM building blocks: a rich-text editor entry, an event calendar and time pickers.

  **New entry `tajerp_ui/editor`** (tiptap stays out of apps that do not import it)

  - `RichTextEditor`: HTML value (`value` / `defaultValue` / `onValueChange`), toolbar (headings, marks, lists, task lists, quote, code, alignment, link, image, table, emoji, clear), `@` mentions (`mentions` search), image button/paste/drop (`onImageUpload`), Mod+Enter `onSubmit`, read mode with `editable={false}`, `extensions` (same name replaces a built-in) and `replaceStarterKit` (e.g. `{ paragraph: false }`), `onEditorReady`.
  - `RichTextContent` renders stored HTML with the same typography, through `sanitizeHtml`.
  - Prose styles live in `styles/editor.css` (`.tj-prose`), already imported by `styles/index.css` and the compiled stylesheet.

  **Main entry**

  - `EventCalendar`: day / week / month views, toolbar (Today, previous/next, title, view switcher), all-day row, current-time line, drag to create, move and resize (pointer events), Alt+arrow keyboard moves.
  - `TimePicker` (typed `930` / `9:30` or slot list), `DateTimePicker` (`dd.mm.yyyy HH:mm` with calendar + time slots) and `DurationInput` (seconds split into days/hours/minutes/seconds).
  - Helpers `parseTimeInput`, `formatTimeOfDay`, `parseDateTimeInput`, `formatDateTimeInput`.

- aff7ce1: CRM building blocks: drag-and-drop, Kanban, filter/sort builders and smaller parts (ru/tg/en, keyboard-operable).

  **New components (main entry)**

  - `SortableList`, `DragHandle`, `arrayMove` — drag-to-reorder on @dnd-kit with mouse, touch and keyboard (Space, arrows, Space) and localized screen-reader announcements; vertical, horizontal or grid.
  - `KanbanBoard` — cards drag within and between columns (`onMove({ itemId, fromColumn, toColumn, toIndex })`), optional column reorder (`onColumnsReorder`), collapse to a strip, «Загрузить ещё», «+» per column, header slot and footer.
  - `FilterBuilder` / `FilterPopover` — flat AND list or nested and/or groups (`nested`); type-aware operators (`defaultOperators`) and value inputs, `TIMESPAN_OPTIONS`, `renderValueInput` override, «Фильтр (n)» button with «Очистить всё».
  - `SortBuilder` / `SortPopover` — multi-rule sort, reorderable by drag or keyboard.
  - `EmojiPicker`, `EmojiPickerPanel`, `IconPicker` — gemoji search and categories.
  - `AvatarGroup`, `ResizablePanel` (keyboard separator, width in localStorage), `AudioPlayer` (seek, 0.5–2× speed), `ChipInput` (Enter/comma/paste, async suggestions, validation).

  **`tajerp_ui/charts`**

  - `GridLayout` — dashboard grid on react-grid-layout (drag/resize in `editable` mode). Its CSS (`styles/grid-layout.css`) is imported by `styles/index.css` and the compiled stylesheet, so no extra import is needed.

  **Extended**

  - `DataTable`: `groups` + `onGroupToggle` (group-by sections), `resizableColumns` + `onColumnResize`, `selectAllMatching` («Выбрано 20 · Выбрать все 245»). Existing props are unchanged.
  - `FileUpload`: `camera` (getUserMedia capture with switch/take/retake/use → JPEG File in `value`) and `linkInput` + `onLink` («По ссылке»).

- a7c7e11: Design-system overhaul: i18n (ru/tg/en), density modes, ERP/POS components, bug fixes and quality tooling.

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

- aff7ce1: Typography and dialog polish for data-dense apps.

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
