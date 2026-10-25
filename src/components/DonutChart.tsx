import * as React from "react";
import {
  Pie,
  PieChart,
  Tooltip as RechartsTooltip,
  type TooltipContentProps,
} from "recharts";

import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import {
  ChartEmpty,
  ChartLoading,
  ChartTooltipBox,
  chartColorAt,
  useChartFormatters,
  type ChartValueFormat,
} from "./AxisChart";
import { useMessages } from "./TajUIProvider";

export const donutChartMessages = defineMessages("donutChart", {
  ru: {
    loading: "Загрузка…",
    empty: "Нет данных за период",
    name: "Категория",
    value: "Значение",
    share: "Доля",
    total: "Итого",
    tableCaption: "Данные диаграммы",
  },
  tg: {
    loading: "Боркунӣ…",
    empty: "Барои ин давра маълумот нест",
    name: "Гурӯҳ",
    value: "Қимат",
    share: "Ҳисса",
    total: "Ҳамагӣ",
    tableCaption: "Маълумоти диаграмма",
  },
  en: {
    loading: "Loading…",
    empty: "No data for this period",
    name: "Category",
    value: "Value",
    share: "Share",
    total: "Total",
    tableCaption: "Chart data",
  },
});

export type DonutChartLabels = (typeof donutChartMessages.locales)["ru"];

export interface DonutDatum {
  name: string;
  value: number;
  /** Explicit colour; overrides `colors` and the chart tokens. */
  color?: string;
}

export interface DonutChartProps extends Omit<
  React.ComponentPropsWithoutRef<"figure">,
  "children" | "title"
> {
  data: DonutDatum[];
  /** Visible caption (`<figcaption>`). */
  title?: React.ReactNode;
  /** Accessible name when there is no `title` (or to override it). */
  ariaLabel?: string;
  /** Longer description, linked with `aria-describedby`. */
  description?: React.ReactNode;
  /** Small text in the hole, e.g. "Выручка". */
  centerLabel?: React.ReactNode;
  /**
   * Big text in the hole. A number is printed with `valueFormat`;
   * `"total"` prints the sum of all values.
   */
  centerValue?: number | "total" | React.ReactNode;
  /** Format of values in the legend, tooltip, centre and table. */
  valueFormat?: ChartValueFormat;
  /** Palette overriding the `--ui-chart-*` tokens, by slice index. */
  colors?: string[];
  /** Ring diameter in px. Defaults to 200. */
  size?: number;
  /** Ring thickness as a share of the radius (0–1). Defaults to 0.32. */
  thickness?: number;
  /** Legend beside the ring (wraps under it on narrow screens) or below it. */
  legendPosition?: "right" | "bottom" | "none";
  loading?: boolean;
  labels?: Partial<DonutChartLabels>;
}

/**
 * Donut (ring) chart for shares of a whole — sales by payment method,
 * revenue by category. The legend is an HTML list with values and
 * percentages; screen readers also get a data table with the total.
 */
