import type { Meta, StoryObj } from "@storybook/react";
import {
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
  AppShell,
  Avatar,
  AvatarFallback,
  Badge,
  BranchSwitcher,
  Breadcrumb,
  Button,
  Card,
  CardContent,
  DataTable,
  type DataTableColumn,
  DateRangePicker,
  type DateRange,
  ExportMenu,
  LanguageSwitcher,
  SearchField,
  Sidebar,
  type SidebarItem,
  StatCard,
  StatusDot,
  TajERPLogo,
  TajUIProvider,
  Topbar,
  TopbarTitle,
  useFormat,
  useLocale,
  type Locale,
} from "../../src";
import { AxisChart, DonutChart } from "../../src/charts";

const meta: Meta = {
  title: "Examples/Dashboard",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Back-office dashboard: AppShell (Sidebar + Topbar with branch and language switchers), StatCard KPIs, AxisChart and DonutChart on the chart tokens, and a recent-invoices DataTable with a totals row. Resize below 1024px to get the mobile navigation sheet.",
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
  { id: "finance", label: "Деньги", icon: <Wallet />, href: "#" },
  { id: "customers", label: "Клиенты", icon: <Users />, href: "#" },
  { id: "reports", label: "Отчёты", icon: <BarChart3 />, href: "#" },
  { id: "settings", label: "Настройки", icon: <Settings />, href: "#" },
];

const BRANCHES = [
  { id: "dsh", name: "Душанбе, Рудаки 45", kind: "store" as const },
  { id: "khj", name: "Худжанд, Ленина 12", kind: "store" as const },
  { id: "ist", name: "Истаравшан", kind: "store" as const },
  { id: "wh", name: "Центральный склад", kind: "warehouse" as const },
];

const chartData = [
  { period: "Пн", "2026": 42000, "2025": 30000 },
  { period: "Вт", "2026": 51000, "2025": 38000 },
  { period: "Ср", "2026": 47000, "2025": 41000 },
  { period: "Чт", "2026": 63000, "2025": 44000 },
  { period: "Пт", "2026": 72000, "2025": 49000 },
  { period: "Сб", "2026": 88000, "2025": 61000 },
  { period: "Вс", "2026": 54000, "2025": 40000 },
];

