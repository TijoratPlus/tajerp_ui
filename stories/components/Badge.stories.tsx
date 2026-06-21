import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../../src";

const meta: Meta<typeof Badge> = {
  title: "Components/Data Display/Badge",
  component: Badge,
  parameters: {
    docs: {
      description: {
        component: "Compact status label with tone variants. Use for payment state, tags, and counts.",
      },
    },
  },
  args: { children: "Оплачено", tone: "success" },
  argTypes: {
    tone: {
      control: "select",
      options: ["brand", "neutral", "success", "warning", "error", "info", "solid"],
      table: { defaultValue: { summary: "brand" } },
    },
    size: {
      control: "inline-radio",
      options: ["md", "sm"],
      table: { defaultValue: { summary: "md" } },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Playground: Story = {};

export const Tones: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <Badge tone="brand">Бренд</Badge>
      <Badge tone="neutral">Neutral</Badge>
      <Badge tone="success">Оплачено</Badge>
      <Badge tone="warning">Ожидает</Badge>
      <Badge tone="error">Просрочено</Badge>
      <Badge tone="info">Инфо</Badge>
      <Badge tone="solid">Solid</Badge>
    </div>
  ),
};

export const SmallUppercase: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <Badge tone="error" size="sm">
        RX
      </Badge>
      <Badge tone="info" size="sm">
        NEW
      </Badge>
      <Badge tone="warning" size="sm">
        SALE
      </Badge>
    </div>
  ),
};
