import type { Meta, StoryObj } from "@storybook/react";
import { Label, Select } from "../../src";

const meta: Meta<typeof Select> = {
  title: "Components/Inputs/Select",
  component: Select,
  parameters: {
    docs: {
      description: {
        component:
          "Styled native `<select>`. Pass an `options` array (strings or `{ label, value }`) or render `<option>` children directly.",
      },
    },
  },
  args: {
    placeholder: "Выберите…",
    options: ["Напитки", "Выпечка", "Молочное", "Бакалея"],
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "subtle"] },
    disabled: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof Select>;

export const Playground: Story = {};

export const WithLabel: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 6, maxWidth: 320 }}>
      <Label htmlFor="cat">Категория</Label>
      <Select id="cat" placeholder="Выберите…" defaultValue="">
        <option value="" disabled>
          Выберите…
        </option>
        <option>Напитки</option>
        <option>Выпечка</option>
      </Select>
    </div>
  ),
};

export const FromOptions: Story = {
  args: {
    options: [
      { label: "Оплачено", value: "paid" },
      { label: "Ожидает", value: "pending" },
      { label: "Просрочено", value: "overdue", disabled: true },
    ],
  },
};
