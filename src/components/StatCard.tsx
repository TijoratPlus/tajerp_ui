import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import * as React from "react";

import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import { focusRing } from "../lib/control";
import { Card } from "./Card";
import { useCommonMessages, useFormat, useMessages } from "./TajUIProvider";

export const statCardMessages = defineMessages("statCard", {
  ru: {
    deltaLabel: "vs прошлый месяц",
    up: "Рост",
    down: "Снижение",
    flat: "Без изменений",
    trend: (first: string, last: string, points: number) =>
      `Динамика: от ${first} до ${last}, точек: ${points}`,
  },
  tg: {
    deltaLabel: "нисбат ба моҳи гузашта",
    up: "Афзоиш",
    down: "Коҳиш",
    flat: "Бе тағйир",
    trend: (first: string, last: string, points: number) =>
      `Тағйирот: аз ${first} то ${last}, нуқтаҳо: ${points}`,
  },
  en: {
    deltaLabel: "vs last month",
    up: "Up",
    down: "Down",
    flat: "No change",
    trend: (first: string, last: string, points: number) =>
      `Trend: from ${first} to ${last}, ${points} points`,
  },
});

export type StatCardMessages = (typeof statCardMessages.locales)["ru"];

type Formatter = ReturnType<typeof useFormat>;

function formatPercent(f: Formatter, value: number, signed = false): string {
  const n = f.number(value, {
    maximumFractionDigits: 1,
    signDisplay: signed ? "exceptZero" : undefined,
  });
  // ru/tg print "12,5 %" (no-break space), en "12.5%".
  return f.locale === "en" ? `${n}%` : `${n}\u00a0%`;
}

// ── Delta ───────────────────────────────────────────────────────────────────

export type DeltaDirection = "up" | "down" | "flat";

export function getDeltaDirection(value: number): DeltaDirection {
  if (!Number.isFinite(value) || Math.abs(value) < 0.05) return "flat";
  return value > 0 ? "up" : "down";
}

/** Whether a change is good news, given `invert` for "lower is better". */
function deltaSentiment(direction: DeltaDirection, invert: boolean) {
  if (direction === "flat") return "neutral" as const;
  return (direction === "up") !== invert
    ? ("positive" as const)
    : ("negative" as const);
}

const sentimentInk = {
  positive: "text-tj-success-ink",
  negative: "text-tj-error-ink",
  neutral: "text-ink-3",
};

const sentimentFill = {
  positive: "bg-tj-success/12",
  negative: "bg-tj-error/12",
  neutral: "bg-ui-surface-2",
};

export interface DeltaProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Percent change, e.g. `12.5` for +12,5 %. */
  value: number;
  /**
   * Lower is better (expenses, returns, debt): a fall is shown green.
   */
  invert?: boolean;
  /** Plain text instead of a tinted pill. */
  variant?: "pill" | "plain";
  labels?: Partial<StatCardMessages>;
}

/**
 * Percent change with an arrow, sign and colour — never colour alone.
 * Screen readers hear "Рост +12,5 %".
 */
export const Delta = React.forwardRef<HTMLSpanElement, DeltaProps>(
  (
    { className, value, invert = false, variant = "pill", labels, ...props },
    ref,
  ) => {
    const t = useMessages(statCardMessages, labels);
    const f = useFormat();
    const direction = getDeltaDirection(value);
    const sentiment = deltaSentiment(direction, invert);
    const Icon =
      direction === "up"
        ? ArrowUpRight
        : direction === "down"
          ? ArrowDownRight
          : Minus;

    return (
      <span
        ref={ref}
        data-slot="delta"
        data-direction={direction}
        data-sentiment={sentiment}
        className={cn(
          "inline-flex items-center gap-0.5 text-ui-caption font-bold tabular-nums whitespace-nowrap",
          sentimentInk[sentiment],
          variant === "pill" &&
            cn("!rounded-pill px-1.5 py-0.5", sentimentFill[sentiment]),
          className,
        )}
        {...props}
      >
        <Icon className="size-3.5 shrink-0" aria-hidden />
        <span className="sr-only">{t[direction]} </span>
        {formatPercent(f, direction === "flat" ? 0 : value, true)}
      </span>
    );
  },
);
Delta.displayName = "Delta";

// ── Sparkline ───────────────────────────────────────────────────────────────

export type SparklineTone =
  "brand" | "neutral" | "success" | "warning" | "danger" | "info";

const sparkTone: Record<SparklineTone, string> = {
  brand: "text-brand",
  neutral: "text-ink-3",
  success: "text-tj-success",
  warning: "text-tj-warning",
  danger: "text-tj-error",
  info: "text-tj-info",
};

