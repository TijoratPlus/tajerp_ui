/**
 * Time-of-day and duration helpers used by TimePicker, DateTimePicker,
 * DurationInput and EventCalendar. Times are local wall-clock values; a
 * "time string" is `HH:mm` or `HH:mm:ss` (the shape Frappe stores).
 */

const pad = (n: number) => String(n).padStart(2, "0");

/** Seconds since midnight → `HH:mm` (or `HH:mm:ss` with `withSeconds`). */
export function formatTimeOfDay(totalSeconds: number, withSeconds = false): string {
  const s = ((Math.round(totalSeconds) % 86400) + 86400) % 86400;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return withSeconds ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(h)}:${pad(m)}`;
}

/** `HH:mm` of a Date in local time. */
export function formatClock(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Parse a time typed by a person into seconds since midnight. Accepts
 * `9`, `09`, `930`, `0930`, `9:30`, `9.30`, `9,30`, `9-30`, `9 30`,
 * `09:30:15` and `093015` (24-hour clock). Returns `null` for anything
 * else (`24:00`, `25:00`, `9:75`, letters).
 */
export function parseTimeInput(input: string): number | null {
  const text = input.trim();
  if (!text) return null;
  let h: number;
  let m = 0;
  let s = 0;
  const sep = /^(\d{1,2})[:.,\-\s](\d{1,2})(?:[:.,\-\s](\d{1,2}))?$/.exec(text);
  if (sep) {
    h = Number(sep[1]);
    m = Number(sep[2]);
    s = sep[3] ? Number(sep[3]) : 0;
    if (sep[2].length === 1 && !sep[3]) m *= 10; // "9:3" → 09:30
  } else if (/^\d{1,4}$/.test(text)) {
    if (text.length <= 2) h = Number(text);
    else {
      h = Number(text.slice(0, text.length - 2));
      m = Number(text.slice(-2));
    }
  } else if (/^\d{6}$/.test(text)) {
    h = Number(text.slice(0, 2));
    m = Number(text.slice(2, 4));
    s = Number(text.slice(4));
  } else {
    return null;
  }
  if (h > 23 || m > 59 || s > 59) return null;
  return h * 3600 + m * 60 + s;
}

/** Seconds since midnight of a time string, or `null` when it is not one. */
export function timeToSeconds(value: string | undefined | null): number | null {
  if (!value) return null;
  return parseTimeInput(value);
}

/** Every `stepMinutes` from 00:00 to 23:59, as `HH:mm`. */
export function timeSlots(stepMinutes: number): string[] {
  const step = Math.max(1, Math.round(stepMinutes));
  const out: string[] = [];
  for (let m = 0; m < 24 * 60; m += step) out.push(formatTimeOfDay(m * 60));
  return out;
}

/** Split seconds into whole days, hours, minutes and seconds. */
export function splitDuration(totalSeconds: number, withDays = true) {
  let rest = Math.max(0, Math.floor(totalSeconds));
  const days = withDays ? Math.floor(rest / 86400) : 0;
  rest -= days * 86400;
  const hours = Math.floor(rest / 3600);
  rest -= hours * 3600;
  const minutes = Math.floor(rest / 60);
  const seconds = rest - minutes * 60;
  return { days, hours, minutes, seconds };
}

/** A Date with the time of day replaced (seconds since midnight). */
export function withTimeOfDay(date: Date, seconds: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setHours(Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60, 0);
  return d;
}

/** Seconds since local midnight of a Date. */
export function secondsOfDay(date: Date): number {
  return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
}
