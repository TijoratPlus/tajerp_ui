import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  Search,
} from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";
import { Checkbox } from "./Checkbox";
import { EmptyState } from "./EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "./Table";

export type SortDir = "asc" | "desc";

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
  width?: string | number;
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

/** UI strings. Defaults are Russian; pass any subset to localise. */
export interface DataTableLabels {
  search?: string;
  selectAll?: string;
  selectRow?: string;
  /** e.g. `(n) => \`${n} selected\`` */
  selected?: (count: number) => React.ReactNode;
  shown?: string;
  of?: string;
  total?: string;
  rowsPerPage?: string;
  previousPage?: string;
  nextPage?: string;
  /** Accessible name of a numbered page button. */
  page?: (page: number) => string;
  pagination?: string;
  loading?: string;
}

const DEFAULT_LABELS: Required<DataTableLabels> = {
  search: "Поиск",
  selectAll: "Выбрать все",
  selectRow: "Выбрать строку",
  selected: (n) => `${n} выбрано`,
  shown: "Показано",
  of: "из",
  total: "Всего",
  rowsPerPage: "Строк:",
  previousPage: "Назад",
  nextPage: "Вперёд",
  page: (n) => `Страница ${n}`,
  pagination: "Страницы",
  loading: "Загрузка…",
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
  caption?: React.ReactNode;
  toolbar?: React.ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  getSearchText?: (row: T) => string;
  onSearch?: (query: string) => void;

  /* Selection */
  selectable?: boolean;
  selectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;
  selectionActions?: React.ReactNode;

  /* Sorting (client-side) */
  defaultSort?: { key: string; dir: SortDir };

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
  rowHeight?: number;
  stopPropagationColumnKeys?: string[];
  footer?: React.ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
  labels?: DataTableLabels;
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let p = start; p <= end; p++) pages.push(p);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

function compare(
  a: string | number | null | undefined,
  b: string | number | null | undefined,
): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
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