export interface SparklineProps extends Omit<
  React.SVGProps<SVGSVGElement>,
  "values" | "ref"
> {
  data: number[];
  tone?: SparklineTone;
  /** `area` adds a soft fill under the line. */
  variant?: "line" | "area";
  /** Drawing height in px; width stretches to the container. */
  height?: number;
  strokeWidth?: number;
  /**
   * Announce a localized trend summary ("от 1 200 до 1 540") as `role="img"`.
   * Pass `aria-label` for a custom summary. Otherwise the sparkline is
   * decorative (`aria-hidden`) — the usual case next to a Delta.
   */
  summarize?: boolean;
  labels?: Partial<StatCardMessages>;
}

const VIEW_W = 100;

/** Tiny trend line in pure SVG — no chart library. */
export const Sparkline = React.forwardRef<SVGSVGElement, SparklineProps>(
  (
    {
      className,
      data,
      tone = "brand",
      variant = "area",
      height = 32,
      strokeWidth = 1.75,
      summarize = false,
      labels,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const t = useMessages(statCardMessages, labels);
    const f = useFormat();
    const gradientId = React.useId();
    const points = data.filter((n) => Number.isFinite(n));

    const pad = strokeWidth;
    const h = height;
    let line = "";
    let area = "";
    if (points.length > 0) {
      const min = Math.min(...points);
      const max = Math.max(...points);
      const range = max - min || 1;
      const series = points.length === 1 ? [points[0], points[0]] : points;
      const step = VIEW_W / (series.length - 1);
      const coords = series.map((v, i) => {
        const x = i * step;
        const y =
          max === min ? h / 2 : pad + (1 - (v - min) / range) * (h - pad * 2);
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      });
      line = coords.join(" ");
      area = `M0,${h} L${coords.join(" L")} L${VIEW_W},${h} Z`;
    }

    const label =
      ariaLabel ??
      (summarize && points.length > 1
        ? t.trend(
            f.number(points[0], { maximumFractionDigits: 2 }),
            f.number(points[points.length - 1], { maximumFractionDigits: 2 }),
            points.length,
          )
        : undefined);

    return (
      <svg
        ref={ref}
        data-slot="sparkline"
        viewBox={`0 0 ${VIEW_W} ${h}`}
        preserveAspectRatio="none"
        width="100%"
        height={h}
        role={label ? "img" : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        focusable="false"
        className={cn("block overflow-visible", sparkTone[tone], className)}
        {...props}
      >
        {variant === "area" && area ? (
          <>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity={0.22} />
                <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
              </linearGradient>
            </defs>
            <path d={area} fill={`url(#${gradientId})`} stroke="none" />
          </>
        ) : null}
        {line ? (
          <polyline
            points={line}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
      </svg>
    );
  },
);
Sparkline.displayName = "Sparkline";

// ── StatCard ────────────────────────────────────────────────────────────────

// Spans, not <Skeleton> divs: the card may render as a <button> or <a>.
const skeletonBar =
  "block !rounded-md bg-ui-surface-2 motion-safe:animate-pulse";

export type StatFormat = "money" | "number" | "percent";

export interface StatCardProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "title" | "onClick"
> {
  /** Metric name, e.g. "Выручка". */
  label: React.ReactNode;
  /** Pre-rendered value. Wins over `amount`. */
  value?: React.ReactNode;
  /** Raw number, formatted per `format` with the provider's locale. */
  amount?: number;
  /** How to format `amount`. Defaults to `money` (1 234,50 с). */
  format?: StatFormat;
  /** Fraction digits for `amount` (money defaults to 2, others to 0–1). */
  fractionDigits?: number;
  /** Compact notation: 1,2 млн с. */
  compact?: boolean;
  /** Percent change vs the comparison period. */
  delta?: number;
  /** Comparison text after the delta. Defaults to "vs прошлый месяц". */
  deltaLabel?: React.ReactNode;
  /** Lower is better (expenses, returns): a fall is shown as good. */
  invertDelta?: boolean;
  icon?: React.ReactNode;
  /** Trend values, oldest first. */
  sparkline?: number[];
  /** Defaults to the delta's sentiment (green / red), or brand. */
  sparklineTone?: SparklineTone;
  /** Extra content under the value (a progress bar, a target). */
  footer?: React.ReactNode;
  loading?: boolean;
  /** Makes the whole card a link to the detailed report. */
  href?: string;
  /** Makes the whole card a button (ignored when `href` is set). */
  onClick?: React.MouseEventHandler<HTMLElement>;
  labels?: Partial<StatCardMessages>;
}

/**
 * KPI tile for dashboards: revenue, orders, margin, customers. Pair four in a
 * responsive grid. Becomes a link or button with `href` / `onClick`.
 */
export const StatCard = React.forwardRef<HTMLElement, StatCardProps>(
  (
    {
      className,
      label,
      value,
      amount,
      format = "money",
      fractionDigits,
      compact,
      delta,
      deltaLabel,
      invertDelta = false,
      icon,
      sparkline,
      sparklineTone,
      footer,
      loading = false,
      href,
      onClick,
      labels,
      ...props
    },
    ref,
  ) => {
    const t = useMessages(statCardMessages, labels);
    const common = useCommonMessages();
    const f = useFormat();

    let display: React.ReactNode = value;
    if (display === undefined && amount !== undefined) {
      if (format === "money") {
        display = f.money(amount, {
          compact,
          ...(fractionDigits !== undefined
            ? {
                minimumFractionDigits: fractionDigits,
                maximumFractionDigits: fractionDigits,
              }
            : compact
              ? { minimumFractionDigits: 0, maximumFractionDigits: 1 }
              : {}),
        });
      } else if (format === "percent") {
        const n = f.number(amount, {
          maximumFractionDigits: fractionDigits ?? 1,
        });
        display = f.locale === "en" ? `${n}%` : `${n}\u00a0%`;
      } else {
        display = f.number(amount, {
          compact,
          maximumFractionDigits: fractionDigits ?? (compact ? 1 : 0),
        });
      }
    }

    const direction =
      delta !== undefined ? getDeltaDirection(delta) : undefined;
    const sentiment = direction
      ? deltaSentiment(direction, invertDelta)
      : undefined;
    const tone: SparklineTone =
      sparklineTone ??
      (sentiment === "positive"
        ? "success"
        : sentiment === "negative"
          ? "danger"
          : "brand");

    const interactive = !!href || !!onClick;
    const as = href ? "a" : onClick ? "button" : "div";
    // Card's props are HTMLElement-generic; link/button attributes go here.
    const elementProps: Record<string, unknown> =
      as === "a" ? { href } : as === "button" ? { type: "button" } : {};

    return (
      <Card
        ref={ref}
        as={as}
        data-slot="stat-card"
        variant={interactive ? "interactive" : "default"}
        padding="lg"
        {...elementProps}
        onClick={onClick}
        aria-busy={loading || undefined}
        className={cn(
          "flex min-w-0 flex-col gap-2 text-left no-underline",
          interactive && cn("cursor-pointer", focusRing),
          className,
        )}
        {...props}
      >
        <span className="flex items-start justify-between gap-2">
          <span
            data-slot="stat-card-label"
            className="min-w-0 text-ui-label font-medium text-ink-3"
          >
            {label}
          </span>
          {icon ? (
            <span
              aria-hidden
              data-slot="stat-card-icon"
              className="inline-flex size-8 shrink-0 items-center justify-center !rounded-lg bg-mist text-mist-ink [&>svg]:size-4"
            >
              {icon}
            </span>
          ) : null}
        </span>

        {loading ? (
          <span className="flex flex-col gap-2">
            <span className="sr-only">{common.loading}</span>
            <span aria-hidden className={cn(skeletonBar, "h-7 w-2/3")} />
            <span aria-hidden className={cn(skeletonBar, "h-4 w-1/2")} />
          </span>
        ) : (
          <>
            {/* The value gets the full width (amounts like "184 200,00 с"
                must never truncate); delta and sparkline share the row below. */}
            <span
              data-slot="stat-card-value"
              className="font-bold leading-tight tracking-tight text-ink-1 tabular-nums break-words text-(length:--tj-fs-lg)"
            >
              {display}
            </span>
            {delta !== undefined || (sparkline && sparkline.length > 0) ? (
              <span className="flex items-end justify-between gap-3">
                {delta !== undefined ? (
                  <span className="flex min-w-0 flex-wrap items-center gap-1.5">
                    <Delta value={delta} invert={invertDelta} labels={labels} />
                    <span className="text-ui-caption text-ink-3">
                      {deltaLabel ?? t.deltaLabel}
                    </span>
                  </span>
                ) : (
                  <span />
                )}
                {sparkline && sparkline.length > 0 ? (
                  <Sparkline
                    data={sparkline}
                    tone={tone}
                    height={32}
                    className="w-20 shrink-0"
                  />
                ) : null}
              </span>
            ) : null}
            {footer ? (
              <span data-slot="stat-card-footer" className="block">
                {footer}
              </span>
            ) : null}
          </>
        )}
      </Card>
    );
  },
);
StatCard.displayName = "StatCard";
