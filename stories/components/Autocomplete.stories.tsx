import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Autocomplete, type SelectOption } from "../../src";

const cities: SelectOption[] = [
  { label: "Душанбе", value: "dushanbe" },
  { label: "Худжанд", value: "khujand" },
  { label: "Бохтар", value: "bokhtar" },
  { label: "Куляб", value: "kulob" },
  { label: "Истаравшан", value: "istaravshan" },
  { label: "Турсунзаде", value: "tursunzoda" },
  { label: "Канибадам", value: "konibodom", disabled: true },
];

const meta: Meta<typeof Autocomplete> = {
  title: "Components/Inputs/Autocomplete",
  component: Autocomplete,
  parameters: {
    docs: {
      description: {
        component: "Searchable select with keyboard navigation. Filter options as the user types.",
      },
    },
  },
  args: { placeholder: "Выберите город…", options: cities },
};
export default meta;

type Story = StoryObj<typeof Autocomplete>;

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = React.useState("");
    return (
      <div style={{ maxWidth: 320 }}>
        <Autocomplete {...args} value={value} onChange={setValue} />
        <p style={{ marginTop: 12, color: "var(--ui-ink-3)", fontSize: 13 }}>
          Выбрано: {value || "—"}
        </p>
      </div>
    );
  },
};

export const AllowCustomValue: Story = {
  render: (args) => (
    <div style={{ maxWidth: 320 }}>
      <Autocomplete {...args} allowCustomValue />
    </div>
  ),
};
