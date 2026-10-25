import { ChevronRight, ChevronsUpDown, ChevronUp } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";
import { toCSV, type CSVOptions } from "../lib/csv";
import { defineMessages } from "../i18n/messages";
import { Checkbox } from "./Checkbox";
import { EmptyState } from "./EmptyState";
import { Pagination } from "./Pagination";
import { SearchField } from "./SearchField";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./Table";
import { useMessages } from "./TajUIProvider";

export type SortDir = "asc" | "desc";
export interface SortState {
  key: string;
  dir: SortDir;
}

export interface DataTableColumn<T> {
  /** Unique key, also used as the sort identifier. */
  key: string;
  header: React.ReactNode;
  /** Cell renderer. */
  cell: (row: T) => React.ReactNode;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  /** Comparable value used when this column is sorted. Required for sorting. */
  sortAccessor?: (row: T) => string | number | null | undefined;
  /** Applied to the header and every body cell. */
  width?: string | number;
  /**
   * Pin to the left edge while scrolling horizontally (e.g. the document
   * number). Pinned columns must come first and need a numeric `width`.
   */
  pin?: "left";
  /** Hide the column without removing it from the definition. */
  hidden?: boolean;
  /**
   * Footer cell (totals row), computed from all filtered rows — not just the
   * current page: `footer: (rows) => money(sum(rows, r => r.total))`.
   */
  footer?: (rows: T[]) => React.ReactNode;
  /** Plain value for CSV export. Falls back to `sortAccessor`. */
  csvValue?: (row: T) => string | number | null | undefined;
  /** Header text for CSV export when `header` is not a string. */
  csvHeader?: string;
  className?: string;
  headClassName?: string;
}

/** Presentational pagination — the caller owns the page state and data slice. */
export interface DataTablePagination {
  page: number;
  pageCount: number;
  total?: number;
  rangeStart?: number;
  rangeEnd?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

const dataTableMessages = defineMessages("dataTable", {
  ru: {
    search: "Поиск",
    searchPlaceholder: "Поиск…",
    selectAll: "Выбрать все",
    selectRow: "Выбрать строку",
    selected: (n: number) => `${n} выбрано`,
    shown: "Показано",
    of: "из",
    total: "Всего",
    rowsPerPage: "Строк:",
    previousPage: "Назад",
    nextPage: "Вперёд",
    page: (n: number) => `Страница ${n}`,
    pagination: "Страницы",
    loading: "Загрузка…",
    empty: "Нет данных",
    expandRow: "Показать подробности",
    collapseRow: "Скрыть подробности",
    resizeColumn: (name: string) => `Ширина колонки «${name}»`,
    selectAllMatching: (n: number) => `Выбрать все ${n}`,
    allMatchingSelected: (n: number) => `Выбраны все ${n}`,
    groupRows: (n: number) => `Строк: ${n}`,
  },
  tg: {
    search: "Ҷустуҷӯ",
    searchPlaceholder: "Ҷустуҷӯ…",
    selectAll: "Ҳамаро интихоб кардан",
    selectRow: "Интихоби сатр",
    selected: (n: number) => `${n} интихоб шуд`,
    shown: "Нишон дода шуд",
    of: "аз",
    total: "Ҳамагӣ",
    rowsPerPage: "Сатрҳо:",
    previousPage: "Қаблӣ",
    nextPage: "Навбатӣ",
    page: (n: number) => `Саҳифаи ${n}`,
    pagination: "Саҳифаҳо",
    loading: "Боркунӣ…",
    empty: "Маълумот нест",
    expandRow: "Нишон додани тафсилот",
    collapseRow: "Пинҳон кардани тафсилот",
    resizeColumn: (name: string) => `Паҳнои сутуни «${name}»`,
    selectAllMatching: (n: number) => `Ҳамаи ${n}-ро интихоб кардан`,
    allMatchingSelected: (n: number) => `Ҳамаи ${n} интихоб шуд`,
    groupRows: (n: number) => `Сатрҳо: ${n}`,
  },
  en: {
    search: "Search",
    searchPlaceholder: "Search…",
    selectAll: "Select all",
    selectRow: "Select row",
    selected: (n: number) => `${n} selected`,
    shown: "Showing",
    of: "of",
    total: "Total",
    rowsPerPage: "Rows:",
    previousPage: "Previous",
    nextPage: "Next",
    page: (n: number) => `Page ${n}`,
    pagination: "Pagination",
    loading: "Loading…",
    empty: "No data",
    expandRow: "Show details",
    collapseRow: "Hide details",
    resizeColumn: (name: string) => `Width of column “${name}”`,
    selectAllMatching: (n: number) => `Select all ${n}`,
    allMatchingSelected: (n: number) => `All ${n} selected`,
    groupRows: (n: number) => `${n} rows`,
  },
});

/** UI strings. Defaults follow the TajUIProvider locale; pass any subset to override. */
export type DataTableLabels = Partial<(typeof dataTableMessages.locales)["ru"]> & {
  /** e.g. `(n) => \`${n} selected\`` */
  selected?: (count: number) => React.ReactNode;
};

/** Internal pagination — DataTable manages page state and slices rows itself. */
export interface DataTableAutoPagination {
  pageSize?: number;
  pageSizeOptions?: number[];
}

/** One section of a grouped table (`groups` prop). */
export interface DataTableGroup<T> {
  key: string;
  label: React.ReactNode;
  /** Row count shown in the header; defaults to `rows.length`. */
  count?: number;
  rows: T[];
  /** Controlled collapsed state; omit to let the table track it. */
  collapsed?: boolean;
}

/** "Select all N matching rows" banner (server-side lists). */
export interface DataTableSelectAllMatching {
  /** Total rows matching the current filters. */
  total: number;
  onSelectAll: () => void;
  /** Every matching row is selected (not just the visible ones). */
  selectedAll: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  rowKey: (row: T) => string;

