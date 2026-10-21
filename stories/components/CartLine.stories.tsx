import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { CartLine, CartSummary, Separator, TajUIProvider } from "../../src";

const meta: Meta<typeof CartLine> = {
  title: "Components/POS/CartLine",
  component: CartLine,
  parameters: {
    docs: {
      description: {
        component:
          "One row of the POS cart: name, unit price, a NumberField quantity stepper, line total and a labelled remove button. Supports per-line discounts (percent or amount, with the old total struck through), a note, weighed goods (`unit=\"кг\"`, `step={0.1}`) and a `readOnly` mode for receipts and order history. Pair with `CartSummary` for subtotal, discount, VAT and the grand total.",
      },
    },
  },
  args: {
    name: "Кофе латте",
    price: 18,
    quantity: 2,
  },
  decorators: [(Story) => <div style={{ width: 380 }}><Story /></div>],
};
export default meta;

type Story = StoryObj<typeof CartLine>;

export const Playground: Story = {
  render: (args) => {
    const [qty, setQty] = React.useState(args.quantity);
    return <CartLine {...args} quantity={qty} onQuantityChange={setQty} onRemove={() => setQty(1)} />;
  },
};

export const WithDiscountAndNote: Story = {
  render: () => (
    <CartLine
      name="Сыр сулугуни"
      price={42}
      quantity={2}
      discount={{ type: "percent", value: 10 }}
      note="Акция «Выходные»"
      onQuantityChange={() => {}}
      onRemove={() => {}}
    />
  ),
};

export const WeighedGoods: Story = {
  render: () => {
    const [qty, setQty] = React.useState(1.5);
    return (
      <CartLine
        name="Яблоки «Голден»"
        price={14.5}
        quantity={qty}
        unit="кг"
        step={0.1}
        onQuantityChange={setQty}
        onRemove={() => {}}
      />
    );
  },
};

export const Cart: Story = {
  render: () => {
    const [lines, setLines] = React.useState([
      { id: "1", name: "Кофе латте", price: 18, quantity: 2 },
      { id: "2", name: "Круассан", price: 14, quantity: 1, discount: { type: "amount" as const, value: 2 } },
      { id: "3", name: "Вода 0,5 л", price: 5, quantity: 3 },
    ]);
    const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
    const discount = lines.reduce((s, l) => s + (l.discount?.value ?? 0), 0);
    const total = subtotal - discount;
    const tax = Math.round((total * 12) / 112 * 100) / 100;
    return (
      <div>
        <ul className="divide-y divide-hairline">
          {lines.map((l) => (
            <li key={l.id}>
              <CartLine
                {...l}
                removeAtZero
                onQuantityChange={(q) =>
                  setLines((ls) => ls.map((x) => (x.id === l.id ? { ...x, quantity: q } : x)))
                }
                onRemove={() => setLines((ls) => ls.filter((x) => x.id !== l.id))}
              />
            </li>
          ))}
        </ul>
        <Separator className="my-3" />
        <CartSummary
          itemCount={lines.reduce((s, l) => s + l.quantity, 0)}
          subtotal={subtotal}
          discount={discount}
          tax={tax}
          taxRate={12}
          taxIncluded
          total={total}
        />
      </div>
    );
  },
};

export const ReadOnlyReceipt: Story = {
  render: () => (
    <div>
      <CartLine readOnly name="Кофе латте" price={18} quantity={2} />
      <CartLine readOnly name="Сыр сулугуни" price={42} quantity={1} discount={{ type: "percent", value: 10 }} />
    </div>
  ),
};

export const Tajik: Story = {
  render: () => (
    <TajUIProvider locale="tg">
      <CartLine name="Нони тандурӣ" price={3} quantity={4} onQuantityChange={() => {}} onRemove={() => {}} />
      <Separator className="my-3" />
      <CartSummary subtotal={12} tax={1.29} taxRate={12} taxIncluded total={12} />
    </TajUIProvider>
  ),
};
