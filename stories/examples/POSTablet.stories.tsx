import type { Meta, StoryObj } from "@storybook/react";
import { Printer, Receipt, ShoppingCart, Trash2, WifiOff } from "lucide-react";
import * as React from "react";
import {
  TajUIProvider,
  Badge,
  Banner,
  BarcodeInput,
  Button,
  CartLine,
  CartSummary,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Numpad,
  PaymentSplit,
  ProductTile,
  ReceiptPreview,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SyncStatus,
  TajERPLogo,
  Toaster,
  ToggleGroup,
  ToggleGroupItem,
  computePaymentTotals,
  paymentSplitMessages,
  printReceipt,
  toast,
  useFormat,
  useMessages,
  type PaymentEntry,
  type PaymentSplitResult,
  type ReceiptLine,
  type ReceiptPayment,
} from "../../src";

const meta: Meta = {
  title: "Examples/POS Tablet",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Touch-first checkout for a tablet with a barcode scanner, working offline: `<TajUIProvider density=\"touch\">` on the root (it also reaches the payment Sheet and receipt Dialog, which portal outside the page), a sticky offline Banner with 3 queued sales, BarcodeInput that keeps focus between scans, category ToggleGroup, ProductTile grid, CartLine rows with CartSummary, a payment Sheet with PaymentSplit + Numpad, and an 80 mm ReceiptPreview that can be printed.",
      },
    },
  },
  tags: ["!autodocs"],
  // Touch density for the page *and* its portaled Sheet / Dialog.
  decorators: [
    (Story) => (
      <TajUIProvider density="touch">
        <Story />
      </TajUIProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj;

// ── Sample data ─────────────────────────────────────────────────────

type Category = "drinks" | "bakery" | "dairy" | "grocery" | "fruit";

interface Product {
  id: string;
  name: string;
  barcode: string;
  cat: Category;
  price: number;
  stock: number;
  unit?: string;
  step?: number;
}

const PRODUCTS: Product[] = [
  { id: "p1", name: "Чай зелёный «Ҳисор», 100 г", barcode: "4600000000000", cat: "drinks", price: 18, stock: 40 },
  { id: "p2", name: "Вода «Сиёма» 0,5 л", barcode: "4870000120011", cat: "drinks", price: 4, stock: 120 },
  { id: "p3", name: "Кока-Кола 1 л", barcode: "5449000054227", cat: "drinks", price: 12, stock: 36 },
  { id: "p4", name: "Сок «Ширин» яблочный 1 л", barcode: "4870000120028", cat: "drinks", price: 15, stock: 4 },
  { id: "p5", name: "Нон тандырный", barcode: "4870001234567", cat: "bakery", price: 4.5, stock: 60 },
  { id: "p6", name: "Самбуса с мясом", barcode: "4870001234574", cat: "bakery", price: 7, stock: 18 },
  { id: "p7", name: "Круассан с миндалём", barcode: "4870001234581", cat: "bakery", price: 14, stock: 0 },
  { id: "p8", name: "Молоко «Ширин» 3,2% 1 л", barcode: "4870002001014", cat: "dairy", price: 13, stock: 24 },
  { id: "p9", name: "Кефир 2,5% 1 л", barcode: "4870002001021", cat: "dairy", price: 12, stock: 9 },
  { id: "p10", name: "Сыр сулугуни 300 г", barcode: "4870002001038", cat: "dairy", price: 42, stock: 3 },
  { id: "p11", name: "Масло хлопковое, 1 л", barcode: "4601234567890", cat: "grocery", price: 32, stock: 30 },
  { id: "p12", name: "Рис «Лазер», 1 кг", barcode: "4870003000017", cat: "grocery", price: 16, stock: 50 },
  { id: "p13", name: "Сахар, 1 кг", barcode: "4870003000024", cat: "grocery", price: 11.5, stock: 44 },
  { id: "p14", name: "Яблоки «Голден»", barcode: "2000000000145", cat: "fruit", price: 14.5, stock: 12.4, unit: "кг", step: 0.1 },
  { id: "p15", name: "Гранат исфаринский", barcode: "2000000000152", cat: "fruit", price: 22, stock: 8.2, unit: "кг", step: 0.1 },
];

const CATEGORIES: { value: "all" | Category; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "drinks", label: "Напитки" },
  { value: "bakery", label: "Выпечка" },
  { value: "dairy", label: "Молочное" },
  { value: "grocery", label: "Бакалея" },
  { value: "fruit", label: "Фрукты" },
];

const STORE = {
  name: "Сомон Маркет",
  address: "г. Душанбе, ул. Айни, 48",
  inn: "020045678",
  phone: "+992 44 625 10 10",
};

const VAT_RATE = 14;

const round2 = (n: number) => Math.round(n * 100) / 100;

function plural(n: number, forms: [string, string, string]) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

interface Sale {
  number: string;
  date: Date;
  lines: ReceiptLine[];
  payments: ReceiptPayment[];
  tax: number;
  change: number;
}

// ── Story ───────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => {
    const fmt = useFormat();
    const methodLabels = useMessages(paymentSplitMessages);

    const [cat, setCat] = React.useState<string>("all");
    const [cart, setCart] = React.useState<{ id: string; qty: number }[]>([
      { id: "p5", qty: 3 },
      { id: "p8", qty: 1 },
    ]);
    const [pending, setPending] = React.useState(3);
    const [receiptNo, setReceiptNo] = React.useState(124);

    const [payOpen, setPayOpen] = React.useState(false);
    const [payments, setPayments] = React.useState<PaymentEntry[]>([]);
    const [cashText, setCashText] = React.useState("");

    const [sale, setSale] = React.useState<Sale | null>(null);
    const [receiptOpen, setReceiptOpen] = React.useState(false);
    const receiptRef = React.useRef<HTMLElement>(null);

    const byId = (id: string) => PRODUCTS.find((p) => p.id === id);
    const qtyOf = (id: string) => cart.find((l) => l.id === id)?.qty ?? 0;

    const lines = cart
      .map((l) => ({ product: byId(l.id), qty: l.qty }))
      .filter((l): l is { product: Product; qty: number } => !!l.product);
    const total = round2(lines.reduce((s, l) => s + l.product.price * l.qty, 0));
    const tax = round2((total * VAT_RATE) / (100 + VAT_RATE));
    const count = lines.length;

    const add = (p: Product) => {
      if (p.stock <= 0) {
        toast.warning("Нет в наличии", { description: p.name });
        return;
      }
      const next = round2(qtyOf(p.id) + 1);
      if (next > p.stock) {
        toast.warning("Недостаточно на остатке", {
          description: `${p.name}: доступно ${fmt.number(p.stock)} ${p.unit ?? "шт"}`,
        });
        return;
      }
      setCart((c) =>
        c.some((l) => l.id === p.id)
          ? c.map((l) => (l.id === p.id ? { ...l, qty: next } : l))
          : [...c, { id: p.id, qty: 1 }],
      );
    };

    const setQty = (id: string, qty: number) =>
      setCart((c) => c.map((l) => (l.id === id ? { ...l, qty } : l)));
    const remove = (id: string) => setCart((c) => c.filter((l) => l.id !== id));

    const onScan = (code: string) => {
      const product = PRODUCTS.find((p) => p.barcode === code);
      if (!product) {
        toast.error("Товар не найден", {
          description: `Штрихкода ${code} нет в справочнике. Проверьте упаковку или добавьте товар вручную.`,
        });
        return;
      }
      add(product);
    };

    const visible = PRODUCTS.filter((p) => cat === "all" || p.cat === cat);

    // Payment: Numpad edits the cash row of PaymentSplit; PaymentSplit edits flow back.
    const openPayment = () => {
      setPayments([]);
      setCashText("");
      setPayOpen(true);
    };
    const onNumpadChange = (v: string) => {
      setCashText(v);
      const amount = v ? round2(Number(v)) : 0;
      setPayments((ps) =>
        ps.some((p) => p.method === "cash")
          ? ps.map((p) => (p.method === "cash" ? { ...p, amount } : p))
          : [{ method: "cash", amount }, ...ps],
      );
    };
    const onPaymentsChange = (next: PaymentEntry[]) => {
      setPayments(next);
      const cash = next.find((p) => p.method === "cash");
      setCashText(cash && cash.amount ? String(round2(cash.amount)) : "");
    };
    const paymentTotals = computePaymentTotals(total, payments);

    const labelOf = (method: string) =>
      (
        {
          cash: methodLabels.cash,
          card: methodLabels.card,
          alif: methodLabels.alif,
          eskhata: methodLabels.eskhata,
        } as Record<string, string>
      )[method] ?? method;

    const complete = (result: PaymentSplitResult) => {
      const number = String(receiptNo).padStart(6, "0");
      setSale({
        number,
        date: new Date(),
        lines: lines.map((l) => ({
          name: l.product.name,
          quantity: l.qty,
          price: l.product.price,
          unit: l.product.unit,
        })),
        payments: result.payments.map((p) => ({ label: labelOf(p.method), amount: p.amount })),
        tax,
        change: result.change,
      });
      setReceiptNo((n) => n + 1);
      setPending((n) => n + 1);
      setCart([]);
      setPayOpen(false);
      setReceiptOpen(true);
      toast.success("Продажа проведена", {
        description: `Чек № ${number} · ${fmt.money(total)}. Сохранён на планшете и отправится, когда появится сеть.`,
      });
    };

    return (
      <div className="flex h-dvh flex-col overflow-hidden bg-ui-bg text-ink-1">
        <Banner tone="warning" sticky icon={<WifiOff aria-hidden />} title="Нет соединения">
          — касса работает офлайн. В очереди на отправку: {pending}{" "}
          {plural(pending, ["продажа", "продажи", "продаж"])}.
        </Banner>

        <header className="flex items-center gap-3 border-b border-hairline bg-ui-surface px-4 py-3">
          <TajERPLogo variant="icon" className="text-(length:--tj-fs-2xl)" aria-hidden />
          <div className="min-w-0">
            <div className="text-ui-title font-bold text-ink-1">{STORE.name} · Касса 1</div>
            <div className="text-ui-helper text-ink-3">Смена № 12 · Фарида Рахимова</div>
          </div>
          <SyncStatus className="ml-auto" status="offline" pending={pending} variant="full" />
        </header>

        <div className="flex min-h-0 flex-1">
          {/* Catalogue */}
          <main className="flex min-w-0 flex-1 flex-col">
            <div className="flex flex-col gap-3 border-b border-hairline px-4 pt-4 pb-1">
              <div>
                <BarcodeInput autoFocus refocus size="lg" onScan={onScan} />
                <p className="text-ui-helper text-ink-3">
                  Демо-коды: 4870001234567 (нон), 4600000000000 (чай), 4601234567890 (масло),
                  0000000000000 — неизвестный.
                </p>
              </div>
              <ToggleGroup
                type="single"
                variant="outline"
                size="lg"
                aria-label="Категория товаров"
                value={cat}
                onValueChange={(v) => v && setCat(v)}
                className="flex-wrap pb-3"
              >
                {CATEGORIES.map((c) => (
                  <ToggleGroupItem key={c.value} value={c.value}>
                    {c.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <ul
              aria-label="Товары"
              className="grid flex-1 grid-cols-2 content-start gap-3 overflow-y-auto p-4 md:grid-cols-3 xl:grid-cols-4"
            >
              {visible.map((p) => (
                <li key={p.id}>
                  <ProductTile
                    name={p.name}
                    price={p.price}
                    unit={p.unit}
                    stock={p.stock}
                    sku={p.barcode}
                    inCart={qtyOf(p.id)}
                    onAdd={() => add(p)}
                  />
                </li>
              ))}
            </ul>
          </main>

          {/* Cart */}
          <aside
            aria-label="Текущий чек"
            className="flex w-[400px] shrink-0 flex-col border-l border-hairline bg-ui-surface"
          >
            <div className="flex items-center gap-2 border-b border-hairline px-4 py-3">
              <Receipt className="size-5 text-ink-2" aria-hidden />
              <h2 className="text-ui-title font-bold text-ink-1">Чек № {String(receiptNo).padStart(6, "0")}</h2>
              {count ? (
                <Badge tone="brand" className="ml-1">
                  {count} поз.
                </Badge>
              ) : null}
              <Button
                variant="ghost"
                size="md"
                className="ml-auto"
                disabled={!count}
                iconLeft={<Trash2 className="size-4" aria-hidden />}
                onClick={() => setCart([])}
              >
                Очистить
              </Button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4">
              {lines.length === 0 ? (
                <EmptyState
                  compact
                  className="h-full"
                  icon={<ShoppingCart aria-hidden />}
                  title="Чек пуст"
                  description="Отсканируйте штрихкод или нажмите на товар."
                />
              ) : (
                <ul className="divide-y divide-hairline">
                  {lines.map((l) => (
                    <li key={l.product.id}>
                      <CartLine
                        name={l.product.name}
                        price={l.product.price}
                        quantity={l.qty}
                        unit={l.product.unit}
                        step={l.product.step}
                        max={l.product.stock}
                        onQuantityChange={(q) => setQty(l.product.id, q)}
                        onRemove={() => remove(l.product.id)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-hairline px-4 py-4">
              <CartSummary
                itemCount={count}
                subtotal={total}
                tax={tax}
                taxRate={VAT_RATE}
                taxIncluded
                total={total}
              />
              <Button size="xl" className="w-full" disabled={!count} onClick={openPayment}>
                Оплатить {count ? fmt.money(total) : ""}
              </Button>
            </div>
          </aside>
        </div>

        {/* Payment */}
        <Sheet open={payOpen} onOpenChange={setPayOpen}>
          <SheetContent side="right" size="xl" className="w-full">
            <SheetHeader>
              <SheetTitle>Оплата</SheetTitle>
              <SheetDescription>
                {count} поз. · к оплате {fmt.money(total)}
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-6 px-3 pb-4 md:grid-cols-2">
              <PaymentSplit
                total={total}
                value={payments}
                onValueChange={onPaymentsChange}
                onComplete={complete}
              />
              <div className="flex flex-col gap-2">
                <h3 id="cash-received" className="text-ui-label font-semibold text-ink-2">
                  Получено наличными
                </h3>
                <Numpad
                  aria-labelledby="cash-received"
                  value={cashText}
                  onValueChange={onNumpadChange}
                  quickAmounts={[50, 100, 200, 500]}
                  displaySuffix="с"
                  onEnter={() =>
                    paymentTotals.complete &&
                    complete({
                      payments: payments.filter((p) => p.amount > 0),
                      paid: paymentTotals.paid,
                      change: paymentTotals.change,
                    })
                  }
                  enterDisabled={!paymentTotals.complete}
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Receipt */}
        <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
          <DialogContent size="md">
            <DialogHeader>
              <DialogTitle>Чек № {sale?.number}</DialogTitle>
              <DialogDescription>
                Продажа сохранена офлайн и будет отправлена при восстановлении связи.
              </DialogDescription>
            </DialogHeader>
            {sale ? (
              <div className="flex max-h-[60dvh] justify-center overflow-y-auto">
                <ReceiptPreview
                  ref={receiptRef}
                  width="80mm"
                  store={STORE}
                  meta={{
                    number: sale.number,
                    date: sale.date,
                    cashier: "Фарида Рахимова",
                    shift: "№ 12",
                  }}
                  lines={sale.lines}
                  totals={{ tax: sale.tax, taxRate: VAT_RATE, taxIncluded: true }}
                  payments={sale.payments}
                  change={sale.change}
                />
              </div>
            ) : null}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="subtle" size="lg">
                  Новая продажа
                </Button>
              </DialogClose>
              <Button
                size="lg"
                iconLeft={<Printer className="size-4" aria-hidden />}
                onClick={() => {
                  if (!printReceipt(receiptRef.current)) toast.error("Не удалось открыть печать");
                }}
              >
                Печать чека
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Toaster />
      </div>
    );
  },
};
