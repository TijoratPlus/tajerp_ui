import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { DatePicker, Label, TajUIProvider } from "../../src";

const meta: Meta<typeof DatePicker> = {
  title: "Components/Inputs/DatePicker",
  component: DatePicker,
  parameters: {
    docs: {
      description: {
        component:
          "Date field for documents and forms (invoice date, payment due date, hire date). Accountants can type `21.10.2026` (also `21/10/2026`, `21102026`, `2026-10-21`) — parsed on blur or Enter — or pick from the calendar. Invalid or out-of-range input sets `aria-invalid`. Alt+↓ opens the calendar.",
      },
    },
  },
  args: { size: "md", clearable: true, disabled: false },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
};
export default meta;

type Story = StoryObj<typeof DatePicker>;

const field = { display: "grid", gap: 6, maxWidth: 240 } as const;
const caption = { margin: 0, color: "var(--ui-ink-3)", fontSize: 13 } as const;

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<Date | undefined>(new Date());
    return (
      <div style={field}>
        <Label htmlFor="invoice-date">Дата накладной</Label>
        <DatePicker {...args} id="invoice-date" value={value} onValueChange={setValue} />
        <p style={caption}>Значение: {value ? value.toLocaleDateString("ru-RU") : "—"}</p>
      </div>
    );
  },
};

export const PaymentDue: Story = {
  name: "Срок оплаты (min = сегодня)",
  render: () => {
    const today = new Date();
    return (
      <div style={field}>
        <Label htmlFor="due">Срок оплаты</Label>
        <DatePicker
          id="due"
          min={today}
          isDateDisabled={(d) => d.getDay() === 0}
          clearable
        />
        <p style={caption}>Не раньше сегодняшнего дня, кроме воскресений.</p>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12, maxWidth: 240 }}>
      <DatePicker aria-label="Маленький" size="sm" defaultValue={new Date()} />
      <DatePicker aria-label="Средний" size="md" defaultValue={new Date()} />
      <DatePicker aria-label="Большой" size="lg" defaultValue={new Date()} />
      <DatePicker aria-label="Недоступно" disabled defaultValue={new Date()} />
    </div>
  ),
};

export const Tajik: Story = {
  name: "Тоҷикӣ",
  render: () => (
    <TajUIProvider locale="tg">
      <div style={field}>
        <Label htmlFor="hire-date">Санаи ба кор қабул шудан</Label>
        <DatePicker id="hire-date" clearable />
      </div>
    </TajUIProvider>
  ),
};
