import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Money, Numpad, TajUIProvider, parseNumber } from "../../src";

const meta: Meta<typeof Numpad> = {
  title: "Components/POS/Numpad",
  component: Numpad,
  parameters: {
    docs: {
      description: {
        component:
          "On-screen keypad for touch POS: cash received, quantities, weights. Large keys (56 px, 64 px with `data-density=\"touch\"`), optional `00`, decimal and OK keys, and quick amounts. The keypad is one tab stop; while it has focus the physical keyboard works too (digits, `,`/`.`, Backspace, Delete clears, Enter = OK). The value is a plain string with `.` decimals.",
      },
    },
  },
  args: { maxDecimals: 2, maxLength: 12, decimalKey: true, doubleZeroKey: true },
};
export default meta;

type Story = StoryObj<typeof Numpad>;

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = React.useState("");
    return (
      <div style={{ maxWidth: 340 }}>
        <Numpad {...args} value={value} onValueChange={setValue} displaySuffix="с" />
      </div>
    );
  },
};

function CashPayment({ total, title, changeLabel, shortLabel }: {
  total: number;
  title: string;
  changeLabel: string;
  shortLabel: string;
}) {
  const [received, setReceived] = React.useState("");
  const [done, setDone] = React.useState<string | null>(null);
  const amount = received ? parseNumber(received) : 0;
  const change = amount - total;
  return (
    <div style={{ maxWidth: 360, display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ color: "var(--ui-ink-3)", fontSize: 13 }}>{title}</span>
        <Money value={total} size="lg" />
      </div>
      <Numpad
        value={received}
        onValueChange={(v) => {
          setReceived(v);
          setDone(null);
        }}
        quickAmounts={[50, 100, 200, 500]}
        displaySuffix="с"
        onEnter={(v) => setDone(v)}
        enterDisabled={change < 0}
      />
      <div
        role="status"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}
      >
        <span style={{ fontSize: 15, fontWeight: 600 }}>
          {change >= 0 ? changeLabel : shortLabel}
        </span>
        <Money value={Math.abs(change)} size="xl" tone={change >= 0 ? "success" : "danger"} />
      </div>
      {done !== null ? (
        <p style={{ fontSize: 13, color: "var(--ui-ink-3)" }}>OK → {done}</p>
      ) : null}
    </div>
  );
}

export const CashReceived: Story = {
  name: "Получено от клиента",
  render: () => (
    <CashPayment
      total={187.5}
      title="Получено от клиента · к оплате"
      changeLabel="Сдача"
      shortLabel="Не хватает"
    />
  ),
};

export const TouchDensity: Story = {
  name: "Touch density (tablet)",
  render: () => (
    <div data-density="touch" style={{ maxWidth: 400 }}>
      <Numpad defaultValue="2.5" maxDecimals={3} displaySuffix="кг" doubleZeroKey={false} />
    </div>
  ),
};

export const Tajik: Story = {
  name: "Тоҷикӣ — аз харидор гирифта шуд",
  render: () => (
    <TajUIProvider locale="tg">
      <CashPayment
        total={64}
        title="Аз харидор гирифта шуд · барои пардохт"
        changeLabel="Бақия"
        shortLabel="Намерасад"
      />
    </TajUIProvider>
  ),
};
