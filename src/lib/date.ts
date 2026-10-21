/**
 * Small, dependency-free date helpers used by Calendar, DatePicker and
 * DateRangePicker. Everything works on local time at day precision: helpers
 * that return a "day" return it at 00:00 local time, and comparisons ignore
 * the time of day. Weeks start on Monday (as in Tajikistan and Russia).
 */

/** A (possibly half-open) span of days. `to` is inclusive. */
export type DateRange = { from?: Date; to?: Date };

/** True for a Date whose time value is a real number. */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

/** The same calendar day at 00:00 local time. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Add (or subtract) whole days; keeps the time of day, DST-safe. */
export function addDays(date: Date, amount: number): Date {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + amount);
  return d;
}

/** Number of days in `month` (0–11) of `year`. */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Add (or subtract) whole months. The day is clamped to the target month's
 * length, so 31 January + 1 month is 28/29 February, not 3 March.
 */
export function addMonths(date: Date, amount: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + amount, 1);
  const day = Math.min(
    date.getDate(),
    daysInMonth(target.getFullYear(), target.getMonth()),
  );
  const d = new Date(date.getTime());
  d.setFullYear(target.getFullYear(), target.getMonth(), day);
  return d;
}

/** Add (or subtract) whole years (29 February clamps to 28 February). */
export function addYears(date: Date, amount: number): Date {
  return addMonths(date, amount * 12);
}

/** First day of the date's month, 00:00. */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** Last day of the date's month, 00:00 (day precision). */
export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/** First day of the date's quarter (1 Jan, 1 Apr, 1 Jul, 1 Oct), 00:00. */
export function startOfQuarter(date: Date): Date {
  return new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3, 1);
}

/** 1 January of the date's year, 00:00. */
export function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1);
}

/** Monday of the date's week, 00:00. */
export function startOfWeek(date: Date): Date {
  const offset = (date.getDay() + 6) % 7; // Monday → 0 … Sunday → 6
  return addDays(startOfDay(date), -offset);
}

/** Sunday of the date's week, 00:00. */
export function endOfWeek(date: Date): Date {
  return addDays(startOfWeek(date), 6);
}

/** Day-of-week index with Monday = 0 … Sunday = 6. */
export function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/** Same calendar day (time ignored). */
export function isSameDay(a: Date | undefined, b: Date | undefined): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Same calendar month of the same year. */
export function isSameMonth(a: Date | undefined, b: Date | undefined): boolean {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** `a` is an earlier calendar day than `b` (time ignored). */
export function isBefore(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

/** `a` is a later calendar day than `b` (time ignored). */
export function isAfter(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() > startOfDay(b).getTime();
}

/**
 * Put `from` before `to` and fill a missing end: `{ from }` becomes a
 * one-day range. A range without `from` but with `to` uses `to` as both.
 */
export function normalizeRange(range: DateRange): DateRange {
  const from = range.from ?? range.to;
  const to = range.to ?? range.from;
  if (!from || !to) return {};
  return isAfter(from, to) ? { from: to, to: from } : { from, to };
}

/**
 * Day-precision, inclusive range check. A range with only one end set
 * matches that single day; an empty range matches nothing. Reversed ranges
 * are accepted.
 */
export function isWithin(date: Date, range: DateRange): boolean {
  const { from, to } = normalizeRange(range);
  if (!from || !to) return false;
  return !isBefore(date, from) && !isAfter(date, to);
}

/** Clamp a day to the optional [min, max] bounds (day precision). */
export function clampDate(date: Date, min?: Date, max?: Date): Date {
  if (min && isBefore(date, min)) return startOfDay(min);
  if (max && isAfter(date, max)) return startOfDay(max);
  return date;
}

/**
 * The days shown for a month: 6 weeks × 7 days, Monday first, including the
 * trailing days of the previous month and the leading days of the next one.
 * `month` is 0–11.
 */
export function getMonthGrid(year: number, month: number): Date[][] {
  const first = startOfWeek(new Date(year, month, 1));
  const weeks: Date[][] = [];
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) week.push(addDays(first, w * 7 + d));
    weeks.push(week);
  }
  return weeks;
}

const pad = (n: number, width = 2) => String(n).padStart(width, "0");

/** `YYYY-MM-DD` in local time (not UTC — no off-by-one near midnight). */
export function toISODate(date: Date): string {
  return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** `dd.mm.yyyy`, the way dates are typed and printed across Tijorat+. */
export function formatDateInput(date: Date): string {
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${pad(date.getFullYear(), 4)}`;
}

function build(year: number, month: number, day: number): Date | null {
  if (month < 1 || month > 12 || day < 1) return null;
  if (day > daysInMonth(year, month - 1)) return null;
  const d = new Date(year, month - 1, day);
  // Years 0–99 are mapped to 1900–1999 by the Date constructor.
  d.setFullYear(year);
  return d;
}

/**
 * Parse a date typed by a person. Accepts `21.10.2026`, `21/10/2026`,
 * `21-10-2026`, `21,10,2026` (numeric keypads), `21.10.26` (→ 2026),
 * `21102026` and ISO `2026-10-21`. Returns `null` for anything else,
 * including impossible days such as `31.02.2026`.
 */
export function parseDateInput(input: string): Date | null {
  const text = input.trim();
  if (!text) return null;

  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text);
  if (iso) return build(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  const dmy = /^(\d{1,2})[./\-,\s](\d{1,2})[./\-,\s](\d{2}|\d{4})$/.exec(text);
  if (dmy) {
    const y = dmy[3].length === 2 ? 2000 + Number(dmy[3]) : Number(dmy[3]);
    return build(y, Number(dmy[2]), Number(dmy[1]));
  }

  const compact = /^(\d{2})(\d{2})(\d{4})$/.exec(text);
  if (compact) {
    return build(Number(compact[3]), Number(compact[2]), Number(compact[1]));
  }

  return null;
}
