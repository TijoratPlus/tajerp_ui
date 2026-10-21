import type { Meta, StoryObj } from "@storybook/react";
import { Percent, Receipt, TrendingUp, Wallet } from "lucide-react";
import * as React from "react";
import {
  ALL_BRANCHES,
  BranchSwitcher,
  Card,
  CardContent,
  DataTable,
  DateRangePicker,
  ExportMenu,
  FilterBar,
  Label,
  MultiSelect,
  StatCard,
  Toaster,
  addDays,
  dataTableToCSV,
  downloadFile,
  formatDateRange,
  startOfDay,
  toISODate,
  toast,
  useFormat,
  type Branch,
  type DataTableColumn,
  type DateRange,
  type ExportFormat,
  type FilterChip,
  type MultiSelectOption,
} from "../../src";
import { AxisChart, DonutChart } from "../../src/charts";

const meta: Meta = {
  title: "Examples/Sales Report",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Sales report: a FilterBar with DateRangePicker (presets), BranchSwitcher (all branches) and a category MultiSelect, active filters as removable chips with «Сбросить все»; ExportMenu (CSV is built with `dataTableToCSV` + `downloadFile`); a stacked AxisChart of daily revenue by payment method, a DonutChart of the category mix, and a compact DataTable with a pinned product column, sortable money columns, totals and built-in pagination. Sample data is deterministic.",
      },
    },
  },
  tags: ["!autodocs"],
};
export default meta;

type Story = StoryObj;

const DAY_MS = 86_400_000;
/** Fixed "today" so the presets and sample data are stable. */
const TODAY = new Date(2026, 9, 21);
const DEFAULT_RANGE: DateRange = { from: addDays(TODAY, -13), to: TODAY };
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const round2 = (n: number) => Math.round(n * 100) / 100;

// ── Sample data ─────────────────────────────────────────────────────

const BRANCHES: Branch[] = [
  { id: "dsh", name: "Душанбе, Рудаки 45", address: "ул. Рудаки 45", kind: "store" },
  { id: "khj", name: "Худжанд, Ленина 12", address: "ул. Ленина 12", kind: "store" },
  { id: "ist", name: "Истаравшан", address: "ул. Сомони 3", kind: "store" },
];

const CATEGORIES: MultiSelectOption[] = [
  { value: "dairy", label: "Молочные продукты" },
  { value: "bakery", label: "Хлеб и выпечка" },
  { value: "grocery", label: "Бакалея" },
  { value: "drinks", label: "Напитки" },
  { value: "sweets", label: "Сладости" },
  { value: "household", label: "Бытовая химия" },
];
const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]));

const PRODUCTS: { name: string; category: string; price: number }[] = [
  { name: "Молоко 3,2% 1 л", category: "dairy", price: 9.5 },
  { name: "Кефир 1 л", category: "dairy", price: 10 },
  { name: "Сметана 20% 400 г", category: "dairy", price: 14 },
  { name: "Творог 5% 500 г", category: "dairy", price: 22 },
  { name: "Нон тандырный", category: "bakery", price: 4 },
  { name: "Батон нарезной", category: "bakery", price: 5.5 },
  { name: "Лепёшка патыр", category: "bakery", price: 6 },
  { name: "Мука высший сорт 2 кг", category: "grocery", price: 16 },
  { name: "Рис девзира 1 кг", category: "grocery", price: 21 },
  { name: "Сахар-песок 1 кг", category: "grocery", price: 11.5 },
  { name: "Масло подсолнечное 1 л", category: "grocery", price: 19 },
  { name: "Чай зелёный №95", category: "drinks", price: 18.4 },
  { name: "Вода «Оби Зулол» 1,5 л", category: "drinks", price: 4.5 },
  { name: "Сок яблочный 1 л", category: "drinks", price: 13 },
  { name: "Кола 1,5 л", category: "drinks", price: 12 },
  { name: "Халва кунжутная 500 г", category: "sweets", price: 25 },
  { name: "Конфеты «Ширин» 1 кг", category: "sweets", price: 48 },
  { name: "Стиральный порошок 3 кг", category: "household", price: 65 },
  { name: "Мыло хозяйственное", category: "household", price: 5 },
  { name: "Средство для посуды 1 л", category: "household", price: 17 },
];

interface SaleRow {
  id: string;
  sku: string;
  name: string;
  category: string;
  branch: string;
  /** Units sold in a 14-day base period. */
  baseQty: number;
  price: number;
  /** Unit cost. */
  cost: number;
}

