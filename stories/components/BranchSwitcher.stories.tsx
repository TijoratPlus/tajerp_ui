import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { BranchSwitcher, TajUIProvider, type Branch } from "../../src";

const meta: Meta<typeof BranchSwitcher> = {
  title: "Components/Navigation/BranchSwitcher",
  component: BranchSwitcher,
  parameters: {
    docs: {
      description: {
        component:
          'Chooses the active branch (store or warehouse) or, with `allowAll`, the consolidated view across all branches (`value: "all"`). Use it in the topbar of multi-branch businesses; reports and stock screens follow the selection. A search field appears when there are more than `searchThreshold` (6) branches. Keyboard: arrows, Home/End, Enter, Escape and typeahead.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof BranchSwitcher>;

const branches: Branch[] = [
  {
    id: "dsh-1",
    name: "Душанбе, Рудакӣ",
    address: "пр. Рудаки 12",
    kind: "store",
  },
  { id: "dsh-2", name: "Душанбе, Сино", address: "ул. Айни 48", kind: "store" },
  { id: "khj", name: "Худжанд", address: "ул. Ленина 5", kind: "store" },
  {
    id: "wh",
    name: "Центральный склад",
    address: "Промзона, 3",
    kind: "warehouse",
  },
];

const many: Branch[] = [
  ...branches,
  { id: "bkh", name: "Бохтар", address: "ул. Вахдат 7" },
  { id: "klb", name: "Кулоб", address: "ул. Сомони 21" },
  { id: "ist", name: "Истаравшан", address: "ул. Шахристан 2" },
  { id: "pnj", name: "Панджакент", address: "ул. Рудаки 90" },
  { id: "wh-2", name: "Склад Худжанд", kind: "warehouse" },
];

export const Playground: Story = {
  args: { branches, allowAll: true },
  render: (args) => {
    const [value, setValue] = React.useState("all");
    return (
      <div className="flex flex-col items-start gap-3">
        <BranchSwitcher {...args} value={value} onValueChange={setValue} />
        <p className="text-ui-label text-ink-3">value: {value}</p>
      </div>
    );
  },
};

export const Compact: Story = {
  args: { branches, allowAll: true, variant: "compact", defaultValue: "dsh-1" },
};

export const WithSearch: Story = {
  args: { branches: many, defaultValue: "khj" },
};

export const Tajik: Story = {
  render: () => (
    <TajUIProvider locale="tg">
      <BranchSwitcher
        allowAll
        defaultValue="all"
        branches={[
          { id: "dsh", name: "Душанбе, Рӯдакӣ", address: "хиёбони Рӯдакӣ 12" },
          { id: "khj", name: "Хуҷанд", address: "кӯчаи Ленин 5" },
          { id: "wh", name: "Анбори марказӣ", kind: "warehouse" },
        ]}
      />
    </TajUIProvider>
  ),
};
