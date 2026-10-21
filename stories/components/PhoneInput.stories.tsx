import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Label, PhoneInput, TajUIProvider } from "../../src";

const meta: Meta<typeof PhoneInput> = {
  title: "Components/POS/PhoneInput",
  component: PhoneInput,
  parameters: {
    docs: {
      description: {
        component:
          "Tajik phone number field for customers, suppliers and SMS to debtors. The `+992` prefix is fixed, digits are grouped as `93 123 45 67` while typing, pasted numbers in any form (`+992 93…`, `0931234567`) are normalised, and the value is E.164 (`+992931234567`). An incomplete number is marked invalid on blur.",
      },
    },
  },
  args: { size: "md", validateOnBlur: true, disabled: false },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
};
export default meta;

type Story = StoryObj<typeof PhoneInput>;

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = React.useState("+992931234567");
    return (
      <div style={{ maxWidth: 260, display: "grid", gap: 6 }}>
        <Label htmlFor="phone">Телефон клиента</Label>
        <PhoneInput {...args} id="phone" value={value} onValueChange={setValue} />
        <p style={{ color: "var(--ui-ink-3)", fontSize: 13 }}>E.164: {value || "—"}</p>
      </div>
    );
  },
};

export const Empty: Story = {
  name: "Пустое поле",
  render: () => (
    <div style={{ maxWidth: 260, display: "grid", gap: 6 }}>
      <Label htmlFor="phone-empty">Телефон поставщика</Label>
      <PhoneInput id="phone-empty" />
      <p style={{ color: "var(--ui-ink-3)", fontSize: 12.5 }}>
        Вставьте «+992 93 123 45 67» или «0931234567».
      </p>
    </div>
  ),
};

export const Tajik: Story = {
  name: "Тоҷикӣ",
  render: () => (
    <TajUIProvider locale="tg">
      <div style={{ maxWidth: 260, display: "grid", gap: 6 }}>
        <Label htmlFor="tg-phone">Рақами телефони харидор</Label>
        <PhoneInput id="tg-phone" size="lg" defaultValue="901112233" />
      </div>
    </TajUIProvider>
  ),
};
