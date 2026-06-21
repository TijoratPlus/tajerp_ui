import type { Meta, StoryObj } from "@storybook/react";
import { Input, Label } from "../../src";

const meta: Meta<typeof Input> = {
  title: "Components/Inputs/Input",
  component: Input,
  parameters: {
    docs: {
      description: {
        component:
          "Single-line text field. A thin wrapper over the native `<input>` carrying the design-system styling, so every native attribute (`type`, `placeholder`, `disabled`, …) works as expected.",
      },
    },
  },
  args: { placeholder: "Введите имя" },
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "tel", "search"],
    },
    disabled: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Playground: Story = {};

export const WithLabel: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 6, maxWidth: 320 }}>
      <Label htmlFor="name">Имя клиента</Label>
      <Input id="name" placeholder="Введите имя" />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12, maxWidth: 320 }}>
      <Input placeholder="Обычное поле" />
      <Input defaultValue="С текстом" />
      <Input placeholder="Отключено" disabled />
    </div>
  ),
};
