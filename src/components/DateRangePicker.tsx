import { CalendarRange, ChevronDown } from "lucide-react";
import * as React from "react";

import { defineMessages } from "../i18n/messages";
import {
  controlFocus,
  controlFrame,
  controlSize,
  type ControlSize,
} from "../lib/control";
import { cn } from "../lib/cn";
import {
  addDays,
  addMonths,
  endOfMonth,
  formatDateInput,
  isSameDay,
  normalizeRange,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  type DateRange,
} from "../lib/date";
import { Button } from "./Button";
import { Calendar, type CalendarLabels } from "./Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { useCommonMessages, useMessages } from "./TajUIProvider";

export const dateRangePickerMessages = defineMessages("dateRangePicker", {
  ru: {
    placeholder: "Выберите период",
    dialogLabel: "Выбор периода",
    presets: "Быстрый выбор",
    today: "Сегодня",
    yesterday: "Вчера",
    last7Days: "Последние 7 дней",
    last30Days: "Последние 30 дней",
    thisMonth: "Этот месяц",
    lastMonth: "Прошлый месяц",
    thisQuarter: "Этот квартал",
    thisYear: "Этот год",
  },
  tg: {
    placeholder: "Давраро интихоб кунед",
    dialogLabel: "Интихоби давра",
    presets: "Интихоби зуд",
    today: "Имрӯз",
    yesterday: "Дирӯз",
    last7Days: "7 рӯзи охир",
    last30Days: "30 рӯзи охир",
    thisMonth: "Ҳамин моҳ",
    lastMonth: "Моҳи гузашта",
    thisQuarter: "Ҳамин семоҳа",
    thisYear: "Ҳамин сол",
  },
  en: {
    placeholder: "Select period",
    dialogLabel: "Choose period",
    presets: "Quick ranges",
    today: "Today",
    yesterday: "Yesterday",
    last7Days: "Last 7 days",
    last30Days: "Last 30 days",
    thisMonth: "This month",
    lastMonth: "Last month",
    thisQuarter: "This quarter",
    thisYear: "This year",
  },
});

export type DateRangePickerLabels = (typeof dateRangePickerMessages.locales)["ru"];

/** A quick-pick period. `range` receives today (00:00) and returns the period. */
export interface DateRangePreset {
  id: string;
  label: string;
  range: (today: Date) => DateRange;
}

/**
 * The built-in report periods (today, yesterday, last 7/30 days, this/last
 * month, this quarter, this year), labelled in the active locale. "This
 * month/quarter/year" run to today. Use it to extend the defaults:
 * `presets={[...useDateRangePresets(), myPreset]}`.
 */
export function useDateRangePresets(
  labels?: Partial<DateRangePickerLabels>,
): DateRangePreset[] {
  const t = useMessages(dateRangePickerMessages, labels);
  return React.useMemo(
    () => [
      { id: "today", label: t.today, range: (d) => ({ from: d, to: d }) },
      {
        id: "yesterday",
        label: t.yesterday,
        range: (d) => ({ from: addDays(d, -1), to: addDays(d, -1) }),
      },
      { id: "last7Days", label: t.last7Days, range: (d) => ({ from: addDays(d, -6), to: d }) },
      { id: "last30Days", label: t.last30Days, range: (d) => ({ from: addDays(d, -29), to: d }) },
      { id: "thisMonth", label: t.thisMonth, range: (d) => ({ from: startOfMonth(d), to: d }) },
      {
        id: "lastMonth",
        label: t.lastMonth,
        range: (d) => {
          const prev = addMonths(startOfMonth(d), -1);
          return { from: prev, to: endOfMonth(prev) };
        },
      },
      { id: "thisQuarter", label: t.thisQuarter, range: (d) => ({ from: startOfQuarter(d), to: d }) },
      { id: "thisYear", label: t.thisYear, range: (d) => ({ from: startOfYear(d), to: d }) },
    ],
    [t],
  );
}

function useMinWidth(px: number): boolean {
  const query = `(min-width: ${px}px)`;
  const get = () =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia(query).matches
      : false;
  const [matches, setMatches] = React.useState(get);
  React.useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, [query]);
  return matches;
}

const sameRange = (a: DateRange, b: DateRange) =>
  isSameDay(a.from, b.from) && isSameDay(a.to, b.to);

/** "01.10.2026 – 21.10.2026", or a single date for a one-day range. */
export function formatDateRange(range: DateRange | undefined): string {
  if (!range?.from && !range?.to) return "";
  const { from, to } = range;
  if (from && to && isSameDay(from, to)) return formatDateInput(from);
  return `${from ? formatDateInput(from) : "…"} – ${to ? formatDateInput(to) : "…"}`;
}

export type DateRangePickerProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "value" | "defaultValue" | "onChange"
> & {
  value?: DateRange;
  defaultValue?: DateRange;
  /** Fires on Apply with the normalised range (`from` ≤ `to`). */
  onValueChange?: (range: DateRange) => void;
  /** Quick-pick list. Defaults to `useDateRangePresets()`; `[]` hides it. */
  presets?: DateRangePreset[];
  min?: Date;
  max?: Date;
  /** Mark individual days as unavailable. */
  isDateDisabled?: (date: Date) => boolean;
  placeholder?: string;
  size?: ControlSize;
  /** Months shown. Defaults to 2 from the `sm` breakpoint (640px), 1 below. */
  numberOfMonths?: 1 | 2;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Override "today" (tests, presets relative to a business day). */
  today?: Date;
  labels?: Partial<DateRangePickerLabels>;
  calendarLabels?: Partial<CalendarLabels>;
};

