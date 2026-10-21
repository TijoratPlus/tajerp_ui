import * as React from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";

import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import { useFormat, useMessages } from "./TajUIProvider";

/* -------------------------------------------------------------------------- */
/* Shared chart helpers (also used by DonutChart)                              */
/* -------------------------------------------------------------------------- */

/**
 * How chart values are printed in ticks, tooltips, legends and the
 * screen-reader table.
 * - `"number"`: `1 234,5`
 * - `"money"`: `1 234,50 с` (the provider's currency; ticks use compact form)
 * - `"percent"`: the value is already a percentage, `12,5 %`
 * - a function for anything else.
 */
export type ChartValueFormat =
  "number" | "money" | "percent" | ((value: number) => string);

/**
 * How x-axis values (categories) are printed.
 * - `"date"`: the value is a Date / timestamp / ISO string, printed `21.10.2026`
 * - `Intl.DateTimeFormatOptions`: a date with custom options (`{ day: "numeric", month: "short" }`)
 * - a function for anything else.
 */
export type ChartCategoryFormat =
  "date" | Intl.DateTimeFormatOptions | ((value: unknown) => string);

/** The eight categorical chart tokens, in order. */
export const CHART_COLORS = [
  "var(--ui-chart-1)",
  "var(--ui-chart-2)",
  "var(--ui-chart-3)",
  "var(--ui-chart-4)",
  "var(--ui-chart-5)",
  "var(--ui-chart-6)",
  "var(--ui-chart-7)",
  "var(--ui-chart-8)",
] as const;

/** Colour for the series/slice at `index`: explicit, then palette, then tokens. */
export function chartColorAt(
  index: number,
  explicit?: string,
  palette?: string[],
): string {
  return (
    explicit ??
    (palette && palette.length > 0
      ? palette[index % palette.length]
      : undefined) ??
    CHART_COLORS[index % CHART_COLORS.length]
  );
}

export interface ChartFormatters {
  /** Full value (tooltip, legend, table). */
  value: (v: unknown) => string;
  /** Short value for axis ticks. */
  tick: (v: unknown) => string;
  /** Category / x value. */
  category: (v: unknown) => string;
  /** Share of a whole, `v` in percent (0–100). */
  percent: (v: number) => string;
}