const paymentMix = [
  { name: "Наличные", value: 38400 },
  { name: "Карта", value: 24100 },
  { name: "Alif Pay", value: 14200 },
  { name: "Eskhata", value: 7500 },
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

const STATUS: Record<Row["status"], { tone: "success" | "warning" | "danger"; label: string }> = {
  paid: { tone: "success", label: "Оплачено" },
  pending: { tone: "warning", label: "Ожидает" },
  overdue: { tone: "danger", label: "Просрочено" },
};

function useColumns(): DataTableColumn<Row>[] {
  const { money } = useFormat();
  return [
    {
      key: "doc",
      header: "№",
      sortable: true,
      sortAccessor: (r) => r.doc,
      pin: "left",
      width: 110,
      cell: (r) => <span className="font-mono text-ui-helper text-ink-2">{r.doc}</span>,
      footer: () => <span className="text-ui-label">Итого</span>,
    },
    {
      key: "party",
      header: "Контрагент",
      csvValue: (r) => r.party,
      cell: (r) => (
        <div className="flex items-center gap-3">
          <Avatar size="sm" className="!rounded-lg">
            <AvatarFallback className="!rounded-lg">{r.ini}</AvatarFallback>
          </Avatar>
          <b className="text-ui-body text-ink-1">{r.party}</b>
        </div>
      ),
    },
    {
      key: "status",
      header: "Статус",
      cell: (r) => <Badge tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Badge>,
    },
    {
      key: "amount",
      header: "Сумма",
      align: "right",
      sortable: true,
      sortAccessor: (r) => r.amount,
      cell: (r) => <span className="font-bold text-ink-1">{money(r.amount)}</span>,
      footer: (all) => money(all.reduce((s, r) => s + r.amount, 0)),
    },
  ];
}

function DashboardScreen({ onLocaleChange }: { onLocaleChange: (l: Locale) => void }) {
  const locale = useLocale();
  const columns = useColumns();
  const [branch, setBranch] = React.useState<string>("all");
  const [period, setPeriod] = React.useState<DateRange>(() => {
    const to = new Date();
    const from = new Date(to);
    from.setDate(to.getDate() - 6);
    return { from, to };
  });

  return (
    <AppShell
      sidebar={
        <Sidebar
          items={navItems}
          defaultActiveId="dashboard"
          header={
            <div className="flex items-center gap-2.5">
              <TajERPLogo variant="icon" className="text-[28px]" />
              <strong className="text-rail-ink">Tijorat+</strong>
            </div>
          }
          footer={
            <div className="flex w-full items-center gap-2.5">
              <Avatar size="sm">
                <AvatarFallback>АН</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="text-ui-label font-semibold text-rail-ink">Ахмадшох</div>
                <div className="text-ui-caption text-rail-ink-muted">Администратор</div>
              </div>
            </div>
          }
        />
      }
      topbar={
        <Topbar
          start={
            <TopbarTitle>
              <Breadcrumb items={[{ label: "Главная", href: "#" }, { label: "Дашборд" }]} />
            </TopbarTitle>
          }
          center={<SearchField size="sm" placeholder="Поиск по системе…" className="max-w-sm" />}
          end={
            <>
              <BranchSwitcher
                variant="compact"
                branches={BRANCHES}
                allowAll
                value={branch}
                onValueChange={setBranch}
              />
              <LanguageSwitcher value={locale} onValueChange={onLocaleChange} />
              <Button variant="ghost" size="icon" aria-label="Уведомления">
                <Bell className="size-[18px]" aria-hidden />
              </Button>
            </>
          }
        />
      }
    >
      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <div className="flex flex-wrap items-end gap-3">
          <div className="mr-auto">
            <h1 className="text-xl font-bold text-ink-1">Сводка</h1>
            <p className="mt-1 text-ui-control text-ink-3">Смена открыта в 09:00 · Касса 2</p>
          </div>
          <DateRangePicker className="w-auto" value={period} onValueChange={setPeriod} />
          <ExportMenu onExport={() => new Promise((r) => setTimeout(r, 600))} />
          <Button size="md" iconLeft={<Plus className="size-4" aria-hidden />}>
            Накладная
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<Wallet />}
            label="Выручка"
            amount={84200}
            format="money"
            delta={12.4}
            sparkline={[42, 51, 47, 63, 72, 88, 84]}
          />
          <StatCard icon={<ShoppingCart />} label="Продажи" amount={128} format="number" delta={8.1} sparkline={[90, 96, 101, 110, 118, 121, 128]} />
          <StatCard icon={<Users />} label="Новые клиенты" amount={14} format="number" delta={2.3} />
          <StatCard
            icon={<Boxes />}
            label="Расходы"
            amount={21300}
            format="money"
            delta={-4.2}
            invertDelta
            sparkline={[26, 25, 24, 23, 22, 21, 21]}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card variant="elevated" className="xl:col-span-2">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-ui-title font-bold text-ink-1">Продажи за неделю</h2>
                  <p className="text-ui-helper text-ink-3">2026 и 2025</p>
                </div>
                <Badge tone="success">+18% к прошлой неделе</Badge>
              </div>
              <AxisChart
                ariaLabel="Продажи за неделю, 2026 и 2025"
                config={{
                  data: chartData,
                  valueFormat: "money",
                  xAxis: { key: "period", type: "category", title: "День" },
                  series: [
                    { name: "2026", type: "bar" },
                    { name: "2025", type: "bar", color: "var(--ui-chart-7)" },
                  ],
                }}
              />
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardContent className="flex flex-col gap-5 p-5">
              <DonutChart
                title="Способы оплаты"
                valueFormat="money"
                centerLabel="Выручка"
                centerValue="total"
                legendPosition="bottom"
                size={180}
                data={paymentMix}
              />
              <div>
                <h2 className="text-ui-title font-bold text-ink-1">Состояние склада</h2>
                <ul className="mt-3 flex flex-col gap-3">
                  {[
                    { dot: "success" as const, name: "Напитки", note: "В норме" },
                    { dot: "warning" as const, name: "Молочное", note: "Мало — 8 поз." },
                    { dot: "danger" as const, name: "Бакалея", note: "Нет — 3 поз." },
                  ].map((s) => (
                    <li key={s.name} className="flex items-center gap-2.5">
                      <StatusDot tone={s.dot} />
                      <span className="text-ui-body font-medium text-ink-1">{s.name}</span>
                      <span className="ml-auto text-ui-helper text-ink-3">{s.note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <DataTable<Row>
          data={rows}
          columns={columns}
          rowKey={(r) => r.doc}
          title="Последние накладные"
          titleAs="h2"
          caption="· сегодня"
          searchable
          getSearchText={(r) => `${r.doc} ${r.party}`}
          defaultSort={{ key: "amount", dir: "desc" }}
        />
      </div>
    </AppShell>
  );
}

export const Default: Story = {
  render: (_args, { globals }) => {
    const [locale, setLocale] = React.useState<Locale>((globals.locale as Locale) ?? "ru");
    return (
      <TajUIProvider locale={locale}>
        <DashboardScreen onLocaleChange={setLocale} />
      </TajUIProvider>
    );
  },
};
