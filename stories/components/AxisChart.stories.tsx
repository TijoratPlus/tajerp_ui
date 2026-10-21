import type { Meta, StoryObj } from "@storybook/react";
import { TajUIProvider } from "../../src";
import { AxisChart } from "../../src/charts";

const meta: Meta<typeof AxisChart> = {
  title: "Components/Data Display/AxisChart",
  component: AxisChart,
  parameters: {
    docs: {
      description: {
        component:
          'Bar / line / area chart on Recharts for trends and comparisons over periods (sales by day, plan vs fact, revenue by channel). Import from `tajerp_ui/charts`. Colours default to the `--ui-chart-1…8` tokens (light and dark); `config.colors` or `series.color` override them. Values print through `useFormat()` (`valueFormat: "money"` → `1 234,50 с`). Screen readers get a `<figure>` with caption and a hidden data table. For shares of a whole use DonutChart.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof AxisChart>;

const data = [
  { period: "Янв", "2026": 42, "2025": 30 },
  { period: "Фев", "2026": 51, "2025": 38 },
  { period: "Мар", "2026": 47, "2025": 41 },
  { period: "Апр", "2026": 63, "2025": 44 },
  { period: "Май", "2026": 58, "2025": 49 },
];

const revenue = [
  { day: "2026-10-13", cash: 18400, card: 9200, alif: 4100, eskhata: 2100 },
  { day: "2026-10-14", cash: 16900, card: 11800, alif: 5200, eskhata: 2600 },
  { day: "2026-10-15", cash: 21300, card: 12400, alif: 6100, eskhata: 2400 },
  { day: "2026-10-16", cash: 19800, card: 13900, alif: 7300, eskhata: 3100 },
  { day: "2026-10-17", cash: 25600, card: 16200, alif: 8800, eskhata: 3900 },
  { day: "2026-10-18", cash: 31200, card: 19400, alif: 10100, eskhata: 4700 },
  { day: "2026-10-19", cash: 22700, card: 14100, alif: 7600, eskhata: 3300 },
];

const payments = [
  { name: "cash", label: "Наличные", type: "bar" as const, stack: "pay" },
  { name: "card", label: "Карта", type: "bar" as const, stack: "pay" },
  { name: "alif", label: "Alif Pay", type: "bar" as const, stack: "pay" },
  { name: "eskhata", label: "Eskhata", type: "bar" as const, stack: "pay" },
];

const wrap = { width: "min(640px, 100%)" } as const;

export const Playground: Story = {
  render: () => (
    <div style={wrap}>
      <AxisChart
        config={{
          data,
          title: "Сравнение продаж",
          xAxis: { key: "period", type: "category", title: "Месяц" },
          yAxis: { title: "тыс. с" },
          series: [
            { name: "2026", type: "bar" },
            { name: "2025", type: "bar" },
          ],
        }}
      />
    </div>
  ),
};

export const BarsAndLine: Story = {
  render: () => (
    <div style={wrap}>
      <AxisChart
        config={{
          data,
          title: "План vs факт",
          xAxis: { key: "period", type: "category" },
          series: [
            {
              name: "2025",
              label: "План",
              type: "bar",
              color: "var(--ui-chart-7)",
            },
            { name: "2026", label: "Факт", type: "line" },
          ],
        }}
      />
    </div>
  ),
};

export const Area: Story = {
  render: () => (
    <div style={wrap}>
      <AxisChart
        description="Выручка всех касс за последние 7 дней"
        config={{
          data: revenue.map((r) => ({
            day: r.day,
            total: r.cash + r.card + r.alif + r.eskhata,
          })),
          title: "Выручка за неделю",
          xAxis: {
            key: "day",
            format: { day: "numeric", month: "short" },
            title: "День",
          },
          valueFormat: "money",
          series: [{ name: "total", label: "Выручка", type: "area" }],
          legend: false,
        }}
      />
    </div>
  ),
};

export const StackedMoney: Story = {
  name: "Stacked bars, money format",
  render: () => (
    <div style={wrap}>
      <AxisChart
        config={{
          data: revenue,
          title: "Оплаты по способам",
          xAxis: {
            key: "day",
            format: { weekday: "short", day: "numeric" },
            title: "День",
          },
          valueFormat: "money",
          series: payments,
        }}
      />
    </div>
  ),
};

export const StackedArea: Story = {
  render: () => (
    <div style={wrap}>
      <AxisChart
        config={{
          data: revenue,
          title: "Структура выручки",
          xAxis: { key: "day", format: "date", title: "Дата" },
          valueFormat: "money",
          series: payments.map((p) => ({ ...p, type: "area" as const })),
        }}
      />
    </div>
  ),
};

export const PercentFormat: Story = {
  render: () => (
    <div style={wrap}>
      <AxisChart
        config={{
          data: [
            { period: "Июн", margin: 21.4 },
            { period: "Июл", margin: 23.1 },
            { period: "Авг", margin: 19.8 },
            { period: "Сен", margin: 24.6 },
            { period: "Окт", margin: 26.2 },
          ],
          title: "Валовая маржа",
          xAxis: { key: "period" },
          valueFormat: "percent",
          series: [{ name: "margin", label: "Маржа", type: "line" }],
          legend: false,
        }}
      />
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div style={wrap}>
      <AxisChart
        loading
        config={{
          data: [],
          title: "Продажи за неделю",
          xAxis: { key: "day" },
          series: payments,
        }}
      />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div style={wrap}>
      <AxisChart
        config={{
          data: [],
          title: "Продажи за неделю",
          xAxis: { key: "day" },
          series: payments,
        }}
      />
    </div>
  ),
};

export const Tajik: Story = {
  render: () => (
    <TajUIProvider locale="tg">
      <div style={wrap}>
        <AxisChart
          config={{
            data: revenue,
            title: "Пардохтҳо аз рӯи усул",
            xAxis: {
              key: "day",
              format: { day: "numeric", month: "short" },
              title: "Рӯз",
            },
            valueFormat: "money",
            series: [
              { name: "cash", label: "Нақд", stack: "p" },
              { name: "card", label: "Корт", stack: "p" },
              { name: "alif", label: "Alif Pay", stack: "p" },
              { name: "eskhata", label: "Eskhata", stack: "p" },
            ],
          }}
        />
      </div>
    </TajUIProvider>
  ),
};
