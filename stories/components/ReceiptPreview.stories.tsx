import type { Meta, StoryObj } from "@storybook/react";
import { Printer } from "lucide-react";
import * as React from "react";
import { Button, ReceiptPreview, TajUIProvider, printReceipt } from "../../src";

const QR = (
  <svg viewBox="0 0 21 21" role="img" aria-label="QR-код фискального чека" shapeRendering="crispEdges">
    <rect width="21" height="21" fill="var(--tj-white)" />
    {[
      [0, 0], [14, 0], [0, 14],
    ].map(([x, y]) => (
      <g key={`${x}-${y}`} fill="var(--tj-ink)">
        <rect x={x} y={y} width="7" height="7" />
        <rect x={x + 1} y={y + 1} width="5" height="5" fill="var(--tj-white)" />
        <rect x={x + 2} y={y + 2} width="3" height="3" />
      </g>
    ))}
    {[9, 11, 13, 8, 10, 12, 16, 18].map((v, i) => (
      <rect key={i} x={v} y={(i * 5) % 13 + 8} width="1" height="1" fill="var(--tj-ink)" />
    ))}
  </svg>
);

const BARCODE = (
  <svg viewBox="0 0 60 14" width="60mm" height="12mm" role="img" aria-label="Штрихкод чека 000123">
    {Array.from({ length: 30 }, (_, i) => (
      <rect key={i} x={i * 2} y="0" width={i % 3 === 0 ? 1.4 : 0.7} height="14" fill="var(--tj-ink)" />
    ))}
  </svg>
);

const SAMPLE = {
  store: {
    name: "Сомон Маркет",
    address: "г. Душанбе, пр. Рудаки, 45",
    inn: "020012345",
    phone: "+992 44 600 00 00",
  },
  meta: {
    number: "000123",
    date: new Date(2026, 9, 21, 14, 5),
    cashier: "Фарида Рахимова",
    shift: "№ 12",
  },
  lines: [
    { name: "Кофе латте 350 мл", quantity: 2, price: 18 },
    { name: "Круассан с миндалём", quantity: 1, price: 14, discount: 1.4 },
    { name: "Яблоки «Голден»", quantity: 1.25, unit: "кг", price: 14.5 },
    { name: "Вода минеральная «Хоҷа Оби Гарм» 0,5 л", quantity: 3, price: 5 },
  ],
  totals: { tax: 9.39, taxRate: 12 },
  payments: [
    { label: "Карта", amount: 50 },
    { label: "Наличные", amount: 50 },
  ],
  change: 5.28,
};

const meta: Meta<typeof ReceiptPreview> = {
  title: "Components/POS/ReceiptPreview",
  component: ReceiptPreview,
  parameters: {
    docs: {
      description: {
        component:
          "Thermal receipt preview for 58 mm and 80 mm printers: store header with ИНН, receipt meta, lines, totals with VAT, payments and change, QR / barcode slots and a footer. Always black on white, even in dark theme. Call `printReceipt(ref.current)` to print only the receipt (everything else is hidden by a print-only rule).",
      },
    },
  },
  args: { ...SAMPLE, width: "80mm" },
  argTypes: { width: { control: "inline-radio", options: ["58mm", "80mm"] } },
};
export default meta;

type Story = StoryObj<typeof ReceiptPreview>;

export const Playground: Story = {};

export const Narrow58mm: Story = {
  args: { width: "58mm" },
};

export const WithCodesAndPrint: Story = {
  render: (args) => {
    const ref = React.useRef<HTMLElement>(null);
    return (
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <ReceiptPreview ref={ref} {...args} qr={QR} barcode={BARCODE} />
        <Button iconLeft={<Printer className="size-4" aria-hidden />} onClick={() => printReceipt(ref.current)}>
          Печать чека
        </Button>
      </div>
    );
  },
};

export const Tajik: Story = {
  render: (args) => (
    <TajUIProvider locale="tg">
      <ReceiptPreview
        {...args}
        store={{ ...SAMPLE.store, name: "Мағозаи «Сомон»", address: "ш. Душанбе, хиёбони Рӯдакӣ, 45" }}
        meta={{ ...SAMPLE.meta, cashier: "Фарида Раҳимова" }}
        payments={[{ label: "Нақд", amount: 100 }]}
      />
    </TajUIProvider>
  ),
};
