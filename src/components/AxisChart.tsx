import * as React from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "../lib/cn";

export interface AxisSeries {
  /** Must match the key holding this series' value on each data row. */
  name: string;
  type?: "bar" | "line";
  color?: string;
}

export interface AxisChartConfig {
  data: Array<Record<string, unknown>>;
  title?: React.ReactNode;
  xAxis: { key: string; type?: "category" | "number" };
  yAxis?: { title?: string };
  colors?: string[];
  series: AxisSeries[];
}

export interface AxisChartProps {
  config: AxisChartConfig;
  height?: number;
  className?: string;
}

const AXIS = "var(--ui-ink-3)";
const GRID = "var(--ui-hairline)";
const FALLBACK = ["#1D9F6E", "#6B7280", "#94A3B8", "#0D4430", "#A8DECA"];

/**
 * Token-themed axis chart (bar/line, multiple series) built on Recharts.
 * `config` mirrors the shape used across TajERP analytics screens.
 */
export function AxisChart({ config, height = 300, className }: AxisChartProps) {
  const { data, title, xAxis, yAxis, colors, series } = config;
  const colorAt = (i: number, fallback?: string) =>
    fallback ?? colors?.[i] ?? FALLBACK[i % FALLBACK.length];

  return (
    <div className={cn("w-full", className)}>
      {title ? (
        <h4 className="mb-3 text-[15px] font-bold text-ink-1">{title}</h4>
      ) : null}
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
          <XAxis
            dataKey={xAxis.key}
            type={xAxis.type === "number" ? "number" : "category"}
            tick={{ fill: AXIS, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: GRID }}
          />
          <YAxis
            tick={{ fill: AXIS, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: GRID }}
            label={
              yAxis?.title
                ? {
                    value: yAxis.title,
                    angle: -90,
                    position: "insideLeft",
                    fill: AXIS,
                    fontSize: 12,
                  }
                : undefined
            }
          />
          <RechartsTooltip
            contentStyle={{
              background: "var(--ui-surface)",
              border: "1px solid var(--ui-hairline)",
              borderRadius: 12,
              fontSize: 12,
              color: "var(--ui-ink-1)",
            }}
            cursor={{ fill: "var(--ui-mist)", opacity: 0.4 }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: AXIS }} />
          {series.map((s, i) =>
            s.type === "line" ? (
              <Line
                key={s.name}
                dataKey={s.name}
                stroke={colorAt(i, s.color)}
                strokeWidth={2}
                dot={false}
              />
            ) : (
              <Bar
                key={s.name}
                dataKey={s.name}
                fill={colorAt(i, s.color)}
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
            ),
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
