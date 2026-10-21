import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Label, RadioGroup, RadioGroupItem, TajUIProvider } from "../../src";

const meta: Meta<typeof RadioGroup> = {
  title: "Components/Inputs/RadioGroup",
  component: RadioGroup,
  parameters: {
    docs: {
      description: {
        component:
          "Single choice from a short list that should stay visible (payment method, receipt width, price list). Use Select for long lists and SegmentedControl for 2–3 compact toolbar options. `RadioGroupItem` takes `label` and `description` for a labelled row. Built on Radix RadioGroup.",
      },
    },
  },
  args: { orientation: "vertical" },
  argTypes: {
    orientation: { control: "inline-radio", options: ["vertical", "horizontal"] },
    disabled: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof RadioGroup>;

export const PaymentMethod: Story = {
  render: (args) => {
    const [value, setValue] = React.useState("cash");
    return (
      <div className="flex max-w-sm flex-col gap-2">
        <Label id="pay-label">Способ оплаты</Label>
        <RadioGroup {...args} aria-labelledby="pay-label" value={value} onValueChange={setValue}>
          <RadioGroupItem value="cash" label="Наличные" description="Сдача считается автоматически" />
          <RadioGroupItem value="card" label="Банковская карта" description="Терминал Эсхата" />
          <RadioGroupItem value="alif" label="Alif Pay" description="QR-код на экране покупателя" />
          <RadioGroupItem value="split" label="Раздельная оплата" />
          <RadioGroupItem value="credit" label="В долг" description="Нет доступа у кассира" disabled />
        </RadioGroup>
      </div>
    );
  },
};

export const Horizontal: Story = {
  render: () => (
    <RadioGroup orientation="horizontal" defaultValue="80" aria-label="Ширина чека">
      <RadioGroupItem value="58" label="58 мм" />
      <RadioGroupItem value="80" label="80 мм" />
      <RadioGroupItem value="a4" label="A4" />
    </RadioGroup>
  ),
};

export const Tajik: Story = {
  name: "Tajik (Тоҷикӣ)",
  render: () => (
    <TajUIProvider locale="tg">
      <RadioGroup defaultValue="retail" aria-label="Рӯйхати нархҳо">
        <RadioGroupItem value="retail" label="Нархи чакана" />
        <RadioGroupItem value="wholesale" label="Нархи яклухт" description="Аз 10 адад зиёд" />
        <RadioGroupItem value="vip" label="Мизоҷони доимӣ" />
      </RadioGroup>
    </TajUIProvider>
  ),
};

export const TouchDensity: Story = {
  render: () => (
    <div data-density="touch">
      <RadioGroup defaultValue="cash" aria-label="Способ оплаты">
        <RadioGroupItem value="cash" label="Наличные" />
        <RadioGroupItem value="card" label="Карта" />
      </RadioGroup>
    </div>
  ),
};