/** 20 products × 3 branches = 60 rows, all index-based. */
const ROWS: SaleRow[] = BRANCHES.flatMap((b, bi) =>
  PRODUCTS.map((p, pi) => ({
    id: `${b.id}-${pi}`,
    sku: `TV-${String(1001 + pi)}`,
    name: p.name,
    category: p.category,
    branch: b.id,
    baseQty: 24 + ((pi * 37 + bi * 53) % 180) - bi * 6,
    price: p.price,
    cost: round2(p.price * (0.7 + ((pi * 7 + bi * 3) % 13) / 100)),
  })),
);

interface ReportRow extends SaleRow {
  qty: number;
  revenue: number;
  costTotal: number;
  profit: number;
  margin: number;
}

function daysIn(range: DateRange): number {
  if (!range.from || !range.to) return 14;
  return Math.max(1, Math.round((startOfDay(range.to).getTime() - startOfDay(range.from).getTime()) / DAY_MS) + 1);
}

function toReportRow(row: SaleRow, days: number): ReportRow {
  const qty = Math.max(1, Math.round((row.baseQty * days) / 14));
  const revenue = round2(qty * row.price);
  const costTotal = round2(qty * row.cost);
  const profit = round2(revenue - costTotal);
  return { ...row, qty, revenue, costTotal, profit, margin: revenue ? (profit / revenue) * 100 : 0 };
}

const PAYMENT_SERIES = [
  { name: "cash", label: "Наличные", share: 0.46 },
  { name: "card", label: "Карта", share: 0.27 },
  { name: "alif", label: "Alif Pay", share: 0.19 },
  { name: "credit", label: "В долг", share: 0.08 },
];

/** Daily revenue by payment method; scaled so the period total matches the table. */
function dailyByPayment(range: DateRange, total: number) {
  const to = range.to ?? TODAY;
  const n = Math.min(daysIn(range), 31);
  const days = Array.from({ length: n }, (_, i) => addDays(to, i - n + 1));
  const weights = days.map((d) => {
    const dow = d.getDay();
    const weekend = dow === 6 || dow === 0 ? 1.35 : 1;
    return (0.8 + ((d.getDate() * 37) % 40) / 100) * weekend;
  });
  const sum = weights.reduce((s, w) => s + w, 0);
  // When the period is longer than 31 days, chart the last 31 at the same daily rate.
  const perDay = total / daysIn(range);
  return days.map((d, i) => {
    const dayTotal = (perDay * n * weights[i]!) / sum;
    const row: Record<string, unknown> = { day: toISODate(d) };
    PAYMENT_SERIES.forEach((p, pi) => {
      const wobble = 1 + (((d.getDate() + pi * 5) % 7) - 3) / 30;
      row[p.name] = round2(dayTotal * p.share * wobble);
    });
    return row;
  });
}

// ── Table columns ───────────────────────────────────────────────────

const BRANCH_NAME = Object.fromEntries(BRANCHES.map((b) => [b.id, b.name]));

