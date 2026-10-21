import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Calendar, TajUIProvider, type DateRange } from "../../src";

const meta: Meta<typeof Calendar> = {
  title: "Components/Inputs/Calendar",
  component: Calendar,
  parameters: {
    docs: {
      description: {
        component:
          "Month grid for picking a day or a period, Monday first. Use it inline (delivery schedules, shift planning) or inside DatePicker / DateRangePicker. Keyboard: arrows move by day/week, Home/End jump to week start/end, PageUp/PageDown change month (Shift: year), Enter/Space select.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Calendar>;

const caption = { marginTop: 12, color: "var(--ui-ink-3)", fontSize: 13 } as const;
const fmt = (d?: Date) => (d ? d.toLocaleDateString("ru-RU") : "—");

export const Single: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    return (
      <div>
        <Calendar mode="single" selected={date} onSelect={setDate} />
        <p style={caption}>Дата отгрузки: {fmt(date)}</p>
      </div>
    );
  },
};

export const Range: Story = {
  render: () => {
    const today = new Date();
    const [range, setRange] = React.useState<DateRange>({
      from: new Date(today.getFullYear(), today.getMonth(), 1),
      to: today,
    });
    return (
      <div>
        <Calendar mode="range" numberOfMonths={2} selected={range} onSelect={setRange} />
        <p style={caption}>
          Период: {fmt(range.from)} – {fmt(range.to)}
        </p>
      </div>
    );
  },
};

export const MinMaxAndDisabled: Story = {
  name: "Min / max and closed days",
  render: () => {
    const today = new Date();
    return (
      <div>
        <Calendar
          mode="single"
          min={today}
          max={new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())}
          disabled={(d) => d.getDay() === 0}
        />
        <p style={caption}>Доставка: в течение месяца, кроме воскресений.</p>
      </div>
    );
  },
};

export const HiddenOutsideDays: Story = {
  render: () => <Calendar mode="single" showOutsideDays={false} />,
};

export const Tajik: Story = {
  name: "Тоҷикӣ",
  render: () => (
    <TajUIProvider locale="tg">
      <Calendar mode="range" numberOfMonths={2} />
      <p style={caption}>Давраи ҳисоботро интихоб кунед.</p>
    </TajUIProvider>
  ),
};

export const TouchDensity: Story = {
  render: () => (
    <div data-density="touch">
      <Calendar mode="single" />
    </div>
  ),
};
