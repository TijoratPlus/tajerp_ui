import type { Meta, StoryObj } from "@storybook/react";
import { Badge, Pill, StatusDot } from "../src";

const meta: Meta = {
  title: "Primitives/Badge & Pill",
};
export default meta;

type Story = StoryObj;

export const Badges: Story = {
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

export const Pills: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <Pill>Tijorat+</Pill>
      <div className="dark" style={{ background: "var(--ui-rail-bg)", padding: 16, borderRadius: 12 }}>
        <Pill dark>На тёмном</Pill>
      </div>
    </div>
  ),
};

export const StatusDots: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
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
