import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Button, Stepper, type StepperStep, TajUIProvider } from "../../src";

const meta: Meta<typeof Stepper> = {
  title: "Components/Navigation/Stepper",
  component: Stepper,
  parameters: {
    docs: {
      description: {
        component:
          'Progress through a multi-step flow — POS checkout (Корзина → Оплата → Чек), onboarding, import wizards. Statuses derive from `activeStep`; a step\'s `status: "error"` overrides. With `onStepClick`, completed steps become buttons to go back. On phones a horizontal stepper keeps only the current label visible.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Stepper>;

const checkout: StepperStep[] = [
  { id: "cart", label: "Корзина" },
  { id: "pay", label: "Оплата" },
  { id: "receipt", label: "Чек" },
];

export const PosCheckout: Story = {
  render: () => {
    const [active, setActive] = React.useState(1);
    return (
      <div className="flex max-w-xl flex-col gap-4">
        <Stepper
          steps={checkout}
          activeStep={active}
          onStepClick={(i) => setActive(i)}
        />
        <div className="flex gap-2">
          <Button
            variant="subtle"
            disabled={active === 0}
            onClick={() => setActive((a) => a - 1)}
          >
            Назад
          </Button>
          <Button
            disabled={active === checkout.length - 1}
            onClick={() => setActive((a) => a + 1)}
          >
            Далее
          </Button>
        </div>
      </div>
    );
  },
};

export const PaymentError: Story = {
  render: () => (
    <div className="max-w-xl">
      <Stepper
        activeStep={1}
        steps={[
          { id: "cart", label: "Корзина", description: "5 позиций" },
          {
            id: "pay",
            label: "Оплата",
            description: "Карта отклонена",
            status: "error",
          },
          { id: "receipt", label: "Чек" },
        ]}
      />
    </div>
  ),
};

export const Onboarding: Story = {
  render: () => (
    <div className="max-w-sm">
      <Stepper
        orientation="vertical"
        activeStep={2}
        onStepClick={() => {}}
        steps={[
          {
            id: "company",
            label: "Компания",
            description: "Название, ИНН, адрес",
          },
          {
            id: "store",
            label: "Магазин и касса",
            description: "Точка продаж, принтер чеков 80 мм",
          },
          {
            id: "products",
            label: "Товары",
            description: "Импорт из Excel или 1С",
          },
          {
            id: "staff",
            label: "Сотрудники",
            description: "Кассиры и права доступа",
            optional: true,
          },
          { id: "done", label: "Готово" },
        ]}
      />
    </div>
  ),
};

export const Tajik: Story = {
  render: () => (
    <TajUIProvider locale="tg">
      <div className="flex max-w-xl flex-col gap-8">
        <Stepper
          activeStep={1}
          steps={[
            { id: "cart", label: "Сабад" },
            { id: "pay", label: "Пардохт" },
            { id: "receipt", label: "Чек" },
          ]}
        />
        <Stepper
          orientation="vertical"
          activeStep={1}
          steps={[
            { id: "company", label: "Ширкат", description: "Ном, РМА, суроға" },
            {
              id: "products",
              label: "Молҳо",
              description: "Воридот аз Excel ё 1С",
            },
            { id: "staff", label: "Кормандон", optional: true },
          ]}
        />
      </div>
    </TajUIProvider>
  ),
};
