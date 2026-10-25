import type { Meta, StoryObj } from "@storybook/react";
import { Percent, ShoppingCart, Users, Wallet } from "lucide-react";
import { Delta, Sparkline, StatCard, TajUIProvider } from "../../src";

const meta: Meta<typeof StatCard> = {
  title: "Components/Data Display/StatCard",
  component: StatCard,
  parameters: {
    docs: {
      description: {
        component:
          "KPI tile for dashboards. Pass a formatted `value` or a raw `amount` with `format` (money / number / percent, via the provider's locale). `delta` renders a `Delta` (arrow + sign + colour; `invertDelta` for costs where a fall is good) and `sparkline` a pure-SVG `Sparkline`. `href` / `onClick` make the whole card interactive; `loading` shows a skeleton.",
      },
    },
  },
  args: {
    label: "Выручка",
    amount: 284_350.5,
    delta: 12.4,
    sparkline: [180, 210, 195, 240, 232, 268, 284],
  },
};
export default meta;

type Story = StoryObj<typeof StatCard>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ maxWidth: 300 }}>
      <StatCard {...args} />
    </div>
  ),
};

const grid = "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4";

export const DashboardRow: Story = {
  render: () => (
    <div className={grid}>
      <StatCard
        label="Выручка"
        amount={284_350.5}
        delta={12.4}
        icon={<Wallet />}
        sparkline={[180, 210, 195, 240, 232, 268, 284]}
        href="#revenue"
      />
      <StatCard
        label="Заказы"
        amount={1_284}
        format="number"
        delta={-3.2}
        icon={<ShoppingCart />}
        sparkline={[140, 132, 150, 128, 126, 131, 124]}
        href="#orders"
      />
      <StatCard
        label="Маржа"
        amount={31.8}
        format="percent"
        delta={0}
        icon={<Percent />}
        sparkline={[31, 32, 31.5, 31.9, 31.7, 31.8, 31.8]}
      />
      <StatCard
        label="Клиенты"
        amount={312}
        format="number"
        delta={8}
        deltaLabel="за неделю"
        icon={<Users />}
        sparkline={[280, 284, 290, 296, 301, 305, 312]}
      />
    </div>
  ),
};

export const Expenses: Story = {
  name: "Inverted delta (expenses)",
  render: () => (
    <div className={grid}>
      <StatCard
        label="Расходы"
        amount={96_420}
        delta={-6.5}
        invertDelta
        sparkline={[110, 104, 101, 99, 98, 97, 96]}
      />
      <StatCard
        label="Возвраты"
        amount={2_140}
        delta={14}
        invertDelta
        sparkline={[1.2, 1.5, 1.4, 1.8, 2.0, 2.1, 2.14]}
      />
      <StatCard
        label="Выручка (компактно)"
        amount={1_284_350}
        compact
        delta={4.1}
      />
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className={grid}>
      {["Выручка", "Заказы", "Маржа", "Клиенты"].map((l) => (
        <StatCard key={l} label={l} loading />
      ))}
    </div>
  ),
};

export const Tajik: Story = {
  render: () => (
    <TajUIProvider locale="tg">
      <div className={grid}>
        <StatCard
          label="Даромад"
          amount={284_350.5}
          delta={12.4}
          icon={<Wallet />}
          sparkline={[180, 210, 195, 240, 232, 268, 284]}
        />
        <StatCard
          label="Фармоишҳо"
          amount={1_284}
          format="number"
          delta={-3.2}
          icon={<ShoppingCart />}
          sparkline={[140, 132, 150, 128, 126, 131, 124]}
        />
        <StatCard
          label="Фоида"
          amount={31.8}
          format="percent"
          delta={0}
          icon={<Percent />}
        />
        <StatCard
          label="Мизоҷон"
          amount={312}
          format="number"
          delta={8}
          icon={<Users />}
        />
      </div>
    </TajUIProvider>
  ),
};

export const DeltaAndSparkline: Story = {
  render: () => (
    <div className="flex flex-col gap-4" style={{ maxWidth: 320 }}>
      <div className="flex flex-wrap gap-2">
        <Delta value={12.5} />
        <Delta value={-4.2} />
        <Delta value={0} />
        <Delta value={-8} invert />
        <Delta value={3.1} variant="plain" />
      </div>
      <Sparkline data={[12, 18, 14, 22, 19, 27, 31]} tone="success" summarize />
      <Sparkline
        data={[30, 26, 27, 21, 18, 16, 12]}
        tone="danger"
        variant="line"
      />
      <Sparkline data={[5, 6, 5, 7, 6, 8, 7]} tone="info" height={48} />
    </div>
  ),
};
