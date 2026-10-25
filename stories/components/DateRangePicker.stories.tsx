import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import {
  Card,
  DateRangePicker,
  TajUIProvider,
  addDays,
  useDateRangePresets,
  type DateRange,
  type DateRangePreset,
} from "../../src";

const meta: Meta<typeof DateRangePicker> = {
  title: "Components/Inputs/DateRangePicker",
  component: DateRangePicker,
  parameters: {
    docs: {
      description: {
        component:
          "Period filter for reports and dashboards (sales, cash flow, stock movement). Quick presets — today, last 7/30 days, this/last month, quarter, year — plus a range calendar (two months from 640px, one below). The value changes only on Apply.",
      },
    },
  },
  args: { size: "md", disabled: false },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
};
export default meta;

type Story = StoryObj<typeof DateRangePicker>;

const caption = { margin: 0, color: "var(--ui-ink-3)", fontSize: 13 } as const;
const fmt = (d?: Date) => (d ? d.toLocaleDateString("ru-RU") : "—");

export const SalesReport: Story = {
  name: "Отчёт о продажах",
  render: (args) => {
    const today = new Date();
    const [period, setPeriod] = React.useState<DateRange>({
      from: new Date(today.getFullYear(), today.getMonth(), 1),
      to: today,
    });
    return (
      <Card style={{ maxWidth: 520, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, marginRight: "auto" }}>
            Отчёт о продажах
          </h3>
          <div style={{ width: 240 }}>
            <DateRangePicker
              {...args}
             
              value={period}
              onValueChange={setPeriod}
              max={today}
            />
          </div>
        </div>
        <p style={{ ...caption, marginTop: 12 }}>
          Выручка за период {fmt(period.from)} – {fmt(period.to)}: 48 230,50 с
        </p>
      </Card>
    );
  },
};

export const CustomPresets: Story = {
  render: () => {
    const defaults = useDateRangePresets();
    const presets: DateRangePreset[] = [
      ...defaults.slice(0, 3),
      {
        id: "last14Days",
        label: "Последние 14 дней",
        range: (today) => ({ from: addDays(today, -13), to: today }),
      },
    ];
    return (
      <div style={{ width: 260 }}>
        <DateRangePicker presets={presets} />
      </div>
    );
  },
};

export const WithoutPresets: Story = {
  render: () => (
    <div style={{ width: 260 }}>
      <DateRangePicker presets={[]} placeholder="Период поставки" />
    </div>
  ),
};

export const Tajik: Story = {
  name: "Тоҷикӣ — ҳисоботи фурӯш",
  render: () => {
    const [period, setPeriod] = React.useState<DateRange>({});
    return (
      <TajUIProvider locale="tg">
        <div style={{ display: "grid", gap: 8, width: 260 }}>
          <DateRangePicker value={period} onValueChange={setPeriod} />
          <p style={caption}>Ҳисоботи фурӯш барои давраи интихобшуда.</p>
        </div>
      </TajUIProvider>
    );
  },
};
