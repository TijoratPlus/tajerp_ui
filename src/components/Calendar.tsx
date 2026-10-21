import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import { focusRing } from "../lib/control";
import {
  addDays,
  addMonths,
  addYears,
  clampDate,
  endOfMonth,
  endOfWeek,
  getMonthGrid,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  normalizeRange,
  startOfDay,
  startOfMonth,
  startOfWeek,
  toISODate,
  weekdayIndex,
  type DateRange,
} from "../lib/date";
import { useMessages } from "./TajUIProvider";

const RU_MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];
const RU_MONTHS_OF = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];
const RU_WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const RU_WEEKDAYS_LONG = [
  "понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье",
];

const TG_MONTHS = [
  "Январ", "Феврал", "Март", "Апрел", "Май", "Июн",
  "Июл", "Август", "Сентябр", "Октябр", "Ноябр", "Декабр",
];
const TG_WEEKDAYS = ["Дш", "Сш", "Чш", "Пш", "Ҷм", "Шб", "Яш"];
const TG_WEEKDAYS_LONG = [
  "душанбе", "сешанбе", "чоршанбе", "панҷшанбе", "ҷумъа", "шанбе", "якшанбе",
];

const EN_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const EN_WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const EN_WEEKDAYS_LONG = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const calendarMessages = defineMessages("calendar", {
  ru: {
    /** Month name for the caption, `month` 0–11. */
    monthName: (month: number) => RU_MONTHS[month] ?? "",
    /** Short weekday for the column header, Monday = 0. */
    weekdayShort: (weekday: number) => RU_WEEKDAYS[weekday] ?? "",
    /** Full weekday name (header `abbr`), Monday = 0. */
    weekdayLong: (weekday: number) => cap(RU_WEEKDAYS_LONG[weekday] ?? ""),
    /** Accessible name of a day button. */
    dayLabel: (date: Date) =>
      `${RU_WEEKDAYS_LONG[weekdayIndex(date)]}, ${date.getDate()} ${RU_MONTHS_OF[date.getMonth()]} ${date.getFullYear()} г.`,
    prevMonth: "Предыдущий месяц",
    nextMonth: "Следующий месяц",
  },
  tg: {
    monthName: (month: number) => TG_MONTHS[month] ?? "",
    weekdayShort: (weekday: number) => TG_WEEKDAYS[weekday] ?? "",
    weekdayLong: (weekday: number) => cap(TG_WEEKDAYS_LONG[weekday] ?? ""),
    // Izofa: "21 октябри 2026".
    dayLabel: (date: Date) =>
      `${TG_WEEKDAYS_LONG[weekdayIndex(date)]}, ${date.getDate()} ${(TG_MONTHS[date.getMonth()] ?? "").toLowerCase()}и ${date.getFullYear()}`,
    prevMonth: "Моҳи гузашта",
    nextMonth: "Моҳи оянда",
  },
  en: {
    monthName: (month: number) => EN_MONTHS[month] ?? "",
    weekdayShort: (weekday: number) => EN_WEEKDAYS[weekday] ?? "",
    weekdayLong: (weekday: number) => EN_WEEKDAYS_LONG[weekday] ?? "",
    dayLabel: (date: Date) =>
      `${EN_WEEKDAYS_LONG[weekdayIndex(date)]}, ${EN_MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`,
    prevMonth: "Previous month",
    nextMonth: "Next month",
  },
});

export type CalendarLabels = (typeof calendarMessages.locales)["ru"];

interface CalendarBaseProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect" | "defaultValue"> {
  /** Displayed (first) month, controlled. Any day of the month works. */
  month?: Date;
  /** Initially displayed month. Defaults to the selection, then `today`. */
  defaultMonth?: Date;
  /** Fires with the 1st of the newly displayed first month. */
  onMonthChange?: (month: Date) => void;
  /** Earliest selectable day (inclusive). */
  min?: Date;
  /** Latest selectable day (inclusive). */
  max?: Date;
  /** Mark individual days as unavailable (still focusable, not selectable). */
  disabled?: (date: Date) => boolean;
  /** Months shown side by side. Defaults to 1. */
  numberOfMonths?: 1 | 2;
  /** Show the neighbouring months' days in the first/last week. Defaults to true. */
  showOutsideDays?: boolean;
  /** Override "today" (tests, server-rendered reports in another time zone). */
  today?: Date;
  /** Focus the active day on mount (used by the picker popovers). */
  autoFocus?: boolean;
  labels?: Partial<CalendarLabels>;
}

