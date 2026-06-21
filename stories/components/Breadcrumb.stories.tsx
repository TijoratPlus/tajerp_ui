import type { Meta, StoryObj } from "@storybook/react";
import { Home } from "lucide-react";
import { Breadcrumb } from "../../src";

const meta: Meta<typeof Breadcrumb> = {
  title: "Components/Navigation/Breadcrumb",
  component: Breadcrumb,
  parameters: {
    docs: {
      description: {
        component: "Hierarchical location trail. Supports icons, links, and automatic collapse via `maxItems`.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Breadcrumb>;

export const Playground: Story = {
  render: () => (
    <Breadcrumb
      items={[
        { label: "Главная", href: "#", icon: <Home className="size-3.5" /> },
        { label: "Склад", href: "#" },
        { label: "Поступления", href: "#" },
        { label: "Накладная №1042" },
      ]}
    />
  ),
};

export const Collapsed: Story = {
  render: () => (
    <Breadcrumb
      maxItems={3}
      items={[
        { label: "Главная", href: "#" },
        { label: "Каталог", href: "#" },
        { label: "Электроника", href: "#" },
        { label: "Телефоны", href: "#" },
        { label: "Apple", href: "#" },
        { label: "iPhone 15 Pro" },
      ]}
    />
  ),
};
