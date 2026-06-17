import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  DataTable,
  type DataTableColumn,
} from "../src";

interface Invoice {
  doc: string;
  date: string;
  party: string;
  sub: string;
  ini: string;
  method: string;
  status: "paid" | "pending" | "overdue" | "draft";
  amount: number;
}

const DATA: Invoice[] = [
  { doc: "НК-2041", date: "20.04.2026", party: "Ахмад Бакиев", sub: "ВАТ-3921 · клиент", ini: "АБ", method: "Eskhata ···4402", status: "paid", amount: 42800 },
  { doc: "НК-2040", date: "20.04.2026", party: "SafarTrans LLC", sub: "поставщик", ini: "СТ", method: "Amonatbank ···1182", status: "paid", amount: -184200 },
  { doc: "НК-2039", date: "19.04.2026", party: "Нилуфар Мирзоева", sub: "розница", ini: "НМ", method: "Alif Pay QR", status: "pending", amount: 8420 },
  { doc: "НК-2038", date: "19.04.2026", party: "Гулрух Маркет", sub: "опт · 14 поз.", ini: "ГМ", method: "Korti Milli", status: "overdue", amount: 96400 },
  { doc: "НК-2037", date: "18.04.2026", party: "Pamir Foods", sub: "поставщик", ini: "PF", method: "Amonatbank ···1182", status: "paid", amount: -58900 },
  { doc: "НК-2036", date: "18.04.2026", party: "Фарход Султонов", sub: "B2B · рассрочка", ini: "ФС", method: "Наличные", status: "draft", amount: 12480 },
];

const fmt = (n: number) =>
  (n < 0 ? "−" : "") + Math.abs(n).toLocaleString("ru-RU") + " с.";

const STATUS: Record<Invoice["status"], { tone: "success" | "warning" | "error" | "neutral"; label: string }> = {
  paid: { tone: "success", label: "Оплачено" },
  pending: { tone: "warning", label: "Ожидает" },
  overdue: { tone: "error", label: "Просрочено" },
  draft: { tone: "neutral", label: "Черновик" },
};

const columns: DataTableColumn<Invoice>[] = [
  {
    key: "doc",
    header: "№ & дата",
    sortable: true,
    sortAccessor: (r) => r.doc,
    cell: (r) => (
      <div>
        <div className="font-mono text-[12.5px] font-semibold text-ink-2">{r.doc}</div>
        <div className="mt-1 text-[11.5px] text-ink-3">{r.date}</div>
      </div>
    ),
  },
  {
    key: "party",
    header: "Контрагент",
    sortable: true,
    sortAccessor: (r) => r.party,
    width: "32%",
    cell: (r) => (
      <div className="flex items-center gap-3">
        <Avatar className="size-[34px] rounded-[9px]">
          <AvatarFallback className="rounded-[9px] text-[12px]">{r.ini}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <b className="block truncate text-[13.5px] text-ink-1">{r.party}</b>
          <small className="block truncate text-[11.5px] text-ink-3">{r.sub}</small>
        </div>
      </div>
    ),
  },
  { key: "method", header: "Метод", cell: (r) => r.method },
  {
    key: "status",
    header: "Статус",
    sortable: true,
    sortAccessor: (r) => r.status,
    cell: (r) => <Badge tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Badge>,
  },
  {
    key: "amount",
    header: "Сумма",
    align: "right",
    sortable: true,
    sortAccessor: (r) => r.amount,
    cell: (r) => (
      <span className={r.amount < 0 ? "font-bold text-tj-error" : "font-bold text-ink-1"}>
        {fmt(r.amount)}
      </span>
    ),
  },
];

const meta: Meta<typeof DataTable<Invoice>> = {
  title: "Data/DataTable",
  component: DataTable<Invoice>,
};
export default meta;

type Story = StoryObj<typeof DataTable<Invoice>>;

export const Full: Story = {
  render: () => {
    const [page, setPage] = React.useState(1);
    return (
      <DataTable<Invoice>
        data={DATA}
        columns={columns}
        rowKey={(r) => r.doc}
        title="Накладные"
        caption="· апрель 2026"
        searchable
        getSearchText={(r) => `${r.doc} ${r.party} ${r.method}`}
        selectable
        defaultSort={{ key: "party", dir: "asc" }}
        toolbar={
          <Button size="sm">
            + Накладная
          </Button>
        }
        selectionActions={
          <>
            <button className="rounded-md bg-white/10 px-3 py-1.5 text-[12.5px] font-bold hover:bg-white/20">
              Отметить оплаченными
            </button>
            <button className="rounded-md bg-white/10 px-3 py-1.5 text-[12.5px] font-bold hover:bg-white/20">
              Экспорт
            </button>
          </>
        }
        pagination={{
          page,
          pageCount: 31,
          total: 248,
          rangeStart: 1,
          rangeEnd: 6,
          pageSize: 8,
          pageSizeOptions: [8, 25, 50],
          onPageChange: setPage,
          onPageSizeChange: () => {},
        }}
      />
    );
  },
};

export const Loading: Story = {
  render: () => (
    <DataTable<Invoice>
      data={[]}
      columns={columns}
      rowKey={(r) => r.doc}
      title="Накладные"
      selectable
      loading
    />
  ),
};

export const Empty: Story = {
  render: () => (
    <DataTable<Invoice>
      data={[]}
      columns={columns}
      rowKey={(r) => r.doc}
      title="Накладные"
      emptyTitle="Пока нет накладных"
      emptyDescription="Создайте первую накладную или импортируйте из банка."
    />
  ),
};
