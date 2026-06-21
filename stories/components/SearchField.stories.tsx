import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { SearchField } from "../../src";

const meta: Meta<typeof SearchField> = {
  title: "Components/Inputs/SearchField",
  component: SearchField,
  parameters: {
    docs: {
      description: {
        component: "Search input with icon, clear button, and optional loading state.",
      },
    },
  },
  args: { placeholder: "Поиск товаров…" },
  argTypes: { loading: { control: "boolean" }, disabled: { control: "boolean" } },
};
export default meta;

type Story = StoryObj<typeof SearchField>;

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = React.useState("");
    return (
      <div style={{ maxWidth: 360 }}>
        <SearchField {...args} value={value} onValueChange={setValue} />
        <p style={{ marginTop: 12, color: "var(--ui-ink-3)", fontSize: 13 }}>
          Запрос: {value || "—"}
        </p>
      </div>
    );
  },
};

export const Loading: Story = {
  args: { loading: true, defaultValue: "молоко" },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <SearchField {...args} />
    </div>
  ),
};
