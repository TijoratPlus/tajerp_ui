import type { Meta, StoryObj } from "@storybook/react";
import { HandCoins } from "lucide-react";
import * as React from "react";
import { PaymentSplit, TajUIProvider, type PaymentEntry } from "../../src";

const meta: Meta<typeof PaymentSplit> = {
  title: "Components/POS/PaymentSplit",
  component: PaymentSplit,
  parameters: {
    docs: {
      description: {
        component:
          "Split-payment editor for checkout. Add cash, card, Alif Pay or Eskhata (or your own methods), type the amounts (\",\" or \".\" decimals), and use \"Остаток\" to put the remaining sum on a method. Shows paid / remaining / change live and announces it to screen readers. Only cash may exceed the total (change is given from cash); `onComplete` is enabled once the receipt is paid in full.",
      },
    },
  },
  args: { total: 248.5 },
  argTypes: { onComplete: { action: "complete" } },
  decorators: [(Story) => <div style={{ width: 460 }}><Story /></div>],
};
export default meta;

type Story = StoryObj<typeof PaymentSplit>;

export const Playground: Story = {};

export const CashWithChange: Story = {
  args: {
    defaultValue: [{ method: "cash", amount: 300 }],
  },
};

export const SplitCardAndAlif: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<PaymentEntry[]>([
      { method: "card", amount: 150 },
      { method: "alif", amount: 0 },
    ]);
    return (
      <PaymentSplit
        {...args}
        value={value}
        onValueChange={setValue}
        onComplete={args.onComplete}
      />
    );
  },
};

export const CustomMethods: Story = {
  args: {
    methods: [
      { id: "cash", label: "Наличные" },
      { id: "card", label: "Карта" },
      { id: "credit", label: "В долг (клиент)", icon: <HandCoins /> },
    ],
  },
};

export const Tajik: Story = {
  render: (args) => (
    <TajUIProvider locale="tg">
      <PaymentSplit {...args} total={86} defaultValue={[{ method: "cash", amount: 100 }]} />
    </TajUIProvider>
  ),
};