/**
 * Period filter for reports: a trigger showing the range, and a popover with
 * quick presets, a two-month range calendar and Apply/Cancel.
 */
export const DateRangePicker = React.forwardRef<HTMLButtonElement, DateRangePickerProps>(
  (props, ref) => {
    const isControlled = "value" in props;
    const {
      value,
      defaultValue,
      onValueChange,
      presets: presetsProp,
      min,
      max,
      isDateDisabled,
      placeholder,
      size = "md",
      numberOfMonths: monthsProp,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      today: todayProp,
      labels,
      calendarLabels,
      className,
      disabled,
      ...buttonProps
    } = props;
    const t = useMessages(dateRangePickerMessages, labels);
    const common = useCommonMessages();
    const defaultPresets = useDateRangePresets(labels);
    const presets = presetsProp ?? defaultPresets;
    const wide = useMinWidth(640);
    const numberOfMonths = monthsProp ?? (wide ? 2 : 1);

    const [todayState] = React.useState(() => startOfDay(new Date()));
    const today = todayProp ? startOfDay(todayProp) : todayState;

    const [internal, setInternal] = React.useState<DateRange>(defaultValue ?? {});
    const current: DateRange = (isControlled ? value : internal) ?? {};

    const [openState, setOpenState] = React.useState(defaultOpen);
    const open = openProp ?? openState;

    const [draft, setDraft] = React.useState<DateRange>(current);
    const [month, setMonth] = React.useState<Date>(() =>
      addMonths(startOfMonth(current.to ?? current.from ?? today), -(numberOfMonths - 1)),
    );

    // Show the range's end month last (today's month for "last 30 days").
    const monthFor = (r: DateRange) =>
      addMonths(startOfMonth(r.to ?? r.from ?? today), -(numberOfMonths - 1));

    const setOpen = (next: boolean) => {
      if (next) {
        setDraft(current);
        setMonth(monthFor(current));
      }
      if (openProp === undefined) setOpenState(next);
      onOpenChange?.(next);
    };

    const apply = () => {
      const next = normalizeRange(draft);
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
      setOpen(false);
    };

    const pickPreset = (preset: DateRangePreset) => {
      const r = normalizeRange(preset.range(today));
      setDraft(r);
      if (r.from) setMonth(monthFor(r));
    };

    const draftLabel = formatDateRange(draft);
    const triggerLabel = formatDateRange(current);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            data-slot="date-range-picker"
            disabled={disabled}
            className={cn(
              "inline-flex w-full min-w-0 items-center gap-2 px-3 text-left cursor-pointer",
              controlFrame,
              controlSize[size],
              controlFocus,
              "disabled:cursor-not-allowed disabled:opacity-60",
              className,
            )}
            {...buttonProps}
          >
            <CalendarRange className="size-4 shrink-0 text-ink-3" aria-hidden />
            <span
              data-slot="date-range-picker-value"
              className={cn(
                "min-w-0 flex-1 truncate tabular-nums",
                triggerLabel ? "font-medium text-ink-1" : "text-ink-3",
              )}
            >
              {triggerLabel || placeholder || t.placeholder}
            </span>
            <ChevronDown className="size-4 shrink-0 text-ink-3" aria-hidden />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          aria-label={t.dialogLabel}
          data-slot="date-range-picker-content"
          collisionPadding={8}
          className="w-auto max-w-[calc(100vw-16px)] p-0"
        >
          <div className="flex flex-col sm:flex-row">
            {presets.length > 0 ? (
              <div
                role="group"
                aria-label={t.presets}
                data-slot="date-range-picker-presets"
                className="flex flex-wrap gap-1 border-b border-hairline p-2 sm:w-44 sm:flex-col sm:flex-nowrap sm:border-r sm:border-b-0"
              >
                {presets.map((p) => {
                  const r = normalizeRange(p.range(today));
                  const active = !!draft.from && sameRange(r, normalizeRange(draft));
                  return (
                    <Button
                      key={p.id}
                      variant="ghost"
                      size="sm"
                      aria-pressed={active}
                      data-preset={p.id}
                      onClick={() => pickPreset(p)}
                      className={cn(
                        "justify-start font-semibold",
                        active && "bg-mist text-mist-ink",
                      )}
                    >
                      {p.label}
                    </Button>
                  );
                })}
              </div>
            ) : null}
            <div className="flex flex-col">
              <div className="p-3">
                <Calendar
                  mode="range"
                  selected={draft}
                  onSelect={setDraft}
                  month={month}
                  onMonthChange={setMonth}
                  numberOfMonths={numberOfMonths}
                  min={min}
                  max={max}
                  disabled={isDateDisabled}
                  today={today}
                  labels={calendarLabels}
                />
              </div>
              <div
                data-slot="date-range-picker-footer"
                className="flex flex-wrap items-center gap-2 border-t border-hairline p-3"
              >
                <span
                  aria-live="polite"
                  className="mr-auto text-ui-label font-medium tabular-nums text-ink-2"
                >
                  {draftLabel}
                </span>
                <Button variant="subtle" size="sm" onClick={() => setOpen(false)}>
                  {common.cancel}
                </Button>
                <Button size="sm" disabled={!draft.from} onClick={apply}>
                  {common.apply}
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);
DateRangePicker.displayName = "DateRangePicker";
