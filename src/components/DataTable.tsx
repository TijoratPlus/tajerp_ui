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
  defaultSort,
  sort: sortProp,
  onSortChange,
  manualSorting = false,
  renderExpanded,
  expandedKeys,
  onExpandedChange,
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

  const processed = React.useMemo(() => {
    let out = data;
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
  }, [data, searchable, onSearch, getSearchText, query, sort, manualSorting, columnByKey]);

  // Internal pagination slices the processed rows.
  const total = processed.length;
  const pageCount = autoPagination ? Math.max(1, Math.ceil(total / autoSize)) : 1;
  const safePage = Math.min(autoPage, pageCount);
  const rows = autoPagination
    ? processed.slice((safePage - 1) * autoSize, safePage * autoSize)
    : processed;

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
      left += typeof c.width === "number" ? c.width : 0;
    }
    return out;
  }, [columns, selectable, expandable]);
  const anyPinned = Object.keys(pinOffsets).length > 0;

  const cellStyle = (col: DataTableColumn<T>): React.CSSProperties | undefined => {
    const style: React.CSSProperties = {};
    if (col.width != null) style.width = col.width;
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
    : autoPagination
      ? {
          page: safePage,
          pageCount,
          total,
          rangeStart: total === 0 ? 0 : (safePage - 1) * autoSize + 1,
          rangeEnd: Math.min(safePage * autoSize, total),
          pageSize: autoSize,
          pageSizeOptions: autoPagination.pageSizeOptions,
          onPageChange: setAutoPage,
          onPageSizeChange: autoPagination.pageSizeOptions
            ? (s: number) => {
                setAutoSize(s);
                setAutoPage(1);
              }
            : undefined,
        }
      : undefined;

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
          {selectedCount > 0 ? selectedText(selectedCount) : null}
        </span>
      ) : null}
      {selectable && selectedCount > 0 ? (
        <div className="flex flex-wrap items-center gap-2.5 bg-brand-deep px-4 py-2.5 text-on-brand">
          <b className="text-ui-label font-bold">{selectedText(selectedCount)}</b>
          {selectionActions}
        </div>
      ) : null}

      <Table maxHeight={maxHeight}>
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
                  className={cn(pinClass(col, true), col.headClassName)}
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
            rows.map((row, index) => {
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
            })
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

function PlainWrapper({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={className} {...props} />;
}