  /* Toolbar */
  title?: React.ReactNode;
  /** Heading level of the title. Defaults to "h3". */
  titleAs?: "h2" | "h3" | "h4";
  caption?: React.ReactNode;
  toolbar?: React.ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Text matched by the built-in search. Required unless `onSearch` is set. */
  getSearchText?: (row: T) => string;
  /** Server-side search: receives the query; rows are not filtered locally. */
  onSearch?: (query: string) => void;

  /* Selection */
  selectable?: boolean;
  selectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;
  selectionActions?: React.ReactNode;
  /**
   * After selecting the whole page, offer "Select all N" for every row that
   * matches the filters; the selection bar then counts `total`.
   */
  selectAllMatching?: DataTableSelectAllMatching;

  /* Sorting */
  defaultSort?: SortState;
  /** Controlled sort. */
  sort?: SortState;
  onSortChange?: (sort: SortState | undefined) => void;
  /** Rows arrive sorted (server-side); headers only report sort changes. */
  manualSorting?: boolean;

  /* Expandable rows */
  renderExpanded?: (row: T) => React.ReactNode;
  expandedKeys?: Set<string>;
  onExpandedChange?: (keys: Set<string>) => void;

  /* Grouping */
  /**
   * Group-by mode: rows render under collapsible section headers instead of
   * `data` (search and sort still apply within each group; pagination does not).
   */
  groups?: DataTableGroup<T>[];
  onGroupToggle?: (key: string) => void;

  /* Column resizing */
  /** Drag (or arrow-key) handles on header edges. */
  resizableColumns?: boolean;
  /** Fires when a resize ends, with the new width in px. */
  onColumnResize?: (key: string, width: number) => void;

  /* Pagination — choose one */
  pagination?: DataTablePagination;
  autoPagination?: DataTableAutoPagination;

  /* States */
  loading?: boolean;
  skeletonRows?: number;
  emptyState?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;

  /* Layout */
  bordered?: boolean;
  /** Row density; defaults to the surrounding `data-density`. */
  density?: "compact" | "comfortable" | "touch";
  rowHeight?: number;
  /** Scroll height limit; the header sticks while the body scrolls. */
  maxHeight?: number | string;
  stopPropagationColumnKeys?: string[];
  footer?: React.ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
  labels?: DataTableLabels;
}

function compare(
  a: string | number | null | undefined,
  b: string | number | null | undefined,
): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true });
}

