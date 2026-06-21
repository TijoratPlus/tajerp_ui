import type { Meta, StoryObj } from "@storybook/react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Boxes,
  LayoutDashboard,
  Plus,
  Settings,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";
import * as React from "react";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Breadcrumb,
  Button,
  Card,
  CardContent,
  DataTable,
  type DataTableColumn,
  SearchField,
  Sidebar,
  type SidebarItem,
  StatusDot,
  TajERPLogo,
} from "../../src";
import { AxisChart } from "../../src/charts";

const meta: Meta = {
  title: "Examples/Dashboard",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Back-office analytics dashboard composing Sidebar, KPI cards, an AxisChart, and a recent-invoices DataTable.",
      },
    },
  },
  tags: ["!autodocs"],
};
export default meta;

type Story = StoryObj;

const navItems: SidebarItem[] = [
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
  { id: "finance", label: "Финансы", icon: <Wallet />, href: "#" },
  { id: "customers", label: "Клиенты", icon: <Users />, href: "#" },
  { id: "reports", label: "Отчёты", icon: <BarChart3 />, href: "#" },
  { id: "settings", label: "Настройки", icon: <Settings />, href: "#" },
];

const chartData = [
  { period: "Пн", "2026": 42, "2025": 30 },
  { period: "Вт", "2026": 51, "2025": 38 },
  { period: "Ср", "2026": 47, "2025": 41 },
  { period: "Чт", "2026": 63, "2025": 44 },
  { period: "Пт", "2026": 72, "2025": 49 },
  { period: "Сб", "2026": 88, "2025": 61 },
  { period: "Вс", "2026": 54, "2025": 40 },
];

interface Row {
  doc: string;
  party: string;
  ini: string;
  status: "paid" | "pending" | "overdue";
  amount: number;
}

const rows: Row[] = [
  { doc: "НК-2041", party: "Ахмад Бакиев", ini: "АБ", status: "paid", amount: 42800 },
  { doc: "НК-2039", party: "Нилуфар Мирзоева", ini: "НМ", status: "pending", amount: 8420 },
  { doc: "НК-2038", party: "Гулрух Маркет", ini: "ГМ", status: "overdue", amount: 96400 },
  { doc: "НК-2037", party: "Pamir Foods", ini: "PF", status: "paid", amount: 58900 },
];

const STATUS: Record<Row["status"], { tone: "success" | "warning" | "error"; label: string }> = {
  paid: { tone: "success", label: "Оплачено" },
  pending: { tone: "warning", label: "Ожидает" },
  overdue: { tone: "error", label: "Просрочено" },
};

const columns: DataTableColumn<Row>[] = [
  { key: "doc", header: "№", sortable: true, sortAccessor: (r) => r.doc, cell: (r) => <span className="font-mono text-[12.5px] text-ink-2">{r.doc}</span> },
  {
    key: "party",
    header: "Контрагент",
    width: "40%",
    cell: (r) => (
      <div className="flex items-center gap-3">
        <Avatar className="size-8 rounded-lg">
          <AvatarFallback className="rounded-lg text-[11px]">{r.ini}</AvatarFallback>
        </Avatar>
        <b className="text-[13.5px] text-ink-1">{r.party}</b>
      </div>
    ),
  },
  { key: "status", header: "Статус", cell: (r) => <Badge tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Badge> },
  {
    key: "amount",
    header: "Сумма",
    align: "right",
    sortable: true,
    sortAccessor: (r) => r.amount,
    cell: (r) => <span className="font-bold text-ink-1">{r.amount.toLocaleString("ru-RU")} c.</span>,
  },
];