function useColumns(): DataTableColumn<ReportRow>[] {
  const { money, number } = useFormat();
  const sum = (rows: ReportRow[], pick: (r: ReportRow) => number) => rows.reduce((s, r) => s + pick(r), 0);
  return [
    {
      key: "name",
      header: "Товар",
      pin: "left",
      width: 230,
      sortable: true,
      sortAccessor: (r) => r.name,
      cell: (r) => (
        <div className="min-w-0">
          <div className="truncate font-medium text-ink-1">{r.name}</div>
          <div className="font-mono text-ui-caption text-ink-3">{r.sku}</div>
        </div>
      ),
      footer: (rows) => <span className="text-ui-label">Итого · {number(rows.length)} поз.</span>,
    },
    {
      key: "category",
      header: "Категория",
      sortable: true,
      sortAccessor: (r) => CATEGORY_LABEL[r.category],
      cell: (r) => <span className="text-ink-2">{CATEGORY_LABEL[r.category]}</span>,
    },
    {
      key: "branch",
      header: "Филиал",
      sortable: true,
      sortAccessor: (r) => BRANCH_NAME[r.branch],
      cell: (r) => <span className="whitespace-nowrap text-ink-2">{BRANCH_NAME[r.branch]}</span>,
    },
    {
      key: "qty",
      header: "Продано, шт",
      align: "right",
      sortable: true,
      sortAccessor: (r) => r.qty,
      cell: (r) => <span className="tabular-nums text-ink-1">{number(r.qty)}</span>,
      footer: (rows) => number(sum(rows, (r) => r.qty)),
    },
    {
      key: "revenue",
      header: "Выручка",
      align: "right",
      sortable: true,
      sortAccessor: (r) => r.revenue,
      cell: (r) => <span className="font-bold tabular-nums text-ink-1">{money(r.revenue)}</span>,
      footer: (rows) => money(sum(rows, (r) => r.revenue)),
    },
    {
      key: "cost",
      header: "Себестоимость",
      align: "right",
      sortable: true,
      sortAccessor: (r) => r.costTotal,
      cell: (r) => <span className="tabular-nums text-ink-2">{money(r.costTotal)}</span>,
      footer: (rows) => money(sum(rows, (r) => r.costTotal)),
    },
    {
      key: "profit",
      header: "Прибыль",
      align: "right",
      sortable: true,
      sortAccessor: (r) => r.profit,
      cell: (r) => <span className="tabular-nums text-tj-success-ink">{money(r.profit)}</span>,
      footer: (rows) => money(sum(rows, (r) => r.profit)),
    },
    {
      key: "margin",
      header: "Маржа",
      align: "right",
      sortable: true,
      sortAccessor: (r) => round2(r.margin),
      cell: (r) => (
        <span className="tabular-nums text-ink-2">{number(r.margin, { maximumFractionDigits: 1 })} %</span>
      ),
      footer: (rows) => {
        const revenue = sum(rows, (r) => r.revenue);
        const profit = sum(rows, (r) => r.profit);
        return `${number(revenue ? (profit / revenue) * 100 : 0, { maximumFractionDigits: 1 })} %`;
      },
    },
  ];
}

// ── Screen ──────────────────────────────────────────────────────────

const FORMAT_LABEL: Record<ExportFormat, string> = {
  pdf: "PDF",
  excel: "Excel",
  csv: "CSV",
  email: "e-mail",
};

