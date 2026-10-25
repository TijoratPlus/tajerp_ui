import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";
import { defineMessages } from "../i18n/messages";
import { useFormat, useMessages } from "./TajUIProvider";

export const paginationMessages = defineMessages("pagination", {
  ru: {
    label: "Страницы",
    previous: "Назад",
    next: "Вперёд",
    page: (n: number) => `Страница ${n}`,
    shown: "Показано",
    of: "из",
    total: "Всего",
    rowsPerPage: "Строк:",
  },
  tg: {
    label: "Саҳифаҳо",
    previous: "Қаблӣ",
    next: "Навбатӣ",
    page: (n: number) => `Саҳифаи ${n}`,
    shown: "Нишон дода шуд",
    of: "аз",
    total: "Ҳамагӣ",
    rowsPerPage: "Сатрҳо:",
  },
  en: {
    label: "Pagination",
    previous: "Previous",
    next: "Next",
    page: (n: number) => `Page ${n}`,
    shown: "Showing",
    of: "of",
    total: "Total",
    rowsPerPage: "Rows:",
  },
});

export type PaginationLabels = Partial<(typeof paginationMessages.locales)["ru"]>;

/** Page numbers with ellipses: 1 … 4 5 6 … 20. */
export function getPageNumbers(current: number, total: number): (number | "...")[] {
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

export interface PaginationProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** 1-based current page. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Total number of rows, for the "Показано 1–20 из 128" summary. */
  total?: number;
  rangeStart?: number;
  rangeEnd?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  /** Hide the numbered buttons (prev/next only) — for narrow screens. */
  simple?: boolean;
  labels?: PaginationLabels;
}

/**
 * Stand-alone pager: range summary, optional page-size select and numbered
 * page buttons. Presentational — the caller owns the page state.
 */
export const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  (
    {
      page,
      pageCount,
      onPageChange,
      total,
      rangeStart,
      rangeEnd,
      pageSize,
      pageSizeOptions,
      onPageSizeChange,
      simple = false,
      labels,
      className,
      ...props
    },
    ref,
  ) => {
    const t = useMessages(paginationMessages, labels);
    const { number } = useFormat();
    return (
      <div
        ref={ref}
        data-slot="pagination"
        className={cn("flex flex-wrap items-center gap-2.5", className)}
        {...props}
      >
        <span className="text-ui-label font-medium text-ink-3">
          {rangeStart != null && rangeEnd != null ? (
            <>
              {t.shown}{" "}
              <b className="font-bold text-ink-1 tabular-nums">
                {number(rangeStart)}–{number(rangeEnd)}
              </b>
              {total != null ? (
                <>
                  {" "}
                  {t.of} <b className="font-bold text-ink-1 tabular-nums">{number(total)}</b>
                </>
              ) : null}
            </>
          ) : total != null ? (
            <>
              {t.total} <b className="font-bold text-ink-1 tabular-nums">{number(total)}</b>
            </>
          ) : null}
        </span>

        {onPageSizeChange && pageSizeOptions ? (
          <label className="flex items-center gap-2 text-ui-label text-ink-3">
            {t.rowsPerPage}
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 !rounded-md border border-hairline bg-ui-surface px-2 text-ui-label font-semibold text-ink-1 outline-none cursor-pointer focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-focus"
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {pageCount > 1 ? (
          <nav aria-label={t.label} className="ml-auto flex items-center gap-1">
            <PagerButton
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              aria-label={t.previous}
            >
              <ChevronLeft className="size-4" aria-hidden />
            </PagerButton>
            {simple ? (
              <span className="px-1.5 text-ui-label font-bold tabular-nums text-ink-2">
                {page} / {pageCount}
              </span>
            ) : (
              getPageNumbers(page, pageCount).map((p, i) =>
                p === "..." ? (
                  <span key={`e${i}`} aria-hidden className="px-1.5 text-ink-3">
                    …
                  </span>
                ) : (
                  <PagerButton
                    key={p}
                    active={p === page}
                    aria-current={p === page ? "page" : undefined}
                    aria-label={t.page(p)}
                    onClick={() => onPageChange(p)}
                  >
                    {p}
                  </PagerButton>
                ),
              )
            )}
            <PagerButton
              disabled={page >= pageCount}
              onClick={() => onPageChange(page + 1)}
              aria-label={t.next}
            >
              <ChevronRight className="size-4" aria-hidden />
            </PagerButton>
          </nav>
        ) : null}
      </div>
    );
  },
);
Pagination.displayName = "Pagination";

function PagerButton({
  className,
  active,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-control-sm min-w-control-sm items-center justify-center !rounded-md border px-1.5 text-ui-label font-bold tabular-nums outline-none transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-default disabled:opacity-40",
        active
          ? "border-transparent bg-brand-solid text-on-brand"
          : "border-hairline bg-ui-surface text-ink-2 hover:bg-ui-bg hover:text-ink-1",
        className,
      )}
      {...props}
    />
  );
}