function SortIcon({ dir }: { dir?: SortDir }) {
  if (!dir) return <ChevronsUpDown className="size-3 opacity-50" aria-hidden />;
  return (
    <ChevronUp
      aria-hidden
      className={cn(
        "size-3 text-brand transition-transform",
        dir === "desc" && "rotate-180",
      )}
    />
  );
}

const SELECT_COL_WIDTH = 44;
const EXPAND_COL_WIDTH = 40;

/**
 * Build a CSV string from DataTable rows and columns (uses each column's
 * `csvValue`, then `sortAccessor`). Pair with `downloadFile` from
 * `tajerp_ui` or an ExportMenu.
 */
export function dataTableToCSV<T>(
  rows: T[],
  columns: DataTableColumn<T>[],
  options?: CSVOptions,
): string {
  const exportable = columns.filter(
    (c) => !c.hidden && (c.csvValue || c.sortAccessor),
  );
  return toCSV(
    rows,
    exportable.map((c) => ({
      header:
        c.csvHeader ?? (typeof c.header === "string" ? c.header : c.key),
      value: (row: T) => (c.csvValue ?? c.sortAccessor)!(row),
    })),
    options,
  );
}

export function DataTable<T>({
  data,
  columns: allColumns,
  rowKey,
  title,
  titleAs: TitleTag = "h3",
  caption,
  toolbar,
  searchable = false,
  searchPlaceholder,
  getSearchText,
  onSearch,
  selectable = false,
  selectedKeys,
  onSelectionChange,
  selectionActions,
  selectAllMatching,
  defaultSort,
  sort: sortProp,
  onSortChange,
  manualSorting = false,
  renderExpanded,
  expandedKeys,
  onExpandedChange,
  groups,
  onGroupToggle,
  resizableColumns = false,
  onColumnResize,
  pagination,
  autoPagination,
  loading = false,
  skeletonRows = 5,
  emptyState,
  emptyTitle,
  emptyDescription,
  bordered = true,
  density,
  rowHeight,
  maxHeight,
  stopPropagationColumnKeys = [],
  footer,
  onRowClick,
  className,
  labels,
}: DataTableProps<T>) {
  const { selected: selectedLabel, ...stringLabels } = labels ?? {};
  const t = useMessages(dataTableMessages, stringLabels);
  const selectedText = (n: number) => (selectedLabel ? selectedLabel(n) : t.selected(n));

  const columns = React.useMemo(
    () => allColumns.filter((c) => !c.hidden),
    [allColumns],
  );

  const [query, setQuery] = React.useState("");
  const [internalSort, setInternalSort] = React.useState<SortState | undefined>(
    defaultSort,
  );
  const sort = sortProp !== undefined ? sortProp : internalSort;
  const [internalSel, setInternalSel] = React.useState<Set<string>>(() => new Set());
  const [internalExpanded, setInternalExpanded] = React.useState<Set<string>>(
    () => new Set(),
  );
  const expanded = expandedKeys ?? internalExpanded;
  const [autoPage, setAutoPage] = React.useState(1);
  const [autoSize, setAutoSize] = React.useState(autoPagination?.pageSize ?? 20);
  const lastToggled = React.useRef<number | null>(null);
  const shiftPressed = React.useRef(false);

  const misconfiguredSearch = searchable && !getSearchText && !onSearch;
  React.useEffect(() => {
    if (misconfiguredSearch) {
      console.warn(
        "DataTable: `searchable` needs `getSearchText` (client-side) or `onSearch` (server-side).",
      );
    }
  }, [misconfiguredSearch]);

  const selection = selectedKeys ?? internalSel;
  const setSelection = (next: Set<string>) => {
    if (!selectedKeys) setInternalSel(next);
    onSelectionChange?.(next);
  };

  const columnByKey = React.useMemo(
    () => Object.fromEntries(columns.map((c) => [c.key, c])),
    [columns],
  );

  // Back to page 1 when sort or search changes. Data refreshes keep the page
  // (it is clamped below if the data shrank).
  React.useEffect(() => {
    setAutoPage(1);
  }, [sort?.key, sort?.dir, query]);

  const processRows = React.useCallback((input: T[]) => {
    let out = input;
    if (searchable && !onSearch && getSearchText && query.trim()) {
      const q = query.trim().toLowerCase();
      out = out.filter((r) => getSearchText(r).toLowerCase().includes(q));
    }
    if (sort && !manualSorting) {
      const accessor = columnByKey[sort.key]?.sortAccessor;
      if (accessor) {
        out = [...out].sort(
          (a, b) => compare(accessor(a), accessor(b)) * (sort.dir === "asc" ? 1 : -1),
        );
      }
    }
    return out;
  }, [searchable, onSearch, getSearchText, query, sort, manualSorting, columnByKey]);

  // Group-by mode: each group's rows are searched/sorted on their own.
  const [internalCollapsed, setInternalCollapsed] = React.useState<Set<string>>(
    () => new Set(),
  );
  const isGroupCollapsed = (g: DataTableGroup<T>) =>
    g.collapsed ?? internalCollapsed.has(g.key);
  const grouped = React.useMemo(
    () => groups?.map((group) => ({ group, rows: processRows(group.rows) })),
    [groups, processRows],
  );
  const toggleGroup = (g: DataTableGroup<T>) => {
    if (g.collapsed === undefined) {
      const next = new Set(internalCollapsed);
      if (next.has(g.key)) next.delete(g.key);
      else next.add(g.key);
      setInternalCollapsed(next);
    }
    onGroupToggle?.(g.key);
  };

  const processed = React.useMemo(
    () => (grouped ? grouped.flatMap((x) => x.rows) : processRows(data)),
    [grouped, processRows, data],
  );

  // Internal pagination slices the processed rows (not in group-by mode).
  const paged = !!autoPagination && !grouped;
  const total = processed.length;
  const pageCount = paged ? Math.max(1, Math.ceil(total / autoSize)) : 1;
  const safePage = Math.min(autoPage, pageCount);
  const rows = grouped
    ? grouped.flatMap((x) => (isGroupCollapsed(x.group) ? [] : x.rows))
    : paged
      ? processed.slice((safePage - 1) * autoSize, safePage * autoSize)
      : processed;

  // Column widths set by dragging a header edge (resizableColumns).
  const [widths, setWidths] = React.useState<Record<string, number>>({});
  const widthOf = (col: DataTableColumn<T>) => widths[col.key] ?? col.width;

  const allSelected = rows.length > 0 && rows.every((r) => selection.has(rowKey(r)));
  const someSelected = rows.some((r) => selection.has(rowKey(r)));

  const toggleAll = () => {
    const next = new Set(selection);
    if (allSelected) rows.forEach((r) => next.delete(rowKey(r)));
    else rows.forEach((r) => next.add(rowKey(r)));
    setSelection(next);
  };
  const toggleRow = (index: number) => {
    const k = rowKey(rows[index]);
    const next = new Set(selection);
    const select = !next.has(k);
    // Shift+click selects (or clears) the range since the last toggled row.
    if (shiftPressed.current && lastToggled.current !== null) {
      const [from, to] = [lastToggled.current, index].sort((a, b) => a - b);
      for (let i = from; i <= to; i++) {
        const key = rowKey(rows[i]);
        if (select) next.add(key);
        else next.delete(key);
      }
    } else if (select) next.add(k);
    else next.delete(k);
    lastToggled.current = index;
    setSelection(next);
  };

  const toggleExpanded = (k: string) => {
    const next = new Set(expanded);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    if (!expandedKeys) setInternalExpanded(next);
    onExpandedChange?.(next);
  };

  const onHeaderSort = (col: DataTableColumn<T>) => {
    if (!col.sortable) return;
    // asc → desc → unsorted
    const next: SortState | undefined =
      sort?.key !== col.key
        ? { key: col.key, dir: "asc" }
        : sort.dir === "asc"
          ? { key: col.key, dir: "desc" }
          : undefined;
    if (sortProp === undefined) setInternalSort(next);
    onSortChange?.(next);
  };

  const selectedCount = selection.size;
  const showToolbar = title || caption || searchable || toolbar;
  const expandable = !!renderExpanded;
  const leadCols = (selectable ? 1 : 0) + (expandable ? 1 : 0);
  const colSpan = columns.length + leadCols;
  const hasFooterRow = columns.some((c) => c.footer);

  // Left offsets for pinned columns (after the selection/expand columns).
  const pinOffsets = React.useMemo(() => {
    const out: Record<string, number> = {};
    let left = (selectable ? SELECT_COL_WIDTH : 0) + (expandable ? EXPAND_COL_WIDTH : 0);
    for (const c of columns) {
      if (c.pin !== "left") break;
      out[c.key] = left;
      const w = widths[c.key] ?? c.width;
      left += typeof w === "number" ? w : 0;
    }
    return out;
  }, [columns, selectable, expandable, widths]);
  const anyPinned = Object.keys(pinOffsets).length > 0;

  // Fixed layout with a width on every column: the table is at least as wide as their sum
  // (so it scrolls instead of squeezing) and the last column takes any spare width (so it
  // never ends short of the container or clips its own content).
  const lastKey = columns[columns.length - 1]?.key;
  const fixedMinWidth = React.useMemo(() => {
    if (!resizableColumns || !columns.length) return undefined;
    const parts: string[] = [];
    if (selectable) parts.push(`${SELECT_COL_WIDTH}px`);
    if (renderExpanded) parts.push(`${EXPAND_COL_WIDTH}px`);
    for (const col of columns) {
      const w = widths[col.key] ?? col.width;
      if (w == null) return undefined;
      const css = typeof w === "number" ? `${w}px` : w;
      // The flexible last column only reserves a small floor, so a table a few pixels wider
      // than its container fits instead of scrolling.
      parts.push(col.key === lastKey ? `min(${css}, 5rem)` : css);
    }
    return `calc(${parts.join(" + ")})`;
  }, [resizableColumns, columns, widths, selectable, renderExpanded, lastKey]);

  const cellStyle = (col: DataTableColumn<T>): React.CSSProperties | undefined => {
    const style: React.CSSProperties = {};
    const w = widthOf(col);
    if (w != null && !(fixedMinWidth && col.key === lastKey)) style.width = w;
    if (pinOffsets[col.key] != null) style.left = pinOffsets[col.key];
    return Object.keys(style).length ? style : undefined;
  };
  const pinClass = (col: DataTableColumn<T>, head = false) =>
    pinOffsets[col.key] != null
      ? cn("sticky bg-ui-surface", head ? "z-(--tj-z-sticky) bg-ui-bg" : "z-[1]")
      : undefined;
  const leadPin = anyPinned ? "sticky left-0 z-[1] bg-ui-surface" : undefined;

  // Footer pagination model (presentational `pagination` wins over auto).
  const footerPager = pagination
    ? pagination
    : paged
      ? {
          page: safePage,
          pageCount,
          total,
          rangeStart: total === 0 ? 0 : (safePage - 1) * autoSize + 1,
          rangeEnd: Math.min(safePage * autoSize, total),
          pageSize: autoSize,
          pageSizeOptions: autoPagination!.pageSizeOptions,
          onPageChange: setAutoPage,
          onPageSizeChange: autoPagination!.pageSizeOptions
            ? (s: number) => {
                setAutoSize(s);
                setAutoPage(1);
              }
            : undefined,
        }
      : undefined;

  const renderRow = (row: T, index: number) => {
              const k = rowKey(row);
              const isSel = selection.has(k);
              const isOpen = expandable && expanded.has(k);
              const detailsId = `dt-${k}-details`;
              return (
                <React.Fragment key={k}>
                  <TableRow
                    selected={isSel}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    onKeyDown={
                      onRowClick
                        ? (e) => {
                            if (e.target !== e.currentTarget) return;
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onRowClick(row);
                            }
                          }
                        : undefined
                    }
                    className={
                      onRowClick
                        ? "cursor-pointer outline-none focus-visible:bg-mist focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
                        : undefined
                    }
                    style={rowHeight != null ? { height: rowHeight } : undefined}
                  >
                    {selectable ? (
                      <TableCell
                        className={cn("pr-0", leadPin)}
                        onClick={(e) => e.stopPropagation()}
                        onPointerDownCapture={(e) => {
                          shiftPressed.current = e.shiftKey;
                        }}
                        onKeyDownCapture={(e) => {
                          shiftPressed.current = e.shiftKey;
                        }}
                      >
                        <Checkbox
                          checked={isSel}
                          onCheckedChange={() => toggleRow(index)}
                          aria-label={t.selectRow}
                        />
                      </TableCell>
                    ) : null}
                    {expandable ? (
                      <TableCell className="pr-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={isOpen ? detailsId : undefined}
                          aria-label={isOpen ? t.collapseRow : t.expandRow}
                          onClick={() => toggleExpanded(k)}
                          className="inline-flex size-6 items-center justify-center !rounded-md text-ink-3 outline-none transition-colors hover:bg-ui-surface-2 hover:text-ink-1 focus-visible:ring-2 focus-visible:ring-focus cursor-pointer"
                        >
                          <ChevronRight
                            aria-hidden
                            className={cn(
                              "size-4 transition-transform duration-150",
                              isOpen && "rotate-90",
                            )}
                          />
                        </button>
                      </TableCell>
                    ) : null}
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        align={col.align}
                        style={cellStyle(col)}
                        className={cn(pinClass(col), col.className)}
                        onClick={
                          stopPropagationColumnKeys.includes(col.key)
                            ? (e) => e.stopPropagation()
                            : undefined
                        }
                      >
                        {col.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                  {isOpen ? (
                    <TableRow id={detailsId} className="bg-ui-bg hover:bg-ui-bg">
                      <TableCell colSpan={colSpan} className="px-4 py-3">
                        {renderExpanded!(row)}
                      </TableCell>
                    </TableRow>
                  ) : null}
                </React.Fragment>
              );
  };

  const renderGroups = () => {
    let offset = 0;
    return grouped!.map(({ group, rows: groupRows }) => {
      const collapsed = isGroupCollapsed(group);
      const start = offset;
      if (!collapsed) offset += groupRows.length;
      const count = group.count ?? groupRows.length;
      return (
        <React.Fragment key={`group:${group.key}`}>
          <TableRow data-slot="data-table-group" className="bg-ui-bg hover:bg-ui-bg">
            <TableCell colSpan={colSpan} className="py-1.5">
              <button
                type="button"
                aria-expanded={!collapsed}
                onClick={() => toggleGroup(group)}
                className="inline-flex cursor-pointer items-center gap-1.5 !rounded-sm px-1 text-ui-label font-semibold text-ink-1 outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <ChevronRight
                  aria-hidden
                  className={cn("size-4 transition-transform duration-150", !collapsed && "rotate-90")}
                />
                {group.label}
                <span className="text-ui-caption font-medium text-ink-3" aria-label={t.groupRows(count)}>
                  {count}
                </span>
              </button>
            </TableCell>
          </TableRow>
          {collapsed ? null : groupRows.map((row, i) => renderRow(row, start + i))}
        </React.Fragment>
      );
    });
  };

  const Wrapper = bordered ? TableContainer : PlainWrapper;
  const isEmpty = !loading && processed.length === 0;

  return (
    <Wrapper
      className={className}
      aria-busy={loading || undefined}
      data-density={density}
      data-slot="data-table"
    >
      {showToolbar ? (
        <div className="flex flex-wrap items-center gap-2 border-b-[1.5px] border-hairline px-4 py-3">
          {(title || caption) && (
            <TitleTag className="text-ui-title font-bold text-ink-1">
              {title}
              {caption ? (
                <span className="ml-2 text-ui-label font-medium text-ink-3">{caption}</span>
              ) : null}
            </TitleTag>
          )}
          <div className="flex-1" />
          {searchable ? (
            <SearchField
              size="sm"
              aria-label={t.search}
              value={query}
              onValueChange={(v) => {
                setQuery(v);
                onSearch?.(v);
              }}
              placeholder={searchPlaceholder ?? t.searchPlaceholder}
              className="w-full sm:w-[260px]"
            />
          ) : null}
          {toolbar}
        </div>
      ) : null}

      {/* Always mounted, so screen readers announce selection changes. */}
      {selectable ? (
        <span role="status" className="sr-only">
          {selectedCount > 0
            ? selectAllMatching?.selectedAll
              ? t.allMatchingSelected(selectAllMatching.total)
              : selectedText(selectedCount)
            : null}
        </span>
      ) : null}
      {selectable && selectedCount > 0 ? (
        <div
          data-slot="data-table-selection-bar"
          className="flex flex-wrap items-center gap-2.5 bg-brand-deep px-4 py-2.5 text-on-brand"
        >
          <b className="text-ui-label font-bold">
            {selectedText(selectAllMatching?.selectedAll ? selectAllMatching.total : selectedCount)}
          </b>
          {selectAllMatching && !selectAllMatching.selectedAll && allSelected &&
          selectAllMatching.total > selectedCount ? (
            <>
              <span aria-hidden>·</span>
              <button
                type="button"
                data-slot="data-table-select-all-matching"
                onClick={selectAllMatching.onSelectAll}
                className="cursor-pointer !rounded-sm text-ui-label font-semibold underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-on-brand"
              >
                {t.selectAllMatching(selectAllMatching.total)}
              </button>
            </>
          ) : null}
          {selectionActions}
        </div>
      ) : null}

      <Table
        maxHeight={maxHeight}
        style={resizableColumns ? { tableLayout: "fixed", minWidth: fixedMinWidth } : undefined}
      >
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {selectable ? (
              <TableHead
                sticky={maxHeight != null}
                className={cn("pr-0", leadPin && "left-0 sticky z-(--tj-z-sticky)")}
                style={{ width: SELECT_COL_WIDTH }}
              >
                <Checkbox
                  checked={allSelected}
                  indeterminate={!allSelected && someSelected}
                  onCheckedChange={toggleAll}
                  disabled={loading || rows.length === 0}
                  aria-label={t.selectAll}
                />
              </TableHead>
            ) : null}
            {expandable ? (
              <TableHead
                sticky={maxHeight != null}
                style={{ width: EXPAND_COL_WIDTH }}
                className="pr-0"
              >
                <span className="sr-only">{t.expandRow}</span>
              </TableHead>
            ) : null}
            {columns.map((col) => {
              const dir = sort?.key === col.key ? sort.dir : undefined;
              const inner = (
                <>
                  {col.header}
                  {col.sortable ? <SortIcon dir={dir} /> : null}
                </>
              );
              return (
                <TableHead
                  key={col.key}
                  align={col.align}
                  sticky={maxHeight != null}
                  aria-sort={
                    col.sortable
                      ? dir === "asc"
                        ? "ascending"
                        : dir === "desc"
                          ? "descending"
                          : "none"
                      : undefined
                  }
                  style={cellStyle(col)}
                  className={cn(
                    pinClass(col, true),
                    resizableColumns && pinOffsets[col.key] == null && "relative",
                    col.headClassName,
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => onHeaderSort(col)}
                      className={cn(
                        "-mx-1 inline-flex items-center gap-1.5 !rounded-sm px-1 uppercase tracking-[inherit] outline-none transition-colors cursor-pointer hover:text-ink-1 focus-visible:ring-2 focus-visible:ring-focus",
                        col.align === "right" && "flex-row-reverse",
                      )}
                    >
                      {inner}
                    </button>
                  ) : (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        col.align === "right" && "flex-row-reverse",
                      )}
                    >
                      {inner}
                    </span>
                  )}
                  {resizableColumns ? (
                    <ColumnResizeHandle
                      label={t.resizeColumn(
                        typeof col.header === "string" ? col.header : (col.csvHeader ?? col.key),
                      )}
                      width={widthOf(col)}
                      onResize={(w) => setWidths((prev) => ({ ...prev, [col.key]: w }))}
                      onResizeEnd={(w) => onColumnResize?.(col.key, w)}
                    />
                  ) : null}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <TableRow key={`sk${i}`} aria-hidden className="hover:bg-transparent">
                {Array.from({ length: colSpan }).map((__, j) => (
                  <TableCell key={j}>
                    <div
                      className={cn(
                        "h-3 !rounded bg-ui-surface-2 motion-safe:animate-pulse",
                        j < leadCols ? "w-[18px]" : j === leadCols ? "w-3/4" : "w-1/2",
                      )}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : isEmpty ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={colSpan} className="p-0">
                {emptyState ?? (
                  <EmptyState title={emptyTitle ?? t.empty} description={emptyDescription} />
                )}
              </TableCell>
            </TableRow>
          ) : (
            grouped ? (
              renderGroups()
            ) : (
              rows.map(renderRow)
            )
          )}
        </TableBody>
        {hasFooterRow && !loading && !isEmpty ? (
          <TableFooter>
            <TableRow className="hover:bg-transparent">
              {leadCols > 0 ? <TableCell colSpan={leadCols} /> : null}
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  align={col.align}
                  style={cellStyle(col)}
                  className={cn(pinClass(col), pinOffsets[col.key] != null && "bg-ui-bg")}
                >
                  {col.footer?.(processed)}
                </TableCell>
              ))}
            </TableRow>
          </TableFooter>
        ) : null}
      </Table>

      {footerPager && !loading && processed.length > 0 ? (
        <Pagination
          className="border-t-[1.5px] border-hairline px-4 py-2.5"
          {...footerPager}
          labels={{
            shown: t.shown,
            of: t.of,
            total: t.total,
            rowsPerPage: t.rowsPerPage,
            previous: t.previousPage,
            next: t.nextPage,
            page: t.page,
            label: t.pagination,
          }}
        />
      ) : null}

      {footer}
    </Wrapper>
  );
}

