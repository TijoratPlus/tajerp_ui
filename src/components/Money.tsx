import * as React from "react";

import { formatMoney, formatNumber } from "../i18n/format";
import { intlLocale, type Locale } from "../i18n/locale";
import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import { useFormat, useMessages } from "./TajUIProvider";

export const moneyMessages = defineMessages("money", {
  ru: {
    /** Spoken name of the somoni, used in the screen-reader amount. */
    somoni: "сомони",
    oldPrice: "Старая цена:",
  },
  tg: {
    somoni: "сомонӣ",
    oldPrice: "Нархи пешина:",
  },
  en: {
    somoni: "somoni",
    oldPrice: "Old price:",
  },
});

export type MoneyLabels = (typeof moneyMessages.locales)["ru"];

export type MoneyTone =
  | "auto"
  | "brand"
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  /** @deprecated alias of `danger`. */
  | "error";

export type MoneySize = "sm" | "md" | "lg" | "xl";

/**
 * Printed currency symbol: TJS → "с" (ru/tg) / "TJS" (en); other currencies
 * use Intl's narrow symbol ($, ₽, €).
 */
export function currencySymbol(currency = "TJS", locale: Locale = "ru"): string {
  if (currency === "TJS") return locale === "en" ? "TJS" : "с";
  try {
    return (
      new Intl.NumberFormat(intlLocale(locale), {
        style: "currency",
        currency,
        currencyDisplay: "narrowSymbol",
      })
        .formatToParts(0)
        .find((p) => p.type === "currency")?.value ?? currency
    );
  } catch {
    return currency;
  }
}

/** Currency name for screen readers ("долларов США"); TJS uses `somoni`. */
function currencyName(currency: string, locale: Locale, somoni: string): string {
  if (currency === "TJS") return somoni;
  try {
    return (
      new Intl.NumberFormat(intlLocale(locale), {
        style: "currency",
        currency,
        currencyDisplay: "name",
      })
        .formatToParts(5)
        .find((p) => p.type === "currency")?.value ?? currency
    );
  } catch {
    return currency;
  }
}

/**
 * The provider's default currency. `useFormat()` does not expose it (yet), so
 * fall back to checking whether its money output matches TJS.
 */
function providerCurrency(fmt: ReturnType<typeof useFormat>): string | undefined {
  const exposed = (fmt as { currency?: string }).currency;
  if (exposed) return exposed;
  const probe = { minimumFractionDigits: 0, maximumFractionDigits: 0 };
  return fmt.money(0, probe) === formatMoney(0, { locale: fmt.locale, currency: "TJS", ...probe })
    ? "TJS"
    : undefined;
}

function spokenAmount(
  amount: string,
  printed: string,
  currency: string | undefined,
  locale: Locale,
  somoni: string,
): string {
  // Unknown provider currency: the printed Intl symbol ($, €) reads fine.
  if (!currency) return printed;
  return `${amount} ${currencyName(currency, locale, somoni)}`;
}

const toneClass: Record<Exclude<MoneyTone, "auto">, string> = {
  brand: "text-brand-ink",
  neutral: "text-ink-1",
  success: "text-tj-success-ink",
  warning: "text-tj-warning-ink",
  danger: "text-tj-error-ink",
  error: "text-tj-error-ink",
  info: "text-tj-info-ink",
};

const sizeClass: Record<MoneySize, string> = {
  sm: "text-ui-label",
  md: "text-ui-control",
  lg: "text-lg font-semibold",
  xl: "text-2xl font-bold tracking-tight sm:text-3xl",
};

export type MoneyProps = Omit<React.DataHTMLAttributes<HTMLDataElement>, "children" | "value"> & {
  /** Amount in currency units (not tiyin). */
  value: number;
  /** ISO 4217 code. Defaults to the provider currency (TJS). */
  currency?: string;
  /** Override the printed symbol. */
  symbol?: string;
  /** Print the bare amount, e.g. in a column whose header names the currency. */
  hideSymbol?: boolean;
  /** Decimals to print. Defaults to 2. */
  fractionDigits?: number;
  /** Sign display, e.g. `"exceptZero"` for deltas (+150,00 с). */
  signDisplay?: Intl.NumberFormatOptions["signDisplay"];
  /**
   * Colour. `auto` (default) inherits the surrounding text colour, or uses the
   * danger ink for negative amounts when `colorNegative` is set.
   */
  tone?: MoneyTone;
  /** With `tone="auto"`, print negative amounts in the danger ink. */
  colorNegative?: boolean;
  /** `sm` table cells · `md` body · `lg` line totals · `xl` receipt / cart totals. */
  size?: MoneySize;
  /** Cross out the amount (old price next to a discounted one). */
  strikethrough?: boolean;
  labels?: Partial<MoneyLabels>;
};

/**
 * Display an amount of money the way Tijorat+ prints it: `1 234,50 с`, with
 * tabular digits so columns line up. Renders a `<data value>` element with the
 * machine-readable amount; screen readers hear the full amount with the
 * currency name ("1 234,50 сомони") instead of the bare symbol.
 */
export const Money = React.forwardRef<HTMLDataElement, MoneyProps>(
  (
    {
      className,
      value,
      currency,
      symbol,
      hideSymbol = false,
      fractionDigits = 2,
      signDisplay,
      tone = "auto",
      colorNegative = false,
      size = "md",
      strikethrough = false,
      labels,
      ...props
    },
    ref,
  ) => {
    const fmt = useFormat();
    const t = useMessages(moneyMessages, labels);

    const digits = {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    };
    const printed = fmt.money(value, {
      ...digits,
      currency,
      symbol,
      hideSymbol,
      signDisplay,
    });
    const amount = formatNumber(value, { locale: fmt.locale, signDisplay, ...digits });
    const spoken =
      !Number.isFinite(value) || hideSymbol
        ? printed
        : spokenAmount(amount, printed, currency ?? providerCurrency(fmt), fmt.locale, t.somoni);

    const resolvedTone =
      tone === "auto" ? (colorNegative && value < 0 ? "danger" : undefined) : tone;

    return (
      <data
        ref={ref}
        value={Number.isFinite(value) ? String(value) : undefined}
        data-slot="money"
        data-negative={value < 0 || undefined}
        className={cn(
          "whitespace-nowrap tabular-nums",
          sizeClass[size],
          resolvedTone && toneClass[resolvedTone],
          strikethrough && "font-normal text-ink-3 line-through decoration-1",
          className,
        )}
        {...props}
      >
        <span aria-hidden data-slot="money-text">
          {printed}
        </span>
        <span className="sr-only">
          {strikethrough ? `${t.oldPrice} ${spoken}` : spoken}
        </span>
      </data>
    );
  },
);
Money.displayName = "Money";
