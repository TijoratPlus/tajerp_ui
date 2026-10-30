import type { Meta, StoryObj } from "@storybook/react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckSquare,
  FileText,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Paperclip,
  Phone,
  StickyNote,
  Target,
} from "lucide-react";
import * as React from "react";
import { Card, CardContent, Tabs } from "../../src";

const meta: Meta<typeof Tabs> = {
  title: "Components/Navigation/Tabs",
  component: Tabs,
  parameters: {
    docs: {
      description: {
        component:
          "Tabbed content switcher. Pass a `tabs` array with label, optional icon, and content panel. When many tabs share a narrow strip, `overflow=\"menu\"` moves the ones that do not fit into a trailing «Ещё» menu (the active tab always stays visible); the default `overflow=\"scroll\"` scrolls the strip sideways.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Tabs>;

const Panel = ({ children }: { children: React.ReactNode }) => (
  <Card variant="muted" className="mt-4">
    <CardContent>{children}</CardContent>
  </Card>
);

export const Playground: Story = {
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

const leadTabs = [
  { id: "conv", label: "Переписка", icon: <MessageSquare className="size-4" />, badge: 2 },
  { id: "activity", label: "Активность", icon: <Activity className="size-4" /> },
  { id: "notes", label: "Заметки", icon: <StickyNote className="size-4" /> },
  { id: "tasks", label: "Задачи", icon: <CheckSquare className="size-4" /> },
  { id: "files", label: "Файлы", icon: <Paperclip className="size-4" /> },
  { id: "emails", label: "Письма", icon: <Mail className="size-4" /> },
  { id: "calls", label: "Звонки", icon: <Phone className="size-4" /> },
  { id: "events", label: "События", icon: <CalendarDays className="size-4" /> },
  { id: "data", label: "Данные", icon: <FileText className="size-4" /> },
].map((t) => ({ ...t, content: <Panel>{t.label}: содержимое вкладки.</Panel> }));

/** Lead/deal page: nine tabs in a 560px column; the rest go into «Ещё». */
export const OverflowMenu: Story = {
  name: "Overflow menu",
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <Tabs aria-label="Лид" overflow="menu" tabs={leadTabs} />
    </div>
  ),
};

export const OverflowMenuPills: Story = {
  name: "Overflow menu (pills, Tajik)",
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Tabs
        aria-label="Ҳисобот"
        variant="pills"
        overflow="menu"
        labels={{ more: "Боз" }}
        tabs={[
          { label: "Имрӯз", content: <Panel>Фурӯши имрӯза.</Panel> },
          { label: "Ҳафта", content: <Panel>Фурӯши ҳафта.</Panel> },
          { label: "Моҳ", content: <Panel>Фурӯши моҳ.</Panel> },
          { label: "Семоҳа", content: <Panel>Фурӯши семоҳа.</Panel> },
          { label: "Сол", content: <Panel>Фурӯши сол.</Panel> },
          { label: "Ҳамаи давраҳо", content: <Panel>Ҳамаи фурӯш.</Panel> },
        ]}
      />
    </div>
  ),
};