function SalesReportScreen() {
  const { money } = useFormat();
  const columns = useColumns();
  const periodLabelId = React.useId();
  const periodId = React.useId();
  const categoriesId = React.useId();

  const [range, setRange] = React.useState<DateRange>(DEFAULT_RANGE);
  const [branch, setBranch] = React.useState<string>(ALL_BRANCHES);
  const [categories, setCategories] = React.useState<string[]>(["dairy", "drinks"]);

  const days = daysIn(range);
  const allRows = React.useMemo(() => ROWS.map((r) => toReportRow(r, days)), [days]);
  const rows = React.useMemo(
    () =>
      allRows.filter(
        (r) =>
          (branch === ALL_BRANCHES || r.branch === branch) &&
          (categories.length === 0 || categories.includes(r.category)),
      ),
    [allRows, branch, categories],
  );

  const revenue = rows.reduce((s, r) => s + r.revenue, 0);
  const profit = rows.reduce((s, r) => s + r.profit, 0);
  const receipts = Math.max(1, Math.round(revenue / 86.4));

  const chartData = React.useMemo(() => dailyByPayment(range, revenue), [range, revenue]);
  const byCategory = React.useMemo(
    () =>
      CATEGORIES.map((c) => ({
        name: c.label,
        value: round2(rows.filter((r) => r.category === c.value).reduce((s, r) => s + r.revenue, 0)),
      })).filter((d) => d.value > 0),
    [rows],
  );

  const isDefaultRange =
    range.from && range.to && DEFAULT_RANGE.from && DEFAULT_RANGE.to
      ? toISODate(range.from) === toISODate(DEFAULT_RANGE.from) && toISODate(range.to) === toISODate(DEFAULT_RANGE.to)
      : false;

  const chips: FilterChip[] = [];
  if (!isDefaultRange) {
    chips.push({
      id: "period",
      label: "Период",
      value: formatDateRange(range),
      onRemove: () => setRange(DEFAULT_RANGE),
    });
  }
  if (branch !== ALL_BRANCHES) {
    chips.push({
      id: "branch",
      label: "Филиал",
      value: BRANCH_NAME[branch],
      onRemove: () => setBranch(ALL_BRANCHES),
    });
  }
  categories.forEach((c) =>
    chips.push({
      id: `cat-${c}`,
      label: "Категория",
      value: CATEGORY_LABEL[c],
      onRemove: () => setCategories((prev) => prev.filter((x) => x !== c)),
    }),
  );

  const resetAll = () => {
    setRange(DEFAULT_RANGE);
    setBranch(ALL_BRANCHES);
    setCategories([]);
  };

  const onExport = async (format: ExportFormat) => {
    if (format === "csv") {
      const from = range.from ? toISODate(range.from) : "";
      const to = range.to ? toISODate(range.to) : "";
      downloadFile(dataTableToCSV(rows, columns), `prodazhi_${from}_${to}.csv`);
      toast.success("CSV сохранён", { description: `${rows.length} строк` });
      return;
    }
    await wait(1000);
    toast.success(
      format === "email" ? "Отчёт отправлен на почту" : `Отчёт ${FORMAT_LABEL[format]} готов`,
    );
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="text-xl font-bold text-ink-1">Отчёт о продажах</h1>
        <p className="mt-1 text-ui-control text-ink-3">
          Выручка, себестоимость и прибыль по товарам · {formatDateRange(range)}
        </p>
      </div>

      <FilterBar
        chips={chips}
        onClearAll={resetAll}
        resultCount={rows.length}
        actions={<ExportMenu onExport={onExport} />}
      >
        <div className="flex w-full flex-col gap-1.5 sm:w-auto">
          <Label id={periodLabelId} htmlFor={periodId}>
            Период
          </Label>
          <DateRangePicker
            id={periodId}
            aria-labelledby={`${periodLabelId} ${periodId}`}
            className="sm:w-64"
            value={range}
            onValueChange={setRange}
            today={TODAY}
            max={TODAY}
          />
        </div>
        <BranchSwitcher branches={BRANCHES} allowAll value={branch} onValueChange={setBranch} />
        <div className="flex w-full flex-col gap-1.5 sm:w-80">
          <Label htmlFor={categoriesId}>Категории</Label>
          <MultiSelect
            id={categoriesId}
            options={CATEGORIES}
            value={categories}
            onValueChange={setCategories}
            placeholder="Все категории"
            maxVisibleChips={2}
            selectAll
          />
        </div>
      </FilterBar>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Wallet />} label="Выручка" amount={revenue} format="money" delta={9.6} deltaLabel="к прошлому периоду" />
        <StatCard icon={<TrendingUp />} label="Прибыль" amount={profit} format="money" delta={6.1} deltaLabel="к прошлому периоду" />
        <StatCard icon={<Receipt />} label="Чеков" amount={receipts} format="number" delta={4.3} deltaLabel="к прошлому периоду" />
        <StatCard
          icon={<Percent />}
          label="Средняя маржа"
          amount={revenue ? (profit / revenue) * 100 : 0}
          format="percent"
          delta={-0.8}
          deltaLabel="к прошлому периоду"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card variant="elevated" className="xl:col-span-2">
          <CardContent className="p-5">
            <div className="mb-4">
              <h2 className="text-ui-title font-bold text-ink-1">Выручка по дням</h2>
              <p className="text-ui-helper text-ink-3">По способам оплаты · {money(revenue)} за период</p>
            </div>
            <AxisChart
              ariaLabel="Выручка по дням и способам оплаты"
              config={{
                data: chartData,
                valueFormat: "money",
                xAxis: { key: "day", type: "category", title: "День", format: { day: "numeric", month: "short" } },
                series: PAYMENT_SERIES.map((p) => ({ name: p.name, label: p.label, type: "bar", stack: "pay" })),
              }}
            />
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-5">
            <DonutChart
              title="Доля категорий"
              valueFormat="money"
              centerLabel="Выручка"
              centerValue="total"
              legendPosition="bottom"
              size={180}
              data={byCategory}
            />
          </CardContent>
        </Card>
      </div>

      <div data-density="compact">
        <DataTable<ReportRow>
          data={rows}
          columns={columns}
          rowKey={(r) => r.id}
          title="Продажи по товарам"
          titleAs="h2"
          caption={`· ${formatDateRange(range)}`}
          searchable
          searchPlaceholder="Товар, артикул или филиал…"
          getSearchText={(r) => `${r.name} ${r.sku} ${CATEGORY_LABEL[r.category]} ${BRANCH_NAME[r.branch]}`}
          defaultSort={{ key: "revenue", dir: "desc" }}
          autoPagination={{ pageSize: 10, pageSizeOptions: [10, 25, 50] }}
          emptyTitle="Нет продаж"
          emptyDescription="Измените период или сбросьте фильтры."
        />
      </div>

      <Toaster />
    </div>
  );
}

export const Default: Story = {
  render: () => <SalesReportScreen />,
};
