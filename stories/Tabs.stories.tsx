import type { Meta, StoryObj } from "@storybook/react";
import { BarChart3, LayoutDashboard, Target } from "lucide-react";
import * as React from "react";
import { Card, CardContent, Tabs } from "../src";

const meta: Meta<typeof Tabs> = {
  title: "Primitives/Tabs",
  component: Tabs,
};
export default meta;

type Story = StoryObj<typeof Tabs>;

const Panel = ({ children }: { children: React.ReactNode }) => (
  <Card variant="muted" className="mt-4">
    <CardContent>{children}</CardContent>
  </Card>
);

export const Uncontrolled: Story = {
  render: () => (
    <Tabs
      tabs={[
        {
          label: "Обзор",
          icon: <LayoutDashboard className="size-4" />,
          content: <Panel>Сводка продаж за смену.</Panel>,
        },
        {
          label: "План продаж",
          icon: <Target className="size-4" />,
          content: <Panel>Прогресс по плану.</Panel>,
        },
        {
          label: "Отчёты",
          icon: <BarChart3 className="size-4" />,
          content: <Panel>Графики и экспорт.</Panel>,
        },
      ]}
    />
  ),
};

export const Controlled: Story = {
  render: () => {
    const [i, setI] = React.useState(1);
    return (
      <div>
        <p className="mb-3 text-sm text-ink-3">Активная вкладка: {i}</p>
        <Tabs
          tabIndex={i}
          onTabChange={setI}
          tabs={[
            { label: "Один", content: <Panel>Первая</Panel> },
            { label: "Два", content: <Panel>Вторая</Panel> },
            { label: "Три", content: <Panel>Третья</Panel> },
          ]}
        />
      </div>
    );
  },
};
