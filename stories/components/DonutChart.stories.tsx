import type { Meta, StoryObj } from "@storybook/react";
import { TajUIProvider } from "../../src";
import { DonutChart } from "../../src/charts";

const meta: Meta<typeof DonutChart> = {
  title: "Components/Data Display/DonutChart",
  component: DonutChart,
  parameters: {
    docs: {
      description: {
        component:
          "Donut chart for shares of a whole: sales by payment method, revenue by category, stock value by warehouse. Import from `tajerp_ui/charts`. Keep it to 2–8 slices (one per `--ui-chart-*` token); for trends over time use AxisChart. The legend is an HTML list with values and percentages, the centre can show a total, and screen readers get a data table.",
      },
    },
  },
  args: {
    title: "Продажи по способам оплаты",
    centerLabel: "Выручка",
    centerValue: "total",
    valueFormat: "money",
    data: [
      { name: "Наличные", value: 48250 },
      { name: "Карта", value: 31900.5 },
      { name: "Alif Pay", value: 17420 },
      { name: "Eskhata", value: 6380 },
    ],
  },
};
export default meta;

type Story = StoryObj<typeof DonutChart>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ width: "min(560px, 100%)" }}>
      <DonutChart {...args} />
    </div>
  ),
};

export const ByCategory: Story = {
  args: {
    title: "Выручка по категориям",
    centerLabel: "за октябрь",
    data: [
      { name: "Напитки", value: 126400 },
      { name: "Молочное", value: 98200 },
      { name: "Бакалея", value: 87500 },
      { name: "Выпечка", value: 54300 },
      { name: "Заморозка", value: 31800 },
      { name: "Бытовая химия", value: 22600 },
      { name: "Прочее", value: 9400 },
    ],
  },
  render: Playground.render,
};

export const LegendBottom: Story = {
  args: { legendPosition: "bottom", size: 180 },
  render: (args) => (
    <div style={{ width: 280 }}>
      <DonutChart {...args} />
    </div>
  ),
};

export const PercentValues: Story = {
  args: {
    title: "Доля возвратов по причинам",
    valueFormat: "percent",
    centerValue: undefined,
    centerLabel: undefined,
    data: [
      { name: "Брак", value: 42 },
      { name: "Не подошёл размер", value: 35 },
      { name: "Передумал", value: 23 },
    ],
  },
  render: Playground.render,
};

export const Loading: Story = {
  args: { loading: true },
  render: Playground.render,
};

export const Empty: Story = {
  args: { data: [] },
  render: Playground.render,
};

export const Tajik: Story = {
  render: () => (
    <TajUIProvider locale="tg">
      <div style={{ width: "min(560px, 100%)" }}>
        <DonutChart
          title="Фурӯш аз рӯи усули пардохт"
          centerLabel="Даромад"
          centerValue="total"
          valueFormat="money"
          data={[
            { name: "Нақд", value: 48250 },
            { name: "Корти бонкӣ", value: 31900.5 },
            { name: "Alif Pay", value: 17420 },
            { name: "Eskhata", value: 6380 },
          ]}
        />
      </div>
    </TajUIProvider>
  ),
};
