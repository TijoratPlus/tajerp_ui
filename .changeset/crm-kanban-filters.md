---
"tajerp_ui": minor
---

CRM building blocks: drag-and-drop, Kanban, filter/sort builders and smaller parts (ru/tg/en, keyboard-operable).

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
