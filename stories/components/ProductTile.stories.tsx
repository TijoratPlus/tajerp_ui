import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { ProductTile, TajUIProvider } from "../../src";

const meta: Meta<typeof ProductTile> = {
  title: "Components/POS/ProductTile",
  component: ProductTile,
  parameters: {
    docs: {
      description: {
        component:
          "Product card for the POS catalogue grid. The whole tile is one large button that adds the product to the cart. Shows price, optional photo (lettered placeholder when missing), unit, stock level (\"Мало\" / \"Нет в наличии\" — out-of-stock tiles are disabled) and how many are already in the cart. Use `size=\"sm\"` for dense phone grids.",
      },
    },
  },
  args: {
    name: "Кофе латте 350 мл",
    price: 18,
    stock: 24,
    size: "md",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    onAdd: { action: "add" },
  },
  decorators: [(Story) => <div style={{ width: 180 }}><Story /></div>],
};
export default meta;

type Story = StoryObj<typeof ProductTile>;

export const Playground: Story = {};

const PHOTO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="rgb(243,239,230)"/><circle cx="50" cy="55" r="26" fill="rgb(150,97,6)"/><circle cx="50" cy="55" r="18" fill="rgb(233,227,212)"/></svg>',
  );

export const States: Story = {
  decorators: [(Story) => <Story />],
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 170px)", gap: 12 }}>
      <ProductTile name="Кофе латте 350 мл" price={18} image={PHOTO} stock={24} sku="CF-350" />
      <ProductTile name="Самбуса с мясом" price={7} stock={3} inCart={2} />
      <ProductTile name="Багет французский" price={11} stock={0} />
      <ProductTile name="Яблоки «Голден»" price={14.5} unit="кг" stock={12.4} />
    </div>
  ),
};

export const POSGrid: Story = {
  decorators: [(Story) => <Story />],
  render: () => {
    const [cart, setCart] = React.useState<Record<string, number>>({ p2: 1 });
    const products = [
      { id: "p1", name: "Чай зелёный", price: 9, stock: 40 },
      { id: "p2", name: "Круассан", price: 14, stock: 6 },
      { id: "p3", name: "Молоко 1 л", price: 13, stock: 2 },
      { id: "p4", name: "Сыр сулугуни", price: 42, stock: 0 },
      { id: "p5", name: "Вода 0,5 л", price: 5, stock: 120 },
      { id: "p6", name: "Кекс шоколадный с вишней и орехами", price: 16, stock: 18 },
    ];
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, maxWidth: 640 }}>
        {products.map((p) => (
          <ProductTile
            key={p.id}
            size="sm"
            name={p.name}
            price={p.price}
            stock={p.stock}
            inCart={cart[p.id]}
            onAdd={() => setCart((c) => ({ ...c, [p.id]: (c[p.id] ?? 0) + 1 }))}
          />
        ))}
      </div>
    );
  },
};

export const Tajik: Story = {
  decorators: [(Story) => <Story />],
  render: () => (
    <TajUIProvider locale="tg">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 170px)", gap: 12 }}>
        <ProductTile name="Нони тандурӣ" price={3} stock={50} />
        <ProductTile name="Қаймоқ" price={15} stock={2} />
        <ProductTile name="Ҳалво" price={22} stock={0} />
      </div>
    </TajUIProvider>
  ),
};
