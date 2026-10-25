---
"tajerp_ui": minor
---

CRM building blocks: a rich-text editor entry, an event calendar and time pickers.

**New entry `tajerp_ui/editor`** (tiptap stays out of apps that do not import it)

- `RichTextEditor`: HTML value (`value` / `defaultValue` / `onValueChange`), toolbar (headings, marks, lists, task lists, quote, code, alignment, link, image, table, emoji, clear), `@` mentions (`mentions` search), image button/paste/drop (`onImageUpload`), Mod+Enter `onSubmit`, read mode with `editable={false}`, `extensions` (same name replaces a built-in) and `replaceStarterKit` (e.g. `{ paragraph: false }`), `onEditorReady`.
- `RichTextContent` renders stored HTML with the same typography, through `sanitizeHtml`.
- Prose styles live in `styles/editor.css` (`.tj-prose`), already imported by `styles/index.css` and the compiled stylesheet.

**Main entry**

- `EventCalendar`: day / week / month views, toolbar (Today, previous/next, title, view switcher), all-day row, current-time line, drag to create, move and resize (pointer events), Alt+arrow keyboard moves.
- `TimePicker` (typed `930` / `9:30` or slot list), `DateTimePicker` (`dd.mm.yyyy HH:mm` with calendar + time slots) and `DurationInput` (seconds split into days/hours/minutes/seconds).
- Helpers `parseTimeInput`, `formatTimeOfDay`, `parseDateTimeInput`, `formatDateTimeInput`.
