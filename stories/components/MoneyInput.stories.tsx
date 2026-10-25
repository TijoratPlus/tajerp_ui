import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Label, Money, MoneyInput, TajUIProvider } from "../../src";

const meta: Meta<typeof MoneyInput> = {
  title: "Components/POS/MoneyInput",
  component: MoneyInput,
  parameters: {
    docs: {
      description: {
        component:
          "Amount field with the currency sign as a suffix. Use it for prices, payments, expenses and discounts. Accepts `,` or `.` decimals, shows the grouped amount (`1 234,50`) when not focused and clamps to `min` / `max` on blur. Opens the decimal keypad on phones.",
      },
    },
  },
  args: { size: "md", fractionDigits: 2, allowNegative: false, disabled: false },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
};
export default meta;

type Story = StoryObj<typeof MoneyInput>;

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<number | undefined>(1234.5);
    return (
      <div style={{ maxWidth: 240, display: "grid", gap: 6 }}>
        <Label htmlFor="price">Цена продажи</Label>
        <MoneyInput {...args} id="price" value={value ?? null} onValueChange={setValue} />
        <p style={{ color: "var(--ui-ink-3)", fontSize: 13 }}>
          Значение: {value === undefined ? "—" : value}
        </p>
      </div>
    );
  },
};

export const Bounds: Story = {
  name: "Скидка (0–500 с)",
  render: () => (
    <div style={{ maxWidth: 240, display: "grid", gap: 6 }}>
      <Label htmlFor="discount">Скидка</Label>
      <MoneyInput id="discount" min={0} max={500} defaultValue={50} />
    </div>
  ),
};

export const Refund: Story = {
  name: "Корректировка (с минусом)",
  render: () => (
    <div style={{ maxWidth: 240, display: "grid", gap: 6 }}>
      <Label htmlFor="adj">Корректировка кассы</Label>
      <MoneyInput id="adj" allowNegative defaultValue={-120} />
    </div>
  ),
};

export const Tajik: Story = {
  name: "Тоҷикӣ",
  render: () => {
    const [v, setV] = React.useState<number | undefined>(350);
    return (
      <TajUIProvider locale="tg">
        <div style={{ maxWidth: 260, display: "grid", gap: 6 }}>
          <Label htmlFor="tg-sum">Маблағи пардохт</Label>
          <MoneyInput id="tg-sum" size="lg" value={v ?? null} onValueChange={setV} />
          <p style={{ fontSize: 13 }}>
            Ҳамагӣ: <Money value={v ?? 0} />
          </p>
        </div>
      </TajUIProvider>
    );
  },
};