export function DataTable<T>({
  data,
  columns,
  rowKey,
  title,
  caption,
  toolbar,
  searchable = false,
  searchPlaceholder = "Поиск…",
  getSearchText,
  onSearch,
  selectable = false,
  selectedKeys,
  onSelectionChange,
  selectionActions,
  defaultSort,
  pagination,
  autoPagination,
  loading = false,
  skeletonRows = 5,
  emptyState,
  emptyTitle = "Нет данных",
  emptyDescription,
  bordered = true,
  rowHeight,
  stopPropagationColumnKeys = [],
  footer,
  onRowClick,
  className,
  labels,
}: DataTableProps<T>) {
  const t = { ...DEFAULT_LABELS, ...labels };
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<{ key: string; dir: SortDir } | undefined>(
    defaultSort,
  );
  const [internalSel, setInternalSel] = React.useState<Set<string>>(new Set());
  const [autoPage, setAutoPage] = React.useState(1);
  const [autoSize, setAutoSize] = React.useState(autoPagination?.pageSize ?? 20);

  const selection = selectedKeys ?? internalSel;
  const setSelection = (next: Set<string>) => {
    if (!selectedKeys) setInternalSel(next);
    onSelectionChange?.(next);
  };

  const columnByKey = React.useMemo(
    () => Object.fromEntries(columns.map((c) => [c.key, c])),
    [columns],
  );

  // Reset to the first page when the data set or sort/search changes.
  React.useEffect(() => {
    setAutoPage(1);
  }, [data, sort, query]);

  const processed = React.useMemo(() => {
    let out = data;
    if (searchable && !onSearch && getSearchText && query.trim()) {
      const q = query.trim().toLowerCase();
      out = out.filter((r) => getSearchText(r).toLowerCase().includes(q));
    }
    if (sort) {
      const accessor = columnByKey[sort.key]?.sortAccessor;
      if (accessor) {
        out = [...out].sort(
          (a, b) => compare(accessor(a), accessor(b)) * (sort.dir === "asc" ? 1 : -1),
        );
      }
    }
    return out;
  }, [data, searchable, onSearch, getSearchText, query, sort, columnByKey]);

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
  const toggleRow = (r: T) => {
    const k = rowKey(r);
    const next = new Set(selection);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    setSelection(next);
  };

  const onHeaderSort = (col: DataTableColumn<T>) => {
    if (!col.sortable) return;
    setSort((prev) =>
      prev?.key === col.key
        ? { key: col.key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key: col.key, dir: "asc" },
    );
  };

  const selectedCount = selection.size;
  const showToolbar = title || caption || searchable || toolbar;

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

  return (
    <Wrapper className={className} aria-busy={loading || undefined}>
      {showToolbar ? (
        <div className="flex flex-wrap items-center gap-2 border-b-[1.5px] border-hairline px-4 py-3">
          {(title || caption) && (
            <h3 className="text-[15px] font-bold text-ink-1">
              {title}
              {caption ? (
                <span className="ml-2 text-[13px] font-medium text-ink-3">{caption}</span>
              ) : null}
            </h3>
          )}
          <div className="flex-1" />
          {searchable ? (
            <div className="flex w-full items-center gap-1.5 !rounded-md border border-hairline bg-ui-bg px-2.5 py-1.5 transition-colors focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/30 sm:w-[260px]">
              <Search className="size-[15px] shrink-0 text-ink-3" aria-hidden />
              <input
                type="search"
                aria-label={t.search}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  onSearch?.(e.target.value);
                }}
                placeholder={searchPlaceholder}
                className="w-full min-w-0 border-0 bg-transparent [&::-webkit-search-cancel-button]:appearance-none text-[13.5px] font-medium text-ink-1 outline-none placeholder:text-ink-3"
              />
            </div>
          ) : null}
          {toolbar}
        </div>
      ) : null}

      {/* Always mounted, so screen readers announce selection changes. */}
      {selectable ? (
        <span role="status" className="sr-only">
          {selectedCount > 0 ? t.selected(selectedCount) : null}
        </span>
      ) : null}
      {selectable && selectedCount > 0 ? (
        <div className="flex flex-wrap items-center gap-2.5 bg-brand-deep px-4 py-2.5 text-white">
          <b className="text-[13px] font-bold">{t.selected(selectedCount)}</b>
          {selectionActions}
        </div>
      ) : null}

      {loading ? (
        <div className="px-4 py-2" role="status">
          <span className="sr-only">{t.loading}</span>
          {Array.from({ length: skeletonRows }).map((_, i) => (
            <div
              key={i}
              aria-hidden
              className="flex items-center gap-2 border-b border-hairline py-2.5 last:border-b-0"
            >
              {selectable ? (
                <div className="size-[18px] shrink-0 rounded bg-ui-surface-2 motion-safe:animate-pulse" />
              ) : null}
              <div className="h-3 flex-1 rounded bg-ui-surface-2 motion-safe:animate-pulse" />
              <div className="h-3 w-24 rounded bg-ui-surface-2 motion-safe:animate-pulse" />
              <div className="h-3 w-16 rounded bg-ui-surface-2 motion-safe:animate-pulse" />
            </div>
          ))}
        </div>
      ) : processed.length === 0 ? (
        emptyState ?? <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {selectable ? (
                <TableHead className="w-11 pr-0">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={!allSelected && someSelected}
                    onCheckedChange={toggleAll}
                    aria-label={t.selectAll}
                  />
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
                    aria-sort={
                      col.sortable
                        ? dir === "asc"
                          ? "ascending"
                          : dir === "desc"
                            ? "descending"
                            : "none"
                        : undefined
                    }
                    style={col.width ? { width: col.width } : undefined}
                    className={col.headClassName}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => onHeaderSort(col)}
                        className={cn(
                          "-mx-1 inline-flex items-center gap-1.5 !rounded-sm px-1 uppercase tracking-[inherit] outline-none transition-colors cursor-pointer hover:text-ink-1 focus-visible:ring-2 focus-visible:ring-brand/40",
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
            {rows.map((row) => {
              const k = rowKey(row);
              const isSel = selection.has(k);
              return (
                <TableRow
                  key={k}
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
                    <TableCell className="w-11 pr-0" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSel}
                        onCheckedChange={() => toggleRow(row)}
                        aria-label={t.selectRow}
                      />
                    </TableCell>
                  ) : null}
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      align={col.align}
                      className={col.className}
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
              );
            })}
          </TableBody>
        </Table>
      )}

      {footerPager && !loading && processed.length > 0 ? (
        <div className="flex items-center gap-2.5 border-t-[1.5px] border-hairline px-4 py-2.5">
          <span className="text-[13px] font-medium text-ink-3">
            {footerPager.rangeStart != null && footerPager.rangeEnd != null ? (
              <>
                {t.shown}{" "}
                <b className="font-bold text-ink-1">
                  {footerPager.rangeStart}–{footerPager.rangeEnd}
                </b>
                {footerPager.total != null ? (
                  <>
                    {" "}
                    {t.of} <b className="font-bold text-ink-1">{footerPager.total}</b>
                  </>
                ) : null}
              </>
            ) : footerPager.total != null ? (
              <>
                {t.total} <b className="font-bold text-ink-1">{footerPager.total}</b>
              </>
            ) : null}
          </span>

          {footerPager.onPageSizeChange && footerPager.pageSizeOptions ? (
            <label className="flex items-center gap-2 text-[13px] text-ink-3">
              {t.rowsPerPage}
              <select
                value={footerPager.pageSize}
                onChange={(e) => footerPager.onPageSizeChange?.(Number(e.target.value))}
                className="!rounded-md border border-hairline bg-ui-surface px-2 py-1 text-[13px] font-semibold text-ink-1 outline-none cursor-pointer focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30"
              >
                {footerPager.pageSizeOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {footerPager.pageCount > 1 ? (
            <nav aria-label={t.pagination} className="ml-auto flex items-center gap-1">
              <PagerButton
                disabled={footerPager.page <= 1}
                onClick={() => footerPager.onPageChange(footerPager.page - 1)}
                aria-label={t.previousPage}
              >
                <ChevronLeft className="size-[15px]" aria-hidden />
              </PagerButton>
              {getPageNumbers(footerPager.page, footerPager.pageCount).map((p, i) =>
                p === "..." ? (
                  <span key={`e${i}`} aria-hidden className="px-1.5 text-ink-3">
                    …
                  </span>
                ) : (
                  <PagerButton
                    key={p}
                    active={p === footerPager.page}
                    aria-current={p === footerPager.page ? "page" : undefined}
                    aria-label={t.page(p)}
                    onClick={() => footerPager.onPageChange(p)}
                  >
                    {p}
                  </PagerButton>
                ),
              )}
              <PagerButton
                disabled={footerPager.page >= footerPager.pageCount}
                onClick={() => footerPager.onPageChange(footerPager.page + 1)}
                aria-label={t.nextPage}
              >
                <ChevronRight className="size-[15px]" aria-hidden />
              </PagerButton>
            </nav>
          ) : null}
        </div>
      ) : null}

      {footer}
    </Wrapper>
  );
}

function PlainWrapper({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={className} {...props} />;
}

function PagerButton({
  className,
  active,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 min-w-8 items-center justify-center !rounded-md border px-1.5 text-[13px] font-bold tabular-nums outline-none transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-brand/50 disabled:cursor-default disabled:opacity-40",
        active
          ? "border-transparent bg-brand-solid text-on-brand"
          : "border-hairline bg-ui-surface text-ink-2 hover:bg-ui-bg hover:text-ink-1",
        className,
      )}
      {...props}
    />
  );
}
