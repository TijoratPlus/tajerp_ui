import type { Meta, StoryObj } from "@storybook/react";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import * as React from "react";
import { TajUIProvider, ToggleGroup, ToggleGroupItem } from "../../src";

const meta: Meta<typeof ToggleGroup> = {
  title: "Components/Actions/ToggleGroup",
  component: ToggleGroup,
  parameters: {
    docs: {
      description: {
        component:
          "Set of toggles. `type=\"single\"` for one-or-none choices that apply immediately (report period, alignment), `type=\"multiple\"` for combinable filters (stock status). Arrow keys move between items. Give the group an `aria-label`. Built on Radix ToggleGroup and shares `toggleVariants` with Toggle.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof ToggleGroup>;

export const ReportPeriod: Story = {
  render: () => {
    const [value, setValue] = React.useState("week");
    return (
      <div className="flex flex-col items-start gap-2">
        <ToggleGroup
          type="single"
          variant="outline"
          value={value}
          onValueChange={(v) => v && setValue(v)}
          aria-label="Период отчёта"
        >
          <ToggleGroupItem value="day">День</ToggleGroupItem>
          <ToggleGroupItem value="week">Неделя</ToggleGroupItem>
          <ToggleGroupItem value="month">Месяц</ToggleGroupItem>
          <ToggleGroupItem value="year">Год</ToggleGroupItem>
        </ToggleGroup>
        <p className="text-ui-label text-ink-3">Выбрано: {value}</p>
      </div>
    );
  },
};

export const StockFilters: Story = {
  render: () => (
    <ToggleGroup type="multiple" defaultValue={["low"]} size="sm" aria-label="Фильтр остатков">
      <ToggleGroupItem value="low">Заканчивается</ToggleGroupItem>
      <ToggleGroupItem value="out">Нет в наличии</ToggleGroupItem>
      <ToggleGroupItem value="expiring">Истекает срок</ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="left" aria-label="Выравнивание текста на чеке">
      <ToggleGroupItem value="left" aria-label="По левому краю">
        <AlignLeft aria-hidden />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="По центру">
        <AlignCenter aria-hidden />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="По правому краю">
        <AlignRight aria-hidden />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Tajik: Story = {
  name: "Tajik (Тоҷикӣ)",
  render: () => (
    <TajUIProvider locale="tg">
      <ToggleGroup type="single" variant="outline" defaultValue="week" aria-label="Давраи ҳисобот">
        <ToggleGroupItem value="day">Рӯз</ToggleGroupItem>
        <ToggleGroupItem value="week">Ҳафта</ToggleGroupItem>
        <ToggleGroupItem value="month">Моҳ</ToggleGroupItem>
        <ToggleGroupItem value="year">Сол</ToggleGroupItem>
      </ToggleGroup>
    </TajUIProvider>
  ),
};

export const TouchDensity: Story = {
  render: () => (
    <div data-density="touch">
      <ToggleGroup type="single" variant="outline" defaultValue="all" aria-label="Категория">
        <ToggleGroupItem value="all">Все</ToggleGroupItem>
        <ToggleGroupItem value="drinks">Напитки</ToggleGroupItem>
        <ToggleGroupItem value="bakery">Выпечка</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
};
