import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Switch } from "../../src";

const meta: Meta<typeof Switch> = {
  title: "Components/Inputs/Switch",
  component: Switch,
  parameters: {
    docs: {
      description: {
        component: "Toggle control for boolean settings. Controlled via `checked`/`onCheckedChange`.",
      },
    },
  },
  argTypes: {
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof Switch>;

export const Playground: Story = {
  render: (args) => {
    const [on, setOn] = React.useState(args.checked ?? true);
    return (
      <div style={{ display: "inline-flex", gap: 10, alignItems: "center" }}>
        <Switch {...args} checked={on} onCheckedChange={setOn} />
        <span style={{ color: "var(--ui-ink-2)" }}>Тёмная тема</span>
      </div>
    );
  },
  args: { checked: true },
};

export const States: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      <label style={{ display: "inline-flex", gap: 8, alignItems: "center", color: "var(--ui-ink-2)" }}>
        <Switch defaultChecked={false} /> Выкл
      </label>
      <label style={{ display: "inline-flex", gap: 8, alignItems: "center", color: "var(--ui-ink-2)" }}>
        <Switch defaultChecked /> Вкл
      </label>
      <label style={{ display: "inline-flex", gap: 8, alignItems: "center", color: "var(--ui-ink-4)" }}>
        <Switch disabled /> Отключено
      </label>
    </div>
  ),
};
