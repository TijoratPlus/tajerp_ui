import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { SortBuilder, SortPopover, type SortRule, TajUIProvider } from "../../src";

const FIELDS = [
  { name: "modified", label: "Изменено" },
  { name: "creation", label: "Создано" },
  { name: "annual_revenue", label: "Годовой оборот" },
  { name: "lead_name", label: "Имя лида" },
];

const meta: Meta<typeof SortBuilder> = {
  title: "Components/Inputs/SortBuilder",
  component: SortBuilder,
  parameters: {
    docs: {
      description: {
        component:
          "Multi-column sort for list views: field + direction per rule, each field once, priority by dragging the grip (or keyboard: Space, arrows, Space). `SortPopover` wraps it in a «Сортировка (n)» button with «Очистить всё».",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof SortBuilder>;

export const Popover: Story = {
  render: () => {
    const [value, setValue] = React.useState<SortRule[]>([
      { field: "modified", direction: "desc" },
      { field: "annual_revenue", direction: "asc" },
    ]);
    return <SortPopover fields={FIELDS} value={value} onValueChange={setValue} />;
  },
};

export const Inline: Story = {
  render: () => {
    const [value, setValue] = React.useState<SortRule[]>([{ field: "creation", direction: "desc" }]);
    return (
      <div className="max-w-md">
        <SortBuilder fields={FIELDS} value={value} onValueChange={setValue} />
      </div>
    );
  },
};

export const Tajik: Story = {
  render: () => {
    const [value, setValue] = React.useState<SortRule[]>([{ field: "date", direction: "desc" }]);
    return (
      <TajUIProvider locale="tg">
        <SortPopover
          defaultOpen
          fields={[
            { name: "date", label: "Сана" },
            { name: "customer", label: "Муштарӣ" },
          ]}
          value={value}
          onValueChange={setValue}
        />
      </TajUIProvider>
    );
  },
};
