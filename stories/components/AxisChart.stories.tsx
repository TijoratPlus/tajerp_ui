import type { Meta, StoryObj } from "@storybook/react";
import { AxisChart } from "../../src/charts";

const meta: Meta<typeof AxisChart> = {
  title: "Components/Data Display/AxisChart",
  component: AxisChart,
  parameters: {
    docs: {
      description: {
        component:
          "Bar/line chart wrapper around Recharts. Import from `tajerp_ui/charts`. Configure series, axes, and colours via the `config` prop.",
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

export const Playground: Story = {
  render: () => (
    <div style={{ width: 640 }}>
      <AxisChart
        config={{
          data,
          title: "Сравнение продаж",
          xAxis: { key: "period", type: "category" },
          yAxis: { title: "тыс. c." },
          colors: ["#1D9F6E", "#6B7280"],
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
    <div style={{ width: 640 }}>
      <AxisChart
        config={{
          data,
          title: "План vs факт",
          xAxis: { key: "period", type: "category" },
          colors: ["#94A3B8", "#1D9F6E"],
          series: [
            { name: "2025", type: "bar" },
            { name: "2026", type: "line" },
          ],
        }}
      />
    </div>
  ),
};
