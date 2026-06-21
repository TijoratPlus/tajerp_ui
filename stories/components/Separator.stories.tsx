import type { Meta, StoryObj } from "@storybook/react";
import { Separator } from "../../src";

const meta: Meta<typeof Separator> = {
  title: "Components/Layout/Separator",
  component: Separator,
  parameters: {
    docs: {
      description: {
        component: "Visual divider between sections. Horizontal by default; set `orientation=\"vertical\"` for inline splits.",
      },
    },
  },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
  },
};
export default meta;

type Story = StoryObj<typeof Separator>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ width: 320 }}>
      <p style={{ margin: 0, color: "var(--ui-ink-2)" }}>Раздел выше</p>
      <Separator {...args} style={{ margin: "12px 0" }} />
      <p style={{ margin: 0, color: "var(--ui-ink-2)" }}>Раздел ниже</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 16, height: 32 }}>
      <span style={{ color: "var(--ui-ink-2)" }}>Смена</span>
      <Separator orientation="vertical" />
      <span style={{ color: "var(--ui-ink-2)" }}>Склад</span>
      <Separator orientation="vertical" />
      <span style={{ color: "var(--ui-ink-2)" }}>Отчёты</span>
    </div>
  ),
};
