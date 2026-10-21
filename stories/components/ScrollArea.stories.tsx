import type { Meta, StoryObj } from "@storybook/react";
import { ScrollArea, Separator } from "../../src";

const meta: Meta<typeof ScrollArea> = {
  title: "Components/Layout/ScrollArea",
  component: ScrollArea,
  parameters: {
    docs: {
      description: {
        component:
          "Scrollable region with thin themed scrollbars that keep native touch, wheel and keyboard scrolling. Use for the POS cart, chat history or long lists inside panels; give it a height. The viewport is focusable so keyboard users can scroll it — label it via `viewportProps` when it holds no focusable content. Built on Radix ScrollArea.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof ScrollArea>;

const products = Array.from({ length: 30 }, (_, i) => ({
  name: ["Нон", "Шир 1 л", "Чой кабуд", "Шакар 1 кг", "Равғани пахта", "Биринҷ 1 кг"][i % 6],
  sku: `SKU-${1000 + i}`,
}));

export const CartLines: Story = {
  render: () => (
    <ScrollArea
      className="h-72 w-64 !rounded-lg border border-hairline"
      viewportProps={{ "aria-label": "Товары в чеке" }}
    >
      <div className="p-3">
        <p className="mb-2 text-ui-label font-bold text-ink-1">Товары в чеке</p>
        {products.map((p, i) => (
          <div key={p.sku}>
            {i > 0 ? <Separator className="my-2" /> : null}
            <div className="flex justify-between text-ui-body text-ink-2">
              <span>{p.name}</span>
              <span className="text-ink-3">{p.sku}</span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <ScrollArea
      orientation="horizontal"
      className="w-80 !rounded-lg border border-hairline"
      viewportProps={{ "aria-label": "Категории" }}
    >
      <div className="flex w-max gap-2 p-3">
        {["Напитки", "Выпечка", "Молочные", "Бакалея", "Фрукты", "Сладости", "Бытовая химия", "Табак"].map(
          (c) => (
            <span
              key={c}
              className="!rounded-pill border border-hairline bg-ui-surface-2 px-3 py-1.5 text-ui-label text-ink-2"
            >
              {c}
            </span>
          ),
        )}
      </div>
    </ScrollArea>
  ),
};