export interface CalendarSingleProps extends CalendarBaseProps {
  mode?: "single";
  selected?: Date;
  defaultSelected?: Date;
  onSelect?: (date: Date | undefined) => void;
}

export interface CalendarRangeProps extends CalendarBaseProps {
  mode: "range";
  selected?: DateRange;
  defaultSelected?: DateRange;
  onSelect?: (range: DateRange) => void;
}

export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

type Selection = Date | DateRange | undefined;

const isRangeValue = (v: Selection): v is DateRange =>
  !!v && !(v instanceof Date);

/**
 * Month grid date picker (WAI-ARIA date grid). Single-date or range
 * selection, min/max bounds, per-day `disabled`, one or two months.
 * Keyboard: arrows move by day/week, Home/End to week start/end,
 * PageUp/PageDown by month (Shift: by year), Enter/Space select.
 */
export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  (props, ref) => {
    const selectedControlled = "selected" in props;
    const {
      mode = "single",
      selected,
      defaultSelected,
      onSelect,
      month,
      defaultMonth,
      onMonthChange,
      min,
      max,
      disabled,
      numberOfMonths = 1,
      showOutsideDays = true,
      today: todayProp,
      autoFocus = false,
      labels,
      className,
      ...rest
    } = props;
    const isRange = mode === "range";
    const t = useMessages(calendarMessages, labels);
    const captionBaseId = React.useId();

    const [todayState] = React.useState(() => startOfDay(new Date()));
    const today = todayProp ? startOfDay(todayProp) : todayState;

    // ---- selection --------------------------------------------------------
    const [internalSel, setInternalSel] = React.useState<Selection>(
      defaultSelected,
    );
    const sel: Selection = selectedControlled ? selected : internalSel;
    const single = !isRange && sel instanceof Date ? sel : undefined;
    const range: DateRange = isRange && isRangeValue(sel) ? sel : {};

    // ---- displayed month --------------------------------------------------
    const anchor = single ?? range.from ?? range.to;
    const [internalMonth, setInternalMonth] = React.useState(() =>
      startOfMonth(defaultMonth ?? clampDate(anchor ?? today, min, max)),
    );
    const displayMonth = startOfMonth(month ?? internalMonth);
    const lastMonth = addMonths(displayMonth, numberOfMonths - 1);

    const setMonth = (next: Date) => {
      const m = startOfMonth(next);
      if (isSameMonth(m, displayMonth)) return;
      if (month === undefined) setInternalMonth(m);
      onMonthChange?.(m);
    };

    // ---- availability -----------------------------------------------------
    const isUnavailable = (d: Date) =>
      (min !== undefined && isBefore(d, min)) ||
      (max !== undefined && isAfter(d, max)) ||
      !!disabled?.(d);

    const isVisible = (d: Date) =>
      !isBefore(d, displayMonth) && !isAfter(d, endOfMonth(lastMonth));

    // ---- focus (roving tabindex) -----------------------------------------
    const [focused, setFocused] = React.useState<Date>(() =>
      clampDate(anchor ?? today, min, max),
    );
    const tabbable =
      [focused, anchor, today, clampDate(displayMonth, min, max)].find(
        (c): c is Date => !!c && isVisible(c),
      ) ?? displayMonth;

    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const setRootRef = (el: HTMLDivElement | null) => {
      rootRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    };
    const pendingFocus = React.useRef(autoFocus);

    React.useEffect(() => {
      if (!pendingFocus.current) return;
      pendingFocus.current = false;
      rootRef.current
        ?.querySelector<HTMLButtonElement>(
          `button[data-day="${toISODate(tabbable)}"]:not([data-outside])`,
        )
        ?.focus();
    });

    const moveFocus = (next: Date) => {
      const target = clampDate(startOfDay(next), min, max);
      setFocused(target);
      if (isBefore(target, displayMonth)) setMonth(target);
      else if (isAfter(target, endOfMonth(lastMonth)))
        setMonth(addMonths(startOfMonth(target), -(numberOfMonths - 1)));
      pendingFocus.current = true;
    };

    // ---- range hover preview ---------------------------------------------
    const [hovered, setHovered] = React.useState<Date | undefined>();
    const previewing = isRange && !!range.from && !range.to && !!hovered;
    const shown: DateRange = previewing
      ? normalizeRange({ from: range.from, to: hovered })
      : normalizeRange(range);

    // ---- selection ---------------------------------------------------------
    const select = (day: Date) => {
      if (isUnavailable(day)) return;
      setFocused(day);
      if (!isVisible(day)) {
        if (isBefore(day, displayMonth)) setMonth(day);
        else setMonth(addMonths(startOfMonth(day), -(numberOfMonths - 1)));
      }
      const emit = onSelect as ((value: Selection) => void) | undefined;
      if (isRange) {
        const next: DateRange =
          !range.from || range.to
            ? { from: day, to: undefined }
            : isBefore(day, range.from)
              ? { from: day, to: range.from }
              : { from: range.from, to: day };
        if (!selectedControlled) setInternalSel(next);
        setHovered(undefined);
        emit?.(next);
      } else {
        if (!selectedControlled) setInternalSel(day);
        emit?.(day);
      }
    };

    const onDayKeyDown = (e: React.KeyboardEvent, day: Date) => {
      let next: Date | undefined;
      switch (e.key) {
        case "ArrowLeft":
          next = addDays(day, -1);
          break;
        case "ArrowRight":
          next = addDays(day, 1);
          break;
        case "ArrowUp":
          next = addDays(day, -7);
          break;
        case "ArrowDown":
          next = addDays(day, 7);
          break;
        case "Home":
          next = startOfWeek(day);
          break;
        case "End":
          next = endOfWeek(day);
          break;
        case "PageUp":
          next = e.shiftKey ? addYears(day, -1) : addMonths(day, -1);
          break;
        case "PageDown":
          next = e.shiftKey ? addYears(day, 1) : addMonths(day, 1);
          break;
        default:
          return;
      }
      e.preventDefault();
      moveFocus(next);
      if (isRange) setHovered(clampDate(next, min, max));
    };

    const prevDisabled =
      min !== undefined && isBefore(endOfMonth(addMonths(displayMonth, -1)), min);
    const nextDisabled =
      max !== undefined && isAfter(addMonths(displayMonth, numberOfMonths), max);

    const navBtn = cn(
      "inline-flex size-control-sm items-center justify-center !rounded-md text-ink-2 transition-colors cursor-pointer",
      "hover:bg-mist hover:text-brand-ink disabled:pointer-events-none disabled:opacity-40",
      focusRing,
    );

    const months = Array.from({ length: numberOfMonths }, (_, i) =>
      addMonths(displayMonth, i),
    );

    return (
      <div
        ref={setRootRef}
        data-slot="calendar"
        data-mode={mode}
        className={cn("relative inline-block text-ink-1", className)}
        {...rest}
      >
        <div
          data-slot="calendar-nav"
          className="absolute inset-x-0 top-0 flex items-center justify-between"
        >
          <button
            type="button"
            data-slot="calendar-prev"
            aria-label={t.prevMonth}
            disabled={prevDisabled}
            onClick={() => setMonth(addMonths(displayMonth, -1))}
            className={navBtn}
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            data-slot="calendar-next"
            aria-label={t.nextMonth}
            disabled={nextDisabled}
            onClick={() => setMonth(addMonths(displayMonth, 1))}
            className={navBtn}
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          {months.map((m, mi) => {
            const captionId = `${captionBaseId}-m${mi}`;
            const weeks = getMonthGrid(m.getFullYear(), m.getMonth());
            return (
              <div key={toISODate(m)} data-slot="calendar-month">
                <div
                  id={captionId}
                  data-slot="calendar-caption"
                  aria-live="polite"
                  className="flex h-control-sm items-center justify-center px-10 text-ui-title font-bold"
                >
                  {t.monthName(m.getMonth())} {m.getFullYear()}
                </div>
                <table
                  role="grid"
                  aria-labelledby={captionId}
                  aria-multiselectable={isRange || undefined}
                  data-slot="calendar-grid"
                  className="mt-2 border-separate border-spacing-0"
                  onMouseLeave={() => setHovered(undefined)}
                >
                  <thead>
                    <tr>
                      {Array.from({ length: 7 }, (_, wd) => (
                        <th
                          key={wd}
                          scope="col"
                          abbr={t.weekdayLong(wd)}
                          className={cn(
                            "h-8 p-0 text-ui-caption font-semibold",
                            wd >= 5 ? "text-tj-error-ink" : "text-ink-3",
                          )}
                        >
                          {t.weekdayShort(wd)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {weeks.map((week) => (
                      <tr key={toISODate(week[0])}>
                        {week.map((day) => {
                          const outside = !isSameMonth(day, m);
                          const iso = toISODate(day);
                          if (outside && !showOutsideDays) {
                            return <td key={iso} className="p-0" />;
                          }
                          const unavailable = isUnavailable(day);
                          const isToday = isSameDay(day, today);
                          const start = isRange && isSameDay(day, shown.from);
                          const end = isRange && isSameDay(day, shown.to);
                          const middle =
                            isRange &&
                            !!shown.from &&
                            !!shown.to &&
                            isAfter(day, shown.from) &&
                            isBefore(day, shown.to);
                          const oneDay = start && end;
                          const isSelected = isRange
                            ? !previewing && (start || end || middle)
                            : isSameDay(day, single);
                          const isEnd = isRange ? start || end : isSelected;
                          const tabIndex =
                            !outside && isSameDay(day, tabbable) ? 0 : -1;
                          return (
                            <td
                              key={iso}
                              aria-selected={isSelected || undefined}
                              className={cn(
                                "p-0 text-center",
                                (middle || (start && !oneDay) || (end && !oneDay)) &&
                                  (previewing ? "bg-mist/60" : "bg-mist"),
                                start && !oneDay && "!rounded-l-lg",
                                end && !oneDay && "!rounded-r-lg",
                              )}
                            >
                              <button
                                type="button"
                                tabIndex={tabIndex}
                                data-slot="calendar-day"
                                data-day={iso}
                                data-outside={outside || undefined}
                                data-today={isToday || undefined}
                                data-selected={isSelected || undefined}
                                data-range-start={(isRange && start) || undefined}
                                data-range-end={(isRange && end) || undefined}
                                data-range-middle={middle || undefined}
                                aria-label={t.dayLabel(day)}
                                aria-disabled={unavailable || undefined}
                                aria-current={isToday ? "date" : undefined}
                                onClick={() => select(day)}
                                onKeyDown={(e) => onDayKeyDown(e, day)}
                                onFocus={() => {
                                  if (!outside) setFocused(day);
                                }}
                                onMouseEnter={() => {
                                  if (isRange && !unavailable) setHovered(day);
                                }}
                                className={cn(
                                  "relative inline-flex size-control-md items-center justify-center !rounded-lg text-ui-control font-medium tabular-nums transition-colors cursor-pointer",
                                  focusRing,
                                  "hover:bg-mist hover:text-mist-ink",
                                  outside && "font-normal text-ink-3",
                                  middle && "text-mist-ink hover:bg-transparent",
                                  isToday &&
                                    "font-bold after:absolute after:bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:!rounded-full after:bg-current",
                                  isEnd &&
                                    "bg-brand-solid text-on-brand hover:bg-brand-solid-hover hover:text-on-brand",
                                  unavailable &&
                                    "cursor-not-allowed text-ink-4 line-through opacity-60 hover:bg-transparent hover:text-ink-4",
                                )}
                              >
                                {day.getDate()}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);
Calendar.displayName = "Calendar";
