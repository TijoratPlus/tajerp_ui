import { X } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";
import { focusRing } from "../lib/control";
import { defineMessages } from "../i18n/messages";
import { useFormat, useMessages } from "./TajUIProvider";

export const filterBarMessages = defineMessages("filterBar", {
  ru: {
    filters: "Фильтры",
    activeFilters: "Активные фильтры",
    clearAll: "Сбросить все",
    found: (count: string) => `Найдено: ${count}`,
    removeFilter: (label: string) => `Убрать фильтр: ${label}`,
  },
  tg: {
    filters: "Филтрҳо",
    activeFilters: "Филтрҳои фаъол",
    clearAll: "Ҳамаро бекор кардан",
    found: (count: string) => `Ёфт шуд: ${count}`,
    removeFilter: (label: string) => `Хориҷ кардани филтр: ${label}`,
  },
  en: {
    filters: "Filters",
    activeFilters: "Active filters",
    clearAll: "Clear all",
    found: (count: string) => `Found: ${count}`,
    removeFilter: (label: string) => `Remove filter: ${label}`,
  },
});

export type FilterBarLabels = (typeof filterBarMessages.locales)["ru"];

export interface FilterChip {
  id: string;
  /** Filter name, e.g. "Склад". Also used in the remove button's label. */
  label: string;
  /** Selected value, e.g. "Душанбе, Рудакӣ 12". */
  value: React.ReactNode;
  /** Omit to render the chip without a remove button. */
  onRemove?: () => void;
}

export interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Filter controls: DateRangePicker, Select, SearchField, … */
  children?: React.ReactNode;
  /** Trailing actions on the controls row, e.g. `<ExportMenu />`. */
  actions?: React.ReactNode;
  /** Active filters shown as removable chips. */
  chips?: FilterChip[];
  /** Shows "Сбросить все" next to the chips. */
  onClearAll?: () => void;
  /**
   * Result count. A number is formatted and shown as "Найдено: 128"; a node
   * is rendered as is. Announced politely to screen readers.
   */
  resultCount?: number | React.ReactNode;
  labels?: Partial<FilterBarLabels>;
}

/**
 * Filter row for reports and lists: controls that wrap on narrow screens,
 * the active filters as removable chips, "clear all" and the result count.
 */
export const FilterBar = React.forwardRef<HTMLDivElement, FilterBarProps>(
  (
    {
      children,
      actions,
      chips,
      onClearAll,
      resultCount,
      labels: labelsProp,
      className,
      ...props
    },
    ref,
  ) => {
    const t = useMessages(filterBarMessages, labelsProp);
    const fmt = useFormat();
    const hasChips = !!chips && chips.length > 0;
    const showSummary = hasChips || resultCount != null;

    return (
      <div
        ref={ref}
        role="group"
        aria-label={t.filters}
        data-slot="filter-bar"
        className={cn("flex flex-col gap-2", className)}
        {...props}
      >
        {children != null || actions != null ? (
          <div
            data-slot="filter-bar-controls"
            className="flex flex-wrap items-end gap-2"
          >
            {children}
            {actions != null ? (
              <div
                data-slot="filter-bar-actions"
                className="ml-auto flex shrink-0 items-center gap-2"
              >
                {actions}
              </div>
            ) : null}
          </div>
        ) : null}

        {showSummary ? (
          <div
            data-slot="filter-bar-summary"
            className="flex flex-wrap items-center gap-x-3 gap-y-2"
          >
            {hasChips ? (
              <ul
                aria-label={t.activeFilters}
                data-slot="filter-bar-chips"
                className="flex flex-wrap items-center gap-1.5"
              >
                {chips!.map((chip) => (
                  <li
                    key={chip.id}
                    data-slot="filter-chip"
                    className={cn(
                      "inline-flex max-w-full items-center gap-1 !rounded-pill border border-hairline bg-ui-surface-2 py-0.5 text-ui-label text-ink-2",
                      chip.onRemove ? "pr-0.5 pl-2.5" : "px-2.5",
                    )}
                  >
                    <span className="min-w-0 truncate">
                      {chip.label}:{" "}
                      <b className="font-bold text-ink-1">{chip.value}</b>
                    </span>
                    {chip.onRemove ? (
                      <button
                        type="button"
                        onClick={chip.onRemove}
                        aria-label={t.removeFilter(chip.label)}
                        data-slot="filter-chip-remove"
                        className={cn(
                          "inline-flex size-6 shrink-0 cursor-pointer items-center justify-center !rounded-full text-ink-3 transition-colors hover:bg-mist hover:text-brand-ink [[data-density=touch]_&]:size-11",
                          focusRing,
                        )}
                      >
                        <X className="size-3.5" aria-hidden />
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
            {hasChips && onClearAll ? (
              <button
                type="button"
                onClick={onClearAll}
                data-slot="filter-bar-clear"
                className={cn(
                  "inline-flex min-h-6 cursor-pointer items-center !rounded-md px-1.5 text-ui-label font-bold text-brand-ink underline-offset-4 hover:underline [[data-density=touch]_&]:min-h-11",
                  focusRing,
                )}
              >
                {t.clearAll}
              </button>
            ) : null}
            {resultCount != null ? (
              <span
                role="status"
                data-slot="filter-bar-count"
                className="ml-auto text-ui-label text-ink-3 tabular-nums"
              >
                {typeof resultCount === "number"
                  ? t.found(fmt.number(resultCount))
                  : resultCount}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  },
);
FilterBar.displayName = "FilterBar";
