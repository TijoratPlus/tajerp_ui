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
  if (!dir) return <ChevronsUpDown className="size-3 opacity-50" />;
  return (
    <ChevronUp
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
}: DataTableProps<T>) {
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
    <Wrapper className={className}>
      {showToolbar ? (
        <div className="flex items-center gap-3 border-b-[1.5px] border-hairline px-5 py-4">
          {(title || caption) && (
            <h3 className="text-[17px] font-bold text-ink-1">
              {title}
              {caption ? (
                <span className="ml-2 text-[13px] font-medium text-ink-3">{caption}</span>
              ) : null}
            </h3>
          )}
          <div className="flex-1" />
          {searchable ? (
            <div className="flex w-[260px] items-center gap-2 rounded-md border border-hairline bg-ui-bg px-3 py-2">
              <Search className="size-[15px] text-ink-3" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  onSearch?.(e.target.value);
                }}
                placeholder={searchPlaceholder}
                className="w-full border-0 bg-transparent text-[13.5px] font-medium text-ink-1 outline-none placeholder:text-ink-3"
              />
            </div>
          ) : null}
          {toolbar}
        </div>
      ) : null}

      {selectable && selectedCount > 0 ? (
        <div className="flex items-center gap-3.5 bg-brand-deep px-5 py-3 text-white">
          <b className="text-[13px] font-bold">{selectedCount} выбрано</b>
          {selectionActions}
        </div>
      ) : null}

      {loading ? (
        <div className="px-5 py-2">
          {Array.from({ length: skeletonRows }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b border-hairline py-3.5 last:border-b-0"
            >
              {selectable ? (
                <div className="size-[18px] shrink-0 rounded bg-ui-surface-2" />
              ) : null}
              <div className="h-3 flex-1 animate-pulse rounded bg-ui-surface-2" />
              <div className="h-3 w-24 animate-pulse rounded bg-ui-surface-2" />
              <div className="h-3 w-16 animate-pulse rounded bg-ui-surface-2" />
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
                    aria-label="Выбрать все"
                  />
                </TableHead>
              ) : null}
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  align={col.align}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => onHeaderSort(col)}
                  className={cn(
                    col.sortable && "cursor-pointer hover:text-ink-1",
                    col.headClassName,
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5",
                      col.align === "right" && "flex-row-reverse",
                    )}
                  >
                    {col.header}
                    {col.sortable ? (
                      <SortIcon dir={sort?.key === col.key ? sort.dir : undefined} />
                    ) : null}
                  </span>
                </TableHead>
              ))}
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
                  className={onRowClick ? "cursor-pointer" : undefined}
                  style={rowHeight != null ? { height: rowHeight } : undefined}
                >
                  {selectable ? (
                    <TableCell className="w-11 pr-0" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSel}
                        onCheckedChange={() => toggleRow(row)}
                        aria-label="Выбрать строку"
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
        <div className="flex items-center gap-3.5 border-t-[1.5px] border-hairline px-5 py-3.5">
          <span className="text-[13px] font-medium text-ink-3">
            {footerPager.rangeStart != null && footerPager.rangeEnd != null ? (
              <>
                Показано{" "}
                <b className="font-bold text-ink-1">
                  {footerPager.rangeStart}–{footerPager.rangeEnd}
                </b>
                {footerPager.total != null ? (
                  <>
                    {" "}
                    из <b className="font-bold text-ink-1">{footerPager.total}</b>
                  </>
                ) : null}
              </>
            ) : footerPager.total != null ? (
              <>
                Всего <b className="font-bold text-ink-1">{footerPager.total}</b>
              </>
            ) : null}
          </span>

          {footerPager.onPageSizeChange && footerPager.pageSizeOptions ? (
            <div className="flex items-center gap-2 text-[13px] text-ink-3">
              Строк:
              <select
                value={footerPager.pageSize}
                onChange={(e) => footerPager.onPageSizeChange?.(Number(e.target.value))}
                className="rounded-md border border-hairline bg-ui-surface px-2.5 py-1.5 text-[13px] font-semibold text-ink-1 outline-none"
              >
                {footerPager.pageSizeOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {footerPager.pageCount > 1 ? (
            <div className="ml-auto flex items-center gap-1">
              <PagerButton
                disabled={footerPager.page <= 1}
                onClick={() => footerPager.onPageChange(footerPager.page - 1)}
                aria-label="Назад"
              >
                <ChevronLeft className="size-[15px]" />
              </PagerButton>
              {getPageNumbers(footerPager.page, footerPager.pageCount).map((p, i) =>
                p === "..." ? (
                  <span key={`e${i}`} className="px-1.5 text-ink-3">
                    …
                  </span>
                ) : (
                  <PagerButton
                    key={p}
                    active={p === footerPager.page}
                    onClick={() => footerPager.onPageChange(p)}
                  >
                    {p}
                  </PagerButton>
                ),
              )}
              <PagerButton
                disabled={footerPager.page >= footerPager.pageCount}
                onClick={() => footerPager.onPageChange(footerPager.page + 1)}
                aria-label="Вперёд"
              >
                <ChevronRight className="size-[15px]" />
              </PagerButton>
            </div>
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
        "inline-flex h-[34px] min-w-[34px] items-center justify-center rounded-md border px-2 text-[13px] font-bold transition-colors disabled:cursor-default disabled:opacity-40",
        active
          ? "border-transparent bg-brand text-on-brand"
          : "border-hairline bg-ui-surface text-ink-2 hover:bg-ui-bg hover:text-ink-1",
        className,
      )}
      {...props}
    />
  );
}