export const DonutChart = React.forwardRef<HTMLElement, DonutChartProps>(
  function DonutChart(
    {
      data,
      title,
      ariaLabel,
      description,
      centerLabel,
      centerValue,
      valueFormat = "number",
      colors,
      size = 200,
      thickness = 0.32,
      legendPosition = "right",
      loading = false,
      labels,
      className,
      ...props
    },
    ref,
  ) {
    const t = useMessages(donutChartMessages, labels);
    const f = useChartFormatters({ valueFormat });
    const descId = React.useId();
    const titleId = React.useId();

    const slices = React.useMemo(
      () =>
        data.map((d, i) => ({
          name: d.name,
          value: d.value,
          fill: chartColorAt(i, d.color, colors),
        })),
      [data, colors],
    );
    const total = React.useMemo(
      () =>
        slices.reduce(
          (sum, s) =>
            sum + (Number.isFinite(s.value) && s.value > 0 ? s.value : 0),
          0,
        ),
      [slices],
    );
    const share = (v: number) =>
      total > 0 ? (Math.max(v, 0) / total) * 100 : 0;

    const isEmpty = slices.length === 0 || total <= 0;
    const captionText =
      ariaLabel ?? (typeof title === "string" ? title : undefined);

    const center =
      centerValue === "total"
        ? f.value(total)
        : typeof centerValue === "number"
          ? f.value(centerValue)
          : centerValue;

    const renderTooltip = (p: TooltipContentProps) => {
      const e = p.active ? p.payload?.[0] : undefined;
      if (!e) return null;
      const v = typeof e.value === "number" ? e.value : 0;
      return (
        <ChartTooltipBox
          items={[
            {
              key: String(e.name),
              color: (e.payload as { fill?: string } | undefined)?.fill,
              name: e.name,
              value: `${f.value(v)} · ${f.percent(share(v))}`,
            },
          ]}
        />
      );
    };

    const outer = 50;
    const inner = Math.round(
      outer * (1 - Math.min(Math.max(thickness, 0.05), 1)),
    );

    return (
      <figure
        ref={ref}
        data-slot="donut-chart"
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
            data-slot="donut-chart-title"
            className="mb-3 text-ui-title font-bold text-ink-1"
          >
            {title}
          </figcaption>
        ) : null}
        {description ? (
          <p
            id={descId}
            data-slot="donut-chart-description"
            className="-mt-2 mb-3 text-ui-helper text-ink-3"
          >
            {description}
          </p>
        ) : null}

        {loading ? (
          <ChartLoading height={size} label={t.loading} />
        ) : isEmpty ? (
          <ChartEmpty height={size} label={t.empty} />
        ) : (
          <div
            data-slot="donut-chart-body"
            className={cn(
              "flex flex-col items-center gap-4",
              legendPosition === "right" &&
                "sm:flex-row sm:items-center sm:gap-6",
            )}
          >
            <div
              aria-hidden="true"
              // Recharts makes sectors focusable; the plot is decorative (the
              // legend and sr-only table carry the data), so take it out of
              // the tab order entirely.
              ref={(el) => el?.setAttribute("inert", "")}
              data-slot="donut-chart-plot"
              className="relative shrink-0"
              style={{ width: size, height: size }}
            >
              <PieChart width={size} height={size} accessibilityLayer={false}>
                <Pie
                  data={slices}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={`${inner * 2}%`}
                  outerRadius={`${outer * 2}%`}
                  paddingAngle={slices.length > 1 ? 1.5 : 0}
                  cornerRadius={3}
                  stroke="var(--ui-surface)"
                  strokeWidth={2}
                  startAngle={90}
                  endAngle={-270}
                  isAnimationActive={false}
                />
                <RechartsTooltip content={renderTooltip} />
              </PieChart>
              {centerLabel || center ? (
                <div
                  data-slot="donut-chart-center"
                  className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-[18%] text-center"
                >
                  {center ? (
                    <span className="max-w-full truncate text-ui-title font-bold tabular-nums text-ink-1">
                      {center}
                    </span>
                  ) : null}
                  {centerLabel ? (
                    <span className="max-w-full truncate text-ui-caption text-ink-3">
                      {centerLabel}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>

            {legendPosition !== "none" ? (
              <ul
                data-slot="donut-chart-legend"
                className={cn(
                  "flex w-full min-w-0 flex-col gap-2",
                  legendPosition === "right" && "sm:flex-1",
                )}
              >
                {slices.map((s) => (
                  <li
                    key={s.name}
                    data-slot="donut-chart-legend-item"
                    className="flex items-center gap-2 text-ui-body"
                  >
                    <span
                      aria-hidden
                      className="size-2.5 shrink-0 !rounded-sm"
                      style={{ background: s.fill }}
                    />
                    <span className="min-w-0 flex-1 truncate text-ink-2">
                      {s.name}
                    </span>
                    <span className="font-semibold tabular-nums text-ink-1">
                      {f.value(s.value)}
                    </span>
                    <span className="w-14 text-right text-ui-helper tabular-nums text-ink-3">
                      {f.percent(share(s.value))}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}

            <table data-slot="donut-chart-table" className="sr-only">
              <caption>{captionText ?? title ?? t.tableCaption}</caption>
              <thead>
                <tr>
                  <th scope="col">{t.name}</th>
                  <th scope="col">{t.value}</th>
                  <th scope="col">{t.share}</th>
                </tr>
              </thead>
              <tbody>
                {slices.map((s) => (
                  <tr key={s.name}>
                    <th scope="row">{s.name}</th>
                    <td>{f.value(s.value)}</td>
                    <td>{f.percent(share(s.value))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row">{t.total}</th>
                  <td>{f.value(total)}</td>
                  <td>{f.percent(100)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </figure>
    );
  },
);
DonutChart.displayName = "DonutChart";