function toNumber(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Bind value / tick / category formatters to the provider locale. */
export function useChartFormatters({
  valueFormat = "number",
  tickFormat,
  categoryFormat,
}: {
  valueFormat?: ChartValueFormat;
  tickFormat?: ChartValueFormat;
  categoryFormat?: ChartCategoryFormat;
}): ChartFormatters {
  const fmt = useFormat();
  return React.useMemo(() => {
    const percent = (v: number) =>
      `${fmt.number(v, { maximumFractionDigits: 1 })}${fmt.locale === "en" ? "" : " "}%`;

    const make =
      (format: ChartValueFormat, short: boolean) => (raw: unknown) => {
        const v = toNumber(raw);
        if (v === null) return raw == null ? "—" : String(raw);
        if (typeof format === "function") return format(v);
        switch (format) {
          case "money":
            return short && Math.abs(v) >= 10000
              ? fmt.money(v, {
                  compact: true,
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 1,
                })
              : fmt.money(
                  v,
                  short
                    ? { minimumFractionDigits: 0, maximumFractionDigits: 2 }
                    : undefined,
                );
          case "percent":
            return percent(v);
          default:
            return short && Math.abs(v) >= 10000
              ? fmt.number(v, { compact: true, maximumFractionDigits: 1 })
              : fmt.number(v, { maximumFractionDigits: 2 });
        }
      };

    const category = (raw: unknown) => {
      if (categoryFormat === undefined) return raw == null ? "" : String(raw);
      if (typeof categoryFormat === "function") return categoryFormat(raw);
      if (raw == null) return "";
      const date =
        raw instanceof Date ||
        typeof raw === "number" ||
        typeof raw === "string"
          ? raw
          : String(raw);
      return categoryFormat === "date"
        ? fmt.date(date)
        : fmt.date(date, categoryFormat);
    };

    return {
      value: make(valueFormat, false),
      tick: make(tickFormat ?? valueFormat, true),
      category,
      percent,
    };
  }, [fmt, valueFormat, tickFormat, categoryFormat]);
}

/** Tooltip box shared by the charts; styled with tokens. */
export function ChartTooltipBox({
  label,
  items,
}: {
  label?: React.ReactNode;
  items: Array<{
    key: string;
    color?: string;
    name: React.ReactNode;
    value: React.ReactNode;
  }>;
}) {
  return (
    <div
      data-slot="chart-tooltip"
      className="min-w-32 !rounded-lg border border-hairline bg-ui-surface px-3 py-2 text-ui-helper text-ink-1 shadow-tj-md"
    >
      {label !== undefined && label !== "" ? (
        <div className="mb-1 font-semibold text-ink-1">{label}</div>
      ) : null}
      <ul className="flex flex-col gap-1">
        {items.map((it) => (
          <li key={it.key} className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-2.5 shrink-0 !rounded-sm"
              style={{ background: it.color }}
            />
            <span className="text-ink-3">{it.name}</span>
            <span className="ml-auto pl-3 font-semibold tabular-nums">
              {it.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Skeleton block announced as a polite status. */
export function ChartLoading({
  height,
  label,
}: {
  height: number;
  label: string;
}) {
  return (
    <div data-slot="chart-loading" role="status" aria-live="polite">
      <div
        aria-hidden
        className="w-full !rounded-lg bg-ui-surface-2 motion-safe:animate-pulse"
        style={{ height }}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

/** Empty-period placeholder sized like the chart. */
export function ChartEmpty({
  height,
  label,
}: {
  height: number;
  label: string;
}) {
  return (
    <div
      data-slot="chart-empty"
      className="flex w-full items-center justify-center !rounded-lg border border-dashed border-hairline bg-ui-surface-2 px-4 text-center text-ui-body text-ink-3"
      style={{ height }}
    >
      {label}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* AxisChart                                                                   */
/* -------------------------------------------------------------------------- */

export const axisChartMessages = defineMessages("axisChart", {
  ru: {
    loading: "Загрузка…",
    empty: "Нет данных за период",
    category: "Категория",
    tableCaption: "Данные графика",
  },
  tg: {
    loading: "Боркунӣ…",
    empty: "Барои ин давра маълумот нест",
    category: "Гурӯҳ",
    tableCaption: "Маълумоти диаграмма",
  },
  en: {
    loading: "Loading…",
    empty: "No data for this period",
    category: "Category",
    tableCaption: "Chart data",
  },
});

export type AxisChartLabels = (typeof axisChartMessages.locales)["ru"];

export interface AxisSeries {
  /** Must match the key holding this series' value on each data row. */
  name: string;
  /** Display name in legend, tooltip and table. Defaults to `name`. */
  label?: string;
  type?: "bar" | "line" | "area";
  /** Explicit colour; overrides `config.colors` and the chart tokens. */
  color?: string;
  /** Series with the same `stack` id are stacked (bars and areas). */
  stack?: string;
}

export interface AxisChartConfig {
  data: Array<Record<string, unknown>>;
  /** Visible caption (`<figcaption>`). */
  title?: React.ReactNode;
  xAxis: {
    key: string;
    type?: "category" | "number";
    /** Header of the category column in the screen-reader table. */
    title?: string;
    /** Print x values as dates or via a function. */
    format?: ChartCategoryFormat;
  };
  yAxis?: {
    title?: string;
    /** Tick format; defaults to `valueFormat` (compact for large values). */
    format?: ChartValueFormat;
  };
  /** Value format for tooltip and table (and ticks unless `yAxis.format`). */
  valueFormat?: ChartValueFormat;
  /** Palette overriding the `--ui-chart-*` tokens, by series index. */
  colors?: string[];
  /** Show the legend. Defaults to true. */
  legend?: boolean;
  series: AxisSeries[];
}

export interface AxisChartProps extends Omit<
  React.ComponentPropsWithoutRef<"figure">,
  "children" | "title"
> {
  config: AxisChartConfig;
  /** Plot height in px. Defaults to 300. */
  height?: number;
  /** Show a skeleton instead of the chart. */
  loading?: boolean;
  /** Accessible name when there is no `title` (or to override it). */
  ariaLabel?: string;
  /** Longer description, linked with `aria-describedby` and shown under the title. */
  description?: React.ReactNode;
  labels?: Partial<AxisChartLabels>;
}

const AXIS = "var(--ui-ink-3)";
const GRID = "var(--ui-hairline)";

/**
 * Token-themed axis chart (bar / line / area, stacked or grouped) built on
 * Recharts. `config` mirrors the shape used across TajERP analytics screens.
 * Screen readers get a figure with a caption and a data table; the SVG itself
 * is hidden from assistive technology.
 */
export const AxisChart = React.forwardRef<HTMLElement, AxisChartProps>(
  function AxisChart(
    {
      config,
      height = 300,
      loading = false,
      ariaLabel,
      description,
      labels,
      className,
      ...props
    },
    ref,
  ) {
    const {
      data,
      title,
      xAxis,
      yAxis,
      colors,
      series,
      valueFormat,
      legend = true,
    } = config;
    const t = useMessages(axisChartMessages, labels);
    const f = useChartFormatters({
      valueFormat,
      tickFormat: yAxis?.format,
      categoryFormat: xAxis.format,
    });
    const descId = React.useId();
    const titleId = React.useId();

    const resolved = React.useMemo(
      () =>
        series.map((s, i) => ({
          ...s,
          label: s.label ?? s.name,
          color: chartColorAt(i, s.color, colors),
        })),
      [series, colors],
    );

    // Only the top segment of a bar stack gets rounded corners.
    const topOfStack = React.useMemo(() => {
      const last = new Map<string, string>();
      for (const s of series)
        if (s.stack && (s.type ?? "bar") === "bar") last.set(s.stack, s.name);
      return last;
    }, [series]);

    const isEmpty = data.length === 0;
    const captionText =
      ariaLabel ?? (typeof title === "string" ? title : undefined);

    const renderTooltip = (p: TooltipContentProps) => {
      if (!p.active || !p.payload || p.payload.length === 0) return null;
      return (
        <ChartTooltipBox
          label={f.category(p.label)}
          items={p.payload.map((e, i) => ({
            key: String(e.dataKey ?? i),
            color:
              e.color ?? (e.payload as { fill?: string } | undefined)?.fill,
            name: e.name,
            value: f.value(e.value),
          }))}
        />
      );
    };

    return (
      <figure
        ref={ref}
        data-slot="axis-chart"
        aria-label={ariaLabel}
        aria-labelledby={!ariaLabel && title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        aria-busy={loading || undefined}
        className={cn("m-0 w-full", className)}
        {...props}
      >
        {title ? (
          <figcaption
            id={titleId}
            data-slot="axis-chart-title"
            className="mb-3 text-ui-title font-bold text-ink-1"
          >
            {title}
          </figcaption>
        ) : null}
        {description ? (
          <p
            id={descId}
            data-slot="axis-chart-description"
            className="-mt-2 mb-3 text-ui-helper text-ink-3"
          >
            {description}
          </p>
        ) : null}

        {loading ? (
          <ChartLoading height={height} label={t.loading} />
        ) : isEmpty ? (
          <ChartEmpty height={height} label={t.empty} />
        ) : (
          <>
            <div
              aria-hidden="true"
              data-slot="axis-chart-plot"
              className="w-full text-ui-caption"
              style={{ height }}
            >
              <ResponsiveContainer width="100%" height={height}>
                <ComposedChart
                  data={data}
                  accessibilityLayer={false}
                  margin={{ top: 8, right: 12, bottom: 4, left: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={GRID}
                    vertical={false}
                  />
                  <XAxis
                    dataKey={xAxis.key}
                    type={xAxis.type === "number" ? "number" : "category"}
                    tick={{ fill: AXIS }}
                    tickFormatter={(v: unknown) => f.category(v)}
                    tickLine={false}
                    axisLine={{ stroke: GRID }}
                  />
                  <YAxis
                    tick={{ fill: AXIS }}
                    tickFormatter={(v: unknown) => f.tick(v)}
                    tickLine={false}
                    axisLine={{ stroke: GRID }}
                    width="auto"
                    label={
                      yAxis?.title
                        ? {
                            value: yAxis.title,
                            angle: -90,
                            position: "insideLeft",
                            fill: AXIS,
                          }
                        : undefined
                    }
                  />
                  <RechartsTooltip
                    content={renderTooltip}
                    cursor={{ fill: "var(--ui-mist)", opacity: 0.4 }}
                  />
                  {resolved.map((s) => {
                    if (s.type === "line") {
                      return (
                        <Line
                          key={s.name}
                          dataKey={s.name}
                          name={s.label}
                          type="monotone"
                          stroke={s.color}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4 }}
                          isAnimationActive={false}
                        />
                      );
                    }
                    if (s.type === "area") {
                      return (
                        <Area
                          key={s.name}
                          dataKey={s.name}
                          name={s.label}
                          type="monotone"
                          stackId={s.stack}
                          stroke={s.color}
                          strokeWidth={2}
                          fill={s.color}
                          fillOpacity={s.stack ? 0.35 : 0.18}
                          isAnimationActive={false}
                        />
                      );
                    }
                    const rounded =
                      !s.stack || topOfStack.get(s.stack) === s.name;
                    return (
                      <Bar
                        key={s.name}
                        dataKey={s.name}
                        name={s.label}
                        stackId={s.stack}
                        fill={s.color}
                        radius={rounded ? [6, 6, 0, 0] : 0}
                        maxBarSize={48}
                        isAnimationActive={false}
                      />
                    );
                  })}
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {legend ? (
              <ul
                aria-hidden="true"
                data-slot="axis-chart-legend"
                className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-ui-label text-ink-2"
              >
                {resolved.map((s) => (
                  <li key={s.name} className="inline-flex items-center gap-1.5">
                    <span
                      className={cn(
                        "shrink-0",
                        s.type === "line"
                          ? "h-0.5 w-3 !rounded-full"
                          : "size-2.5 !rounded-sm",
                      )}
                      style={{ background: s.color }}
                    />
                    {s.label}
                  </li>
                ))}
              </ul>
            ) : null}

            <table data-slot="axis-chart-table" className="sr-only">
              <caption>{captionText ?? title ?? t.tableCaption}</caption>
              <thead>
                <tr>
                  <th scope="col">{xAxis.title ?? t.category}</th>
                  {resolved.map((s) => (
                    <th key={s.name} scope="col">
                      {s.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, ri) => (
                  <tr key={ri}>
                    <th scope="row">{f.category(row[xAxis.key])}</th>
                    {resolved.map((s) => (
                      <td key={s.name}>{f.value(row[s.name])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </figure>
    );
  },
);
AxisChart.displayName = "AxisChart";
