import type { Meta, StoryObj } from "@storybook/react";
import { Receipt, Trash2 } from "lucide-react";
import * as React from "react";
import {
  Badge,
  Button,
  Card,
  NumberField,
  SearchField,
  SegmentedControl,
  Separator,
  StatusDot,
  TajERPLogo,
  Toaster,
  toast,
} from "../../src";

const meta: Meta = {
  title: "Examples/POS Terminal",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Point-of-sale checkout: searchable product grid, category filter, a live cart with NumberField quantity steppers, and a Pay button that fires a success Toast.",
      },
    },
  },
  tags: ["!autodocs"],
};
export default meta;

type Story = StoryObj;

interface Product {
  id: string;
  name: string;
  cat: "drinks" | "bakery" | "dairy";
  price: number;
}

const PRODUCTS: Product[] = [
  { id: "p1", name: "Кофе латте", cat: "drinks", price: 18 },
  { id: "p2", name: "Сок апельсин", cat: "drinks", price: 12 },
  { id: "p3", name: "Вода 0.5л", cat: "drinks", price: 5 },
  { id: "p4", name: "Чай зелёный", cat: "drinks", price: 9 },
  { id: "p5", name: "Круассан", cat: "bakery", price: 14 },
  { id: "p6", name: "Самбуса", cat: "bakery", price: 7 },
  { id: "p7", name: "Багет", cat: "bakery", price: 11 },
  { id: "p8", name: "Кекс шоколад", cat: "bakery", price: 16 },
  { id: "p9", name: "Молоко 1л", cat: "dairy", price: 13 },
  { id: "p10", name: "Йогурт", cat: "dairy", price: 8 },
  { id: "p11", name: "Сыр сулугуни", cat: "dairy", price: 42 },
  { id: "p12", name: "Сметана", cat: "dairy", price: 15 },
];

const CATS = [
  { value: "all", label: "Все" },
  { value: "drinks", label: "Напитки" },
  { value: "bakery", label: "Выпечка" },
  { value: "dairy", label: "Молочное" },
];

const money = (n: number) => `${n.toLocaleString("ru-RU")} c.`;

export const Default: Story = {
  render: () => {
    const [cat, setCat] = React.useState("all");
    const [query, setQuery] = React.useState("");
    const [cart, setCart] = React.useState<Record<string, number>>({
      p1: 2,
      p5: 1,
    });

    const visible = PRODUCTS.filter(
      (p) =>
        (cat === "all" || p.cat === cat) &&
        p.name.toLowerCase().includes(query.trim().toLowerCase()),
    );

    const add = (id: string) =>
      setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
    const setQty = (id: string, qty: number) =>
      setCart((c) => {
        if (qty <= 0) {
          const { [id]: _, ...rest } = c;
          return rest;
        }
        return { ...c, [id]: qty };
      });

    const lines = Object.entries(cart)
      .map(([id, qty]) => ({ product: PRODUCTS.find((p) => p.id === id)!, qty }))
      .filter((l) => l.product);

    const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + tax;
    const count = lines.reduce((s, l) => s + l.qty, 0);

    const pay = () => {
      if (!count) return;
      toast.success("Оплата принята", {
        description: `${count} поз. · ${money(total)} · чек отправлен`,
      });
      setCart({});
    };

    return (
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        {/* Catalog */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="flex items-center gap-3 border-b border-hairline bg-ui-surface px-6 py-4">
            <TajERPLogo variant="icon" className="text-[36px]" />
            <div>
              <div className="text-[15px] font-bold text-ink-1">Касса 2</div>
              <div className="flex items-center gap-1.5 text-[12px] text-ink-3">
                <StatusDot tone="success" pulse /> Смена открыта · 09:00
              </div>
            </div>
            <div className="ml-auto w-72">
              <SearchField
                placeholder="Поиск товара…"
                value={query}
                onValueChange={setQuery}
              />
            </div>
          </header>

          <div className="border-b border-hairline px-6 py-3">
            <SegmentedControl value={cat} onChange={setCat} options={CATS} />
          </div>

          <div className="grid flex-1 grid-cols-2 content-start gap-3 overflow-y-auto p-6 sm:grid-cols-3 xl:grid-cols-4">
            {visible.map((p) => (
              <Card
                key={p.id}
                variant="interactive"
                onClick={() => add(p.id)}
                className="cursor-pointer select-none"
              >
                <div className="flex h-full flex-col p-4">
                  <div className="mb-3 grid h-16 place-items-center rounded-lg bg-mist text-[22px]">
                    🛒
                  </div>
                  <div className="text-[13.5px] font-semibold leading-tight text-ink-1">
                    {p.name}
                  </div>
                  <div className="mt-auto pt-2 text-[14px] font-bold text-brand-ink">
                    {money(p.price)}
                  </div>
                </div>
              </Card>
            ))}
            {visible.length === 0 ? (
              <p className="col-span-full py-10 text-center text-[13px] text-ink-3">
                Ничего не найдено
              </p>
            ) : null}
          </div>
        </div>

        {/* Cart */}
        <aside className="flex w-[380px] shrink-0 flex-col border-l border-hairline bg-ui-surface">
          <div className="flex items-center gap-2 border-b border-hairline px-5 py-4">
            <Receipt className="size-[18px] text-ink-2" />
            <h2 className="text-[15px] font-bold text-ink-1">Текущий чек</h2>
            {count ? <Badge tone="brand" className="ml-auto">{count} поз.</Badge> : null}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-3">
            {lines.length === 0 ? (
              <div className="grid h-full place-items-center text-center text-[13px] text-ink-3">
                Корзина пуста.<br />Нажмите на товар, чтобы добавить.
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {lines.map((l) => (
                  <li key={l.product.id} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13.5px] font-semibold text-ink-1">
                        {l.product.name}
                      </div>
                      <div className="text-[12px] text-ink-3">
                        {money(l.product.price)} × {l.qty} ={" "}
                        <b className="text-ink-2">{money(l.product.price * l.qty)}</b>
                      </div>
                    </div>
                    <div className="w-[116px] shrink-0">
                      <NumberField
                        value={l.qty}
                        min={0}
                        onValueChange={(q) => setQty(l.product.id, q)}
                      />
                    </div>
                    <button
                      aria-label="Удалить"
                      onClick={() => setQty(l.product.id, 0)}
                      className="grid size-8 shrink-0 place-items-center rounded-md text-ink-3 transition-colors hover:bg-tj-error/10 hover:text-tj-error"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-hairline px-5 py-4">
            <dl className="flex flex-col gap-1.5 text-[13.5px]">
              <div className="flex justify-between text-ink-2">
                <dt>Подытог</dt>
                <dd>{money(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-ink-2">
                <dt>Налог 5%</dt>
                <dd>{money(tax)}</dd>
              </div>
            </dl>
            <Separator className="my-3" />
            <div className="flex items-baseline justify-between">
              <span className="text-[14px] font-semibold text-ink-2">Итого</span>
              <span className="text-[24px] font-bold text-ink-1">{money(total)}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={!count}
                onClick={() => setCart({})}
              >
                Очистить
              </Button>
              <Button size="lg" className="flex-2" disabled={!count} onClick={pay}>
                Оплатить {count ? money(total) : ""}
              </Button>
            </div>
          </div>
        </aside>

        <Toaster />
      </div>
    );
  },
};
