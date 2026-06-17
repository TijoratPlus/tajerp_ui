import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarFallback, Separator, TajERPLogo } from "../src";

const meta: Meta = { title: "Foundations/Foundations" };
export default meta;

type Story = StoryObj;

const Swatch = ({ name, varName }: { name: string; varName: string }) => (
  <div style={{ display: "grid", gap: 6 }}>
    <div
      style={{
        height: 56,
        borderRadius: 12,
        background: `var(${varName})`,
        border: "1px solid var(--ui-hairline)",
      }}
    />
    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ui-ink-1)" }}>{name}</div>
    <code style={{ fontSize: 11, color: "var(--ui-ink-3)" }}>{varName}</code>
  </div>
);

export const Colors: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(4, 1fr)", maxWidth: 720 }}>
      <Swatch name="Brand" varName="--tj-green" />
      <Swatch name="Brand ink" varName="--tj-green-ink" />
      <Swatch name="Deep" varName="--tj-green-deep" />
      <Swatch name="Forest" varName="--tj-green-forest" />
      <Swatch name="Mist" varName="--tj-green-mist" />
      <Swatch name="Tint" varName="--tj-green-tint" />
      <Swatch name="Success" varName="--tj-success" />
      <Swatch name="Warning" varName="--tj-warning" />
      <Swatch name="Coral / error" varName="--tj-coral" />
      <Swatch name="Info" varName="--tj-info" />
      <Swatch name="Ink 1" varName="--tj-ink-1" />
      <Swatch name="Ink 3" varName="--tj-ink-3" />
    </div>
  ),
};

export const Logo: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      <TajERPLogo style={{ fontSize: 48 }} />
      <TajERPLogo style={{ fontSize: 80 }} />
    </div>
  ),
};

export const Typography: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 10, color: "var(--ui-ink-1)" }}>
      <div style={{ fontSize: "var(--tj-fs-4xl)", fontWeight: 700, letterSpacing: "-0.02em" }}>
        Tijorat+ POS
      </div>
      <div style={{ fontSize: "var(--tj-fs-2xl)", fontWeight: 700 }}>Заголовок раздела</div>
      <div style={{ fontSize: "var(--tj-fs-base)", color: "var(--ui-ink-2)" }}>
        Основной текст — Inter, 16px.
      </div>
      <div style={{ fontSize: "var(--tj-fs-sm)", color: "var(--ui-ink-3)" }}>
        Подпись / мета — 13px.
      </div>
    </div>
  ),
};

export const Avatars: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Avatar>
        <AvatarFallback>АН</AvatarFallback>
      </Avatar>
      <Separator orientation="vertical" style={{ height: 32 }} />
      <Avatar className="size-12">
        <AvatarFallback>ТП</AvatarFallback>
      </Avatar>
    </div>
  ),
};