function Kpi({
  icon,
  label,
  value,
  delta,
  up,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string;
  up: boolean;
}) {
  return (
    <Card variant="elevated">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="grid size-9 place-items-center rounded-lg bg-mist text-mist-ink [&>svg]:size-[18px]">
            {icon}
          </span>
          <span
            className={`inline-flex items-center gap-0.5 text-[12px] font-bold ${up ? "text-tj-success" : "text-tj-error"}`}
          >
            {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {delta}
          </span>
        </div>
        <div className="mt-4 text-[26px] font-bold leading-none text-ink-1">{value}</div>
        <div className="mt-1.5 text-[13px] text-ink-3">{label}</div>
      </CardContent>
    </Card>
  );
}

export const Default: Story = {
  render: () => (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar
        items={navItems}
        defaultActiveId="dashboard"
        header={
          <div className="flex items-center gap-2.5">
            <TajERPLogo variant="icon" className="text-[28px]" />
            <strong className="text-white">Tijorat+</strong>
          </div>
        }
        footer={
          <div className="flex w-full items-center gap-2.5">
            <Avatar>
              <AvatarFallback>АН</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-white">Ахмадшох</div>
              <div className="text-[11px] text-white/50">Администратор</div>
            </div>
          </div>
        }
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-hairline bg-ui-surface/80 px-6 py-3.5 backdrop-blur">
          <Breadcrumb
            items={[{ label: "Главная", href: "#" }, { label: "Дашборд" }]}
          />
          <div className="ml-auto w-64">
            <SearchField placeholder="Поиск по системе…" />
          </div>
          <Button variant="ghost" size="icon" aria-label="Уведомления">
            <Bell className="size-[18px]" />
          </Button>
          <Button iconLeft={<Plus className="size-4" />}>Накладная</Button>
        </header>

        {/* Content */}
        <main className="flex flex-col gap-6 p-6">
          <div>
            <h1 className="text-[22px] font-bold text-ink-1">Сводка за сегодня</h1>
            <p className="mt-1 text-[14px] text-ink-3">Смена открыта в 09:00 · Касса 2</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi icon={<Wallet />} label="Выручка за день" value="84 200 c." delta="12.4%" up />
            <Kpi icon={<ShoppingCart />} label="Продаж" value="128" delta="8.1%" up />
            <Kpi icon={<Users />} label="Новых клиентов" value="14" delta="2.3%" up />
            <Kpi icon={<Boxes />} label="Низкий остаток" value="6" delta="3 поз." up={false} />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Card variant="elevated" className="xl:col-span-2">
              <CardContent className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-[15px] font-bold text-ink-1">Продажи за неделю</h2>
                    <p className="text-[12.5px] text-ink-3">2026 vs 2025, тыс. сомони</p>
                  </div>
                  <Badge tone="success">+18% к прошлой неделе</Badge>
                </div>
                <AxisChart
                  config={{
                    data: chartData,
                    xAxis: { key: "period", type: "category" },
                    colors: ["#1D9F6E", "#CBD5E1"],
                    series: [
                      { name: "2026", type: "bar" },
                      { name: "2025", type: "bar" },
                    ],
                  }}
                />
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="p-5">
                <h2 className="text-[15px] font-bold text-ink-1">Состояние склада</h2>
                <ul className="mt-4 flex flex-col gap-3.5">
                  {[
                    { dot: "success" as const, name: "Напитки", note: "В норме" },
                    { dot: "success" as const, name: "Выпечка", note: "В норме" },
                    { dot: "warning" as const, name: "Молочное", note: "Мало — 8 поз." },
                    { dot: "error" as const, name: "Бакалея", note: "Нет — 3 поз." },
                    { dot: "success" as const, name: "Заморозка", note: "В норме" },
                  ].map((s) => (
                    <li key={s.name} className="flex items-center gap-2.5">
                      <StatusDot tone={s.dot} pulse={s.dot === "error"} />
                      <span className="text-[13.5px] font-medium text-ink-1">{s.name}</span>
                      <span className="ml-auto text-[12.5px] text-ink-3">{s.note}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <DataTable<Row>
            data={rows}
            columns={columns}
            rowKey={(r) => r.doc}
            title="Последние накладные"
            caption="· сегодня"
            searchable
            getSearchText={(r) => `${r.doc} ${r.party}`}
            defaultSort={{ key: "amount", dir: "desc" }}
          />
        </main>
      </div>
    </div>
  ),
};
