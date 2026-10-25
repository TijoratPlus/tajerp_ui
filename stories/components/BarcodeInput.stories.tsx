import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { BarcodeInput, Money, TajUIProvider, useBarcodeScanner } from "../../src";

const meta: Meta<typeof BarcodeInput> = {
  title: "Components/POS/BarcodeInput",
  component: BarcodeInput,
  parameters: {
    docs: {
      description: {
        component:
          "Field for keyboard-wedge barcode scanners and typed codes on the POS and in the warehouse. Enter submits the code via `onScan`, the field clears itself and a short “Отсканировано: …” line is announced. `refocus` keeps focus here between scans. For scans that should work anywhere on the page, use the `useBarcodeScanner` hook, which tells fast scanner bursts from normal typing.",
      },
    },
  },
  args: { size: "md", refocus: false, clearOnScan: true },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
};
export default meta;

type Story = StoryObj<typeof BarcodeInput>;

const CATALOG: Record<string, { name: string; price: number }> = {
  "4600000000000": { name: "Чай зелёный «Ҳисор», 100 г", price: 18 },
  "4870001234567": { name: "Нон тандырӣ", price: 4.5 },
  "4601234567890": { name: "Масло хлопковое, 1 л", price: 32 },
};

export const Playground: Story = {
  render: (args) => {
    const [log, setLog] = React.useState<string[]>([]);
    return (
      <div style={{ maxWidth: 380, display: "grid", gap: 8 }}>
        <BarcodeInput {...args} onScan={(c) => setLog((l) => [c, ...l].slice(0, 5))} />
        <ul style={{ fontSize: 13, color: "var(--ui-ink-3)" }}>
          {log.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </div>
    );
  },
};

export const PosCart: Story = {
  name: "Касса: сканирование в чек",
  render: () => {
    const [lines, setLines] = React.useState<{ code: string; qty: number }[]>([]);
    const add = (code: string) =>
      setLines((ls) => {
        const found = ls.find((l) => l.code === code);
        return found
          ? ls.map((l) => (l.code === code ? { ...l, qty: l.qty + 1 } : l))
          : [...ls, { code, qty: 1 }];
      });
    const total = lines.reduce((s, l) => s + (CATALOG[l.code]?.price ?? 0) * l.qty, 0);
    return (
      <div style={{ maxWidth: 420, display: "grid", gap: 10 }}>
        <BarcodeInput autoFocus refocus size="lg" onScan={add} />
        <p style={{ fontSize: 12.5, color: "var(--ui-ink-3)" }}>
          Попробуйте: 4600000000000, 4870001234567, 4601234567890
        </p>
        <ul style={{ display: "grid", gap: 6, fontSize: 13.5 }}>
          {lines.map((l) => (
            <li key={l.code} style={{ display: "flex", justifyContent: "space-between" }}>
              <span>
                {CATALOG[l.code]?.name ?? `Неизвестный товар ${l.code}`} × {l.qty}
              </span>
              <Money value={(CATALOG[l.code]?.price ?? 0) * l.qty} />
            </li>
          ))}
        </ul>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
          <span>Итого</span>
          <Money value={total} size="lg" />
        </div>
      </div>
    );
  },
};

export const GlobalScanner: Story = {
  name: "useBarcodeScanner (весь экран)",
  render: () => {
    const [last, setLast] = React.useState<string | null>(null);
    useBarcodeScanner({ onScan: setLast, preventDefault: true });
    return (
      <div style={{ maxWidth: 380, display: "grid", gap: 8, fontSize: 13.5 }}>
        <p>
          Отсканируйте товар в любом месте страницы — обычный ввод с клавиатуры не считается
          сканированием.
        </p>
        <input
          aria-label="Комментарий к заказу"
          placeholder="Комментарий к заказу"
          style={{ border: "1px solid var(--ui-hairline)", borderRadius: 8, padding: 8 }}
        />
        <p role="status">Последний код: {last ?? "—"}</p>
      </div>
    );
  },
};

export const Tajik: Story = {
  name: "Тоҷикӣ",
  render: () => (
    <TajUIProvider locale="tg">
      <div style={{ maxWidth: 380 }}>
        <BarcodeInput onScan={() => {}} />
      </div>
    </TajUIProvider>
  ),
};
