import * as React from "react";

export function Swatch({ name, varName }: { name: string; varName: string }) {
  return (
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
}

export function TokenRow({
  name,
  value,
  sample,
}: {
  name: string;
  value: string;
  sample?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "140px 1fr auto",
        gap: 16,
        alignItems: "center",
        padding: "12px 0",
        borderBottom: "1px solid var(--ui-hairline)",
      }}
    >
      <code style={{ fontSize: 12, color: "var(--ui-ink-3)" }}>{name}</code>
      <span style={{ fontSize: 13, color: "var(--ui-ink-2)" }}>{value}</span>
      {sample ?? null}
    </div>
  );
}

export function ShadowSample({ name, varName }: { name: string; varName: string }) {
  return (
    <div style={{ display: "grid", gap: 8, justifyItems: "center" }}>
      <div
        style={{
          width: 120,
          height: 72,
          borderRadius: 12,
          background: "var(--ui-surface)",
          boxShadow: `var(${varName})`,
          border: "1px solid var(--ui-hairline)",
        }}
      />
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ui-ink-1)" }}>{name}</div>
      <code style={{ fontSize: 11, color: "var(--ui-ink-3)" }}>{varName}</code>
    </div>
  );
}