const MIN_COL_WIDTH = 48;
const MAX_COL_WIDTH = 1200;

function ColumnResizeHandle({
  label,
  width,
  onResize,
  onResizeEnd,
}: {
  label: string;
  width: string | number | undefined;
  onResize: (width: number) => void;
  onResizeEnd: (width: number) => void;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const start = React.useRef<{ x: number; width: number } | null>(null);
  const last = React.useRef<number>(typeof width === "number" ? width : 0);
  // Auto-width columns: report the rendered width to assistive tech.
  const [measured, setMeasured] = React.useState<number>(MIN_COL_WIDTH);
  React.useLayoutEffect(() => {
    if (typeof width === "number") return;
    const w = ref.current?.parentElement?.getBoundingClientRect().width;
    if (w) setMeasured(Math.round(w));
  }, [width]);
  const clamp = (n: number) => Math.round(Math.min(MAX_COL_WIDTH, Math.max(MIN_COL_WIDTH, n)));
  const current = (el: HTMLElement) =>
    typeof width === "number"
      ? width
      : el.parentElement?.getBoundingClientRect().width || 160;

  return (
    <span
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      ref={ref}
      aria-valuenow={typeof width === "number" ? Math.round(width) : measured}
      aria-valuemin={MIN_COL_WIDTH}
      aria-valuemax={MAX_COL_WIDTH}
      tabIndex={0}
      data-slot="data-table-resize-handle"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.setPointerCapture?.(e.pointerId);
        start.current = { x: e.clientX, width: current(e.currentTarget) };
      }}
      onPointerMove={(e) => {
        if (!start.current) return;
        last.current = clamp(start.current.width + e.clientX - start.current.x);
        onResize(last.current);
      }}
      onPointerUp={(e) => {
        if (!start.current) return;
        e.currentTarget.releasePointerCapture?.(e.pointerId);
        start.current = null;
        onResizeEnd(last.current);
      }}
      onKeyDown={(e) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        const step = e.shiftKey ? 64 : 16;
        const next = clamp(current(e.currentTarget) + (e.key === "ArrowRight" ? step : -step));
        last.current = next;
        onResize(next);
        onResizeEnd(next);
      }}
      className="absolute top-0 right-0 z-[1] h-full w-2 cursor-col-resize touch-none select-none outline-none hover:bg-brand/30 focus-visible:bg-brand"
    />
  );
}

function PlainWrapper({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={className} {...props} />;
}
