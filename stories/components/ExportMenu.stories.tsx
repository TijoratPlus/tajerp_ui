import type { Meta, StoryObj } from "@storybook/react";
import { ExportMenu, TajUIProvider, downloadFile, toCSV } from "../../src";

const meta: Meta<typeof ExportMenu> = {
  title: "Components/Business/ExportMenu",
  component: ExportMenu,
  parameters: {
    docs: {
      description: {
        component:
          '"Экспорт" button for reports and lists with PDF / Excel / CSV / e-mail options (`formats`). `onExport(format)` may return a Promise: the item shows a spinner until it settles. Pair CSV with `toCSV()` from `tajerp_ui` (semicolon + UTF-8 BOM, so Excel in ru/tg opens Cyrillic correctly).',
      },
    },
  },
  args: { onExport: () => new Promise((r) => setTimeout(r, 1500)) },
};
export default meta;

type Story = StoryObj<typeof ExportMenu>;

export const Default: Story = {};

const products = [
  { name: "Чой сабз «Ҳисор»", qty: 48, price: 18.5 },
  { name: 'Нон "Тандир"', qty: 120, price: 3 },
  { name: "Равғани пахта, 5 л", qty: 12, price: 96.75 },
];

/** CSV downloads a real file built with `toCSV` + `downloadFile`. */
export const CsvDownload: Story = {
  args: {
    formats: ["csv", "excel"],
    onExport: (format) => {
      if (format !== "csv") return new Promise((r) => setTimeout(r, 1000));
      const csv = toCSV(products, [
        { header: "Товар", value: (p) => p.name },
        { header: "Остаток", value: (p) => p.qty },
        { header: "Цена, с", value: (p) => p.price },
      ]);
      downloadFile(csv, "остатки.csv", "text/csv;charset=utf-8");
    },
  },
};

export const Tajik: Story = {
  render: (args) => (
    <TajUIProvider locale="tg">
      <ExportMenu {...args} />
    </TajUIProvider>
  ),
};
