import type { Meta, StoryObj } from "@storybook/react";
import { StatusDot } from "../../src";

const meta: Meta<typeof StatusDot> = {
  title: "Components/Data Display/StatusDot",
  component: StatusDot,
  parameters: {
    docs: {
      description: {
        component: "Small coloured dot for inline status indicators. Supports optional pulse animation.",
      },
    },
  },
  args: { tone: "success" },
  argTypes: {
    tone: {
      control: "select",
      options: ["success", "warning", "error", "brand", "neutral"],
      table: { defaultValue: { summary: "neutral" } },
    },
    pulse: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof StatusDot>;

export const Playground: Story = {
  render: (args) => (
    <span style={{ display: "inline-flex", gap: 6, alignItems: "center", color: "var(--ui-ink-2)" }}>
      <StatusDot {...args} /> В наличии
    </span>
  ),
};

export const Tones: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
      <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
        <StatusDot tone="success" /> В наличии
      </span>
      <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
        <StatusDot tone="warning" /> Мало
      </span>
      <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
        <StatusDot tone="error" /> Нет
      </span>
      <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
        <StatusDot tone="success" pulse /> Смена открыта
      </span>
    </div>
  ),
};
