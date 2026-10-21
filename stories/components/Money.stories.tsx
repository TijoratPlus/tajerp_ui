import type { Meta, StoryObj } from "@storybook/react";
import { Money, TajUIProvider } from "../../src";

const meta: Meta<typeof Money> = {
  title: "Components/POS/Money",
  component: Money,
  parameters: {
    docs: {
      description: {
        component:
          "Prints an amount the Tijorat+ way (`1 234,50 с`) with tabular digits. Use it for prices, line totals, balances and receipt totals instead of formatting by hand. Screen readers hear the currency name (“сомони”). `strikethrough` shows an old price next to a discounted one; `colorNegative` marks debts and refunds.",
      },
    },
  },
  args: { value: 1234.5, size: "md", tone: "auto", colorNegative: false },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl"] },
    tone: {
      control: "select",
      options: ["auto", "brand", "neutral", "success", "warning", "danger", "info"],
    },
  },
};
export default meta;

type Story = StoryObj<typeof Money>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      <Money value={18} size="sm" />
      <Money value={245.9} size="md" />
      <Money value={1250} size="lg" />
      <Money value={18450.75} size="xl" />
    </div>
  ),
};

export const Discount: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
      <Money value={89} size="lg" tone="danger" />
      <Money value={120} size="sm" strikethrough />
    </div>
  ),
};

export const Balances: Story = {
  render: () => (
    <table style={{ borderCollapse: "collapse", fontSize: 13.5 }}>
      <tbody>
        {[
          ["ООО «Душанбе Савдо»", 12500],
          ["ИП Рахимов Ф.", -3450.5],
          ["Магазин «Сомон»", 0],
        ].map(([name, v]) => (
          <tr key={name as string}>
            <td style={{ padding: "6px 16px 6px 0" }}>{name}</td>
            <td style={{ textAlign: "right" }}>
              <Money value={v as number} colorNegative signDisplay="exceptZero" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

export const Tajik: Story = {
  name: "Тоҷикӣ / English",
  render: () => (
    <div style={{ display: "grid", gap: 8 }}>
      <TajUIProvider locale="tg">
        <p>
          Ҳамагӣ барои пардохт: <Money value={1234.5} size="lg" />
        </p>
      </TajUIProvider>
      <TajUIProvider locale="en">
        <p>
          Total: <Money value={1234.5} size="lg" /> · <Money value={99.99} currency="USD" />
        </p>
      </TajUIProvider>
    </div>
  ),
};
