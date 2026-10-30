import type { Meta, StoryObj } from "@storybook/react";
import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  LogOut,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";
import * as React from "react";
import { Avatar, AvatarFallback, Sidebar, type SidebarItem } from "../../src";

const items: SidebarItem[] = [
  { id: "dashboard", label: "Дашборд", icon: <LayoutDashboard />, href: "#" },
  {
    id: "sales",
    label: "Продажи",
    icon: <ShoppingCart />,
    badge: 12,
    children: [
      { id: "sales.shifts", label: "Смены", href: "#" },
      { id: "sales.orders", label: "Заказы", href: "#" },
      { id: "sales.returns", label: "Возвраты", href: "#" },
    ],
  },
  {
    id: "warehouse",
    label: "Склад",
    icon: <Boxes />,
    children: [
      { id: "warehouse.stock", label: "Остатки", href: "#" },
      { id: "warehouse.incoming", label: "Поступления", href: "#" },
    ],
  },
  { id: "customers", label: "Клиенты", icon: <Users />, href: "#" },
  { id: "reports", label: "Отчёты", icon: <BarChart3 />, href: "#" },
  { id: "settings", label: "Настройки", icon: <Settings />, href: "#" },
];

const meta: Meta<typeof Sidebar> = {
  title: "Components/Navigation/Sidebar",
  component: Sidebar,
  parameters: {
    docs: {
      description: {
        component:
          "App navigation rail with nested items, badges, collapse, and header/footer slots. `tone=\"dark\"` (default) is the forest-green rail; `tone=\"light\"` is a calm surface rail with a neutral active row, for airy apps such as the CRM.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Sidebar>;

export const Playground: Story = {
  render: () => {
    const [active, setActive] = React.useState("sales.orders");
    return (
      <div style={{ height: 560, display: "flex" }}>
        <Sidebar
          items={items}
          activeId={active}
          onSelect={(id) => setActive(id)}
          header={
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "var(--ui-brand)",
                  color: "#fff",
                  fontWeight: 800,
                }}
              >
                T
              </div>
              <strong style={{ color: "#fff" }}>Tijorat+</strong>
            </div>
          }
          footer={
            <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
              <Avatar>
                <AvatarFallback>АН</AvatarFallback>
              </Avatar>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>Ахмадшох</div>
                <div style={{ color: "rgba(255,255,255,.5)", fontSize: 11 }}>Администратор</div>
              </div>
              <LogOut style={{ width: 16, height: 16, color: "rgba(255,255,255,.6)" }} />
            </div>
          }
        />
        <div style={{ padding: 24, color: "var(--ui-ink-2)" }}>
          Активный пункт: <strong>{active}</strong>
        </div>
      </div>
    );
  },
};

export const Collapsed: Story = {
  render: () => (
    <div style={{ height: 560, display: "flex" }}>
      <Sidebar
        items={items}
        defaultCollapsed
        defaultActiveId="dashboard"
        header={
          <div
            style={{
              display: "grid",
              placeItems: "center",
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "var(--ui-brand)",
              color: "#fff",
              fontWeight: 800,
            }}
          >
            T
          </div>
        }
      />
    </div>
  ),
};

/** Calm surface rail (CRM): neutral active row, brand green stays on primary actions. */
export const LightTone: Story = {
  name: "Light tone",
  render: () => {
    const [active, setActive] = React.useState("customers");
    return (
      <div style={{ height: 560, display: "flex", background: "var(--ui-surface)" }}>
        <Sidebar
          tone="light"
          className="w-60 border-r border-hairline"
          items={items}
          activeId={active}
          onSelect={(id) => setActive(id)}
          header={<strong className="px-1 text-ui-title text-ink-1">Tijorat+ CRM</strong>}
          footer={
            <div className="flex w-full items-center gap-2.5">
              <Avatar size="sm">
                <AvatarFallback>МР</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-ui-label font-semibold text-ink-1">Мадина Раҳимова</div>
                <div className="truncate text-ui-caption text-ink-3">Менеджер</div>
              </div>
            </div>
          }
        />
        <div className="p-6 text-ui-body text-ink-2">
          Активный пункт: <strong>{active}</strong>
        </div>
      </div>
    );
  },
};
