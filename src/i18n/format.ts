import { DEFAULT_LOCALE, intlLocale, type Locale } from "./locale";

/**
 * Locale-aware formatting helpers. Pure functions — usable outside React
 * (reports, CSV export). Inside components prefer `useFormat()`, which binds
 * the provider's locale.
 */

export interface NumberFormatOptions {
  locale?: Locale;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  signDisplay?: Intl.NumberFormatOptions["signDisplay"];
  /** Compact notation: 1,2 тыс. / 1.2K */
  compact?: boolean;
}

export function formatNumber(
  value: number,
  {
    locale = DEFAULT_LOCALE,
    minimumFractionDigits,
    maximumFractionDigits,
    signDisplay,
    compact,
  }: NumberFormatOptions = {},
): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(intlLocale(locale), {
    minimumFractionDigits,
    maximumFractionDigits,
    signDisplay,
    notation: compact ? "compact" : undefined,
  }).format(value);
}

/** Somoni: the sign printed after amounts across tijorat.plus ("18 с"). */
export const SOMONI_SYMBOL = "с";

export interface MoneyFormatOptions extends NumberFormatOptions {
  /** ISO 4217 code. Defaults to TJS (Tajik somoni). */
  currency?: string;
  /**
   * Override the printed symbol. TJS prints "с" in ru/tg and "TJS" in en;
   * other currencies use Intl's narrow symbol ($, ₽, €).
   */
  symbol?: string;
  /** Hide the symbol, e.g. in dense table columns with a currency header. */
  hideSymbol?: boolean;
}

/**
 * Format an amount of money. Somoni amounts are printed the way Tijorat+
 * receipts and screens show them: `1 234,50 с` (ru/tg) or `1,234.50 TJS` (en).
 */
export function formatMoney(
  value: number,
  {
    locale = DEFAULT_LOCALE,
    currency = "TJS",
    symbol,
    hideSymbol,
    minimumFractionDigits = 2,
    maximumFractionDigits = Math.max(2, minimumFractionDigits),
    signDisplay,
    compact,
  }: MoneyFormatOptions = {},
): string {
  if (!Number.isFinite(value)) return "—";
  const tag = intlLocale(locale);

  if (currency !== "TJS" && symbol === undefined && !hideSymbol) {
    return new Intl.NumberFormat(tag, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits,
      maximumFractionDigits,
      signDisplay,
      notation: compact ? "compact" : undefined,
    }).format(value);
  }

  const amount = formatNumber(value, {
    locale,
    minimumFractionDigits,
    maximumFractionDigits,
    signDisplay,
    compact,
  });
  if (hideSymbol) return amount;
  const sign = symbol ?? (locale === "en" ? "TJS" : SOMONI_SYMBOL);
  // No-break space keeps the symbol on the amount's line.
  return `${amount} ${sign}`;
}

/** The decimal separator users of `locale` type: "," for ru/tg, "." for en. */
export function decimalSeparator(locale: Locale = DEFAULT_LOCALE): string {
  return (
    new Intl.NumberFormat(intlLocale(locale))
      .formatToParts(1.5)
      .find((p) => p.type === "decimal")?.value ?? "."
  );
}

/**
 * Parse a number typed by a person: accepts "," or "." decimals and spaces /
 * no-break spaces / apostrophes as thousands separators. Returns NaN when the
 * text is not a number.
 */
export function parseNumber(input: string): number {
  const cleaned = input
    .trim()
    .replace(/[\s  '’]/g, "")
    .replace(/[−–]/g, "-");
  if (!cleaned) return Number.NaN;
  // The last separator is the decimal one; any earlier ones group thousands.
  const lastSep = Math.max(cleaned.lastIndexOf(","), cleaned.lastIndexOf("."));
  const normalised =
    lastSep === -1
      ? cleaned
      : cleaned.slice(0, lastSep).replace(/[.,]/g, "") +
        "." +
        cleaned.slice(lastSep + 1);
  if (!/^-?\d*\.?\d*$/.test(normalised) || /^-?\.?$/.test(normalised)) {
    return Number.NaN;
  }
  return Number(normalised);
}

/** Round away binary floating-point noise (0.1 + 0.2 → 0.3) to `digits`. */
export function roundTo(value: number, digits: number): number {
  const f = 10 ** digits;
  return Math.round((value + Number.EPSILON) * f) / f;
}

/** Number of decimals in a number's shortest representation. */
export function decimalsOf(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const s = String(value);
  if (s.includes("e-")) return Number(s.split("e-")[1]);
  return s.split(".")[1]?.length ?? 0;
}

export interface DateFormatOptions extends Intl.DateTimeFormatOptions {
  locale?: Locale;
}

export function formatDate(
  date: Date | number | string,
  { locale = DEFAULT_LOCALE, ...opts }: DateFormatOptions = {},
): string {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  const options: Intl.DateTimeFormatOptions =
    Object.keys(opts).length > 0
      ? opts
      : { day: "2-digit", month: "2-digit", year: "numeric" };
  return new Intl.DateTimeFormat(intlLocale(locale, "date"), options).format(d);
}

/** "5 минут назад" / "in 2 days" relative to `now`. */
export function formatRelative(
  date: Date | number | string,
  { locale = DEFAULT_LOCALE, now = Date.now() }: { locale?: Locale; now?: number } = {},
): string {
  const d = date instanceof Date ? date : new Date(date);
  const diff = (d.getTime() - now) / 1000;
  const abs = Math.abs(diff);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  const tag = intlLocale(locale, "date");
  const rtf = new Intl.RelativeTimeFormat(tag, { numeric: "auto" });
  for (const [unit, secs] of units) {
    if (abs >= secs) return rtf.format(Math.round(diff / secs), unit);
  }
  return rtf.format(Math.round(diff), "second");
}
