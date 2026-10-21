import type { Meta, StoryObj } from "@storybook/react";
import {
  BadgePercent,
  CalendarClock,
  MessageSquareText,
  PackageCheck,
  Pencil,
  Phone,
  Receipt,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import * as React from "react";
import {
  ActivityTimeline,
  Alert,
  ApprovalCard,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  DataTable,
  DescriptionList,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Progress,
  StatCard,
  TajUIProvider,
  Tabs,
  formatTjPhone,
  initialsOf,
  useFormat,
  useLocale,
  type ActivityItem,
  type DataTableColumn,
  type DescriptionListItemData,
} from "../../src";

const meta: Meta = {
  title: "Examples/Customer Card",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "CRM customer page: header with Avatar and the formatted +992 phone, StatCard KPIs (debt uses `invertDelta`), and Tabs (`keepMounted`) with a DescriptionList overview, a receipts DataTable with expandable item rows and a totals footer, the debt tab (Alert, repaid Progress, and an SMS reminder previewed as an ApprovalCard in a Dialog — nothing is sent without the owner's «да»), and an ActivityTimeline grouped by day.",
      },
    },
  },
  tags: ["!autodocs"],
};
export default meta;

type Story = StoryObj;

/** Fixed reference time so relative dates and day groups are stable. */
const NOW = new Date(2026, 9, 21, 15, 30).getTime();
const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const PHONE = "+992931234567";
const DEBT_TOTAL = 9000;
const DEBT_REPAID = 5520;
const DEBT_OVERDUE = 1980;

// ── Content (ru / tg) ───────────────────────────────────────────────

type Copy = typeof ru;

const ru = {
  name: "Дилшод Рахимов",
  segment: "Постоянный клиент · с 2023 года",
  debtor: "Должник",
  edit: "Изменить",
  call: "Позвонить",
  kpi: {
    purchases: "Покупки за год",
    avg: "Средний чек",
    debt: "Долг",
    bonus: "Бонусы",
    vsLastYear: "к прошлому году",
    vsLastMonth: "к прошлому месяцу",
  },
  tabsLabel: "Разделы карточки клиента",
  tabs: { overview: "Обзор", purchases: "Покупки", debt: "Долг", history: "История" },
  details: {
    phone: "Телефон",
    address: "Адрес",
    addressValue: "г. Душанбе, ул. Рудаки 45, кв. 12",
    inn: "ИНН",
    registered: "Дата регистрации",
    manager: "Менеджер",
    managerValue: "Фарход Назаров",
    branch: "Филиал",
    branchValue: "Душанбе, Рудаки 45",
    terms: "Условия",
    termsValue: "Отсрочка до 14 дней, лимит 10 000,00 с",
  },
  receipts: {
    title: "Чеки клиента",
    caption: "· за 2026 год",
    search: "Поиск по чекам…",
    doc: "№",
    date: "Дата",
    store: "Касса",
    payment: "Оплата",
    lines: "Позиций",
    total: "Сумма",
    totalRow: "Итого",
    item: "Товар",
    qty: "Кол-во",
    price: "Цена",
  },
  pay: { cash: "Наличные", card: "Карта", alif: "Alif Pay", credit: "В долг" },
  debt: {
    overdueTitle: (amount: string) => `Просрочено ${amount}`,
    overdueText:
      "Срок оплаты по накладной НК-1874 истёк 12 дней назад. Клиент обычно платит после напоминания.",
    repaid: (paid: string, total: string) => `Погашено ${paid} из ${total}`,
    remind: "Напомнить по SMS",
    reminded: "SMS отправлено",
    invoices: "Неоплаченные накладные",
    remaining: "Остаток",
    dialogTitle: "Предпросмотр SMS",
    dialogText: "TijoratAI подготовил напоминание. Ничего не отправится без вашего «да».",
    smsTitle: "SMS-напоминание Дилшоду Рахимову",
    smsText:
      "«Ассалому алейкум, Дилшод! Напоминаем о долге 1 980,00 с в магазине «Нур». Оплатить можно через Alif или на кассе. Рахмат!»",
    recipient: "Получатель",
    channel: "Канал",
    sendAt: "Отправка",
    sendAtValue: "сразу после одобрения",
    cost: "Стоимость",
    rejectPlaceholder: "Например: клиент обещал оплатить завтра",
  },
  timelineLabel: "История клиента",
};

const tg: Copy = {
  name: "Дилшод Раҳимов",
  segment: "Мизоҷи доимӣ · аз соли 2023",
  debtor: "Қарздор",
  edit: "Тағйир додан",
  call: "Занг задан",
  kpi: {
    purchases: "Харидҳо дар як сол",
    avg: "Чеки миёна",
    debt: "Қарз",
    bonus: "Бонусҳо",
    vsLastYear: "нисбат ба соли гузашта",
    vsLastMonth: "нисбат ба моҳи гузашта",
  },
  tabsLabel: "Бахшҳои корти мизоҷ",
  tabs: { overview: "Шарҳ", purchases: "Харидҳо", debt: "Қарз", history: "Таърих" },
  details: {
    phone: "Телефон",
    address: "Суроға",
    addressValue: "ш. Душанбе, кӯч. Рӯдакӣ 45, ҳуҷраи 12",
    inn: "РМА",
    registered: "Санаи бақайдгирӣ",
    manager: "Менеҷер",
    managerValue: "Фарҳод Назаров",
    branch: "Филиал",
    branchValue: "Душанбе, Рӯдакӣ 45",
    terms: "Шартҳо",
    termsValue: "Мӯҳлат то 14 рӯз, ҳадди қарз 10 000,00 с",
  },
  receipts: {
    title: "Чекҳои мизоҷ",
    caption: "· соли 2026",
    search: "Ҷустуҷӯи чекҳо…",
    doc: "№",
    date: "Сана",
    store: "Касса",
    payment: "Пардохт",
    lines: "Мавқеъҳо",
    total: "Маблағ",
    totalRow: "Ҳамагӣ",
    item: "Мол",
    qty: "Миқдор",
    price: "Нарх",
  },
  pay: { cash: "Нақд", card: "Корт", alif: "Alif Pay", credit: "Ба қарз" },
  debt: {
    overdueTitle: (amount: string) => `Мӯҳлат гузашт: ${amount}`,
    overdueText:
      "Мӯҳлати пардохти борхати НК-1874 12 рӯз пеш гузашт. Мизоҷ одатан баъд аз ёдрасӣ пардохт мекунад.",
    repaid: (paid: string, total: string) => `Пардохт шуд ${paid} аз ${total}`,
    remind: "Ёдрасӣ бо SMS",
    reminded: "SMS фиристода шуд",
    invoices: "Борхатҳои пардохтнашуда",
    remaining: "Бақия",
    dialogTitle: "Пешнамоиши SMS",
    dialogText: "TijoratAI ёдрасиро омода кард. Бе «ҳа»-и шумо ҳеҷ чиз фиристода намешавад.",
    smsTitle: "Ёдрасии SMS ба Дилшод Раҳимов",
    smsText:
      "«Ассалому алейкум, Дилшод! Қарзи шумо дар мағозаи «Нур» 1 980,00 с аст. Метавонед тавассути Alif ё дар касса пардохт кунед. Раҳмат!»",
    recipient: "Гиранда",
    channel: "Канал",
    sendAt: "Фиристодан",
    sendAtValue: "баъд аз тасдиқ",
    cost: "Арзиш",
    rejectPlaceholder: "Масалан: мизоҷ ваъда дод, ки пагоҳ пардохт мекунад",
  },
  timelineLabel: "Таърихи мизоҷ",
};

function useCopy(): Copy {
  return useLocale() === "tg" ? tg : ru;
}

// ── Sample data ─────────────────────────────────────────────────────

type PayMethod = keyof Copy["pay"];

interface ReceiptLineRow {
  name: string;
  qty: number;
  unit: string;
  price: number;
}

interface ReceiptRow {
  doc: string;
  date: number;
  store: string;
  payment: PayMethod;
  items: ReceiptLineRow[];
}

const CATALOG: ReceiptLineRow[] = [
  { name: "Мука высший сорт, 50 кг", qty: 1, unit: "меш.", price: 420 },
  { name: "Масло подсолнечное 5 л", qty: 2, unit: "шт", price: 98.5 },
  { name: "Рис девзира", qty: 10, unit: "кг", price: 21 },
  { name: "Чай зелёный №95", qty: 4, unit: "уп", price: 18.4 },
  { name: "Сахар-песок", qty: 5, unit: "кг", price: 11.5 },
  { name: "Нон тандырный", qty: 6, unit: "шт", price: 4 },
  { name: "Молоко 3,2% 1 л", qty: 3, unit: "шт", price: 9.5 },
  { name: "Халва кунжутная", qty: 1, unit: "кг", price: 46 },
];

const PAYMENTS: PayMethod[] = ["cash", "card", "credit", "alif", "cash", "card", "cash", "credit"];
const STORES = ["Касса 1", "Касса 2", "Касса 1", "Касса 3"];

const RECEIPTS: ReceiptRow[] = Array.from({ length: 8 }, (_, i) => ({
  doc: `ЧК-${2180 - i * 17}`,
  date: NOW - (i * 9 + 2) * DAY - (i % 3) * 3 * HOUR,
  store: STORES[i % STORES.length]!,
  payment: PAYMENTS[i]!,
  items: CATALOG.filter((_, j) => (j + i) % 3 !== 0).map((line, j) => ({
    ...line,
    qty: line.qty + ((i + j) % 3),
  })),
}));

const receiptTotal = (r: ReceiptRow) =>
  Math.round(r.items.reduce((s, l) => s + l.qty * l.price, 0) * 100) / 100;

const PAY_TONE: Record<PayMethod, "neutral" | "info" | "brand" | "warning"> = {
  cash: "neutral",
  card: "info",
  alif: "brand",
  credit: "warning",
};

// ── Pieces ──────────────────────────────────────────────────────────

function useReceiptColumns(): DataTableColumn<ReceiptRow>[] {
  const c = useCopy();
  const { money, date } = useFormat();
  return [
    {
      key: "doc",
      header: c.receipts.doc,
      width: 110,
      sortable: true,
      sortAccessor: (r) => r.doc,
      cell: (r) => <span className="font-mono text-ui-helper text-ink-2">{r.doc}</span>,
      footer: () => <span className="text-ui-label">{c.receipts.totalRow}</span>,
    },
    {
      key: "date",
      header: c.receipts.date,
      sortable: true,
      sortAccessor: (r) => r.date,
      cell: (r) => (
        <span className="tabular-nums text-ink-1">
          {date(r.date, { dateStyle: "medium", timeStyle: "short" })}
        </span>
      ),
    },
    {
      key: "store",
      header: c.receipts.store,
      csvValue: (r) => r.store,
      cell: (r) => <span className="text-ink-2">{r.store}</span>,
    },
    {
      key: "payment",
      header: c.receipts.payment,
      csvValue: (r) => c.pay[r.payment],
      cell: (r) => <Badge tone={PAY_TONE[r.payment]}>{c.pay[r.payment]}</Badge>,
    },
    {
      key: "lines",
      header: c.receipts.lines,
      align: "right",
      sortAccessor: (r) => r.items.length,
      cell: (r) => <span className="tabular-nums text-ink-2">{r.items.length}</span>,
    },
    {
      key: "total",
      header: c.receipts.total,
      align: "right",
      sortable: true,
      sortAccessor: receiptTotal,
      cell: (r) => <span className="font-bold tabular-nums text-ink-1">{money(receiptTotal(r))}</span>,
      footer: (rows) => money(rows.reduce((s, r) => s + receiptTotal(r), 0)),
    },
  ];
}

function ReceiptItems({ receipt }: { receipt: ReceiptRow }) {
  const c = useCopy();
  const { money, number } = useFormat();
  return (
    <table className="w-full max-w-xl text-ui-label">
      <caption className="sr-only">{receipt.doc}</caption>
      <thead>
        <tr className="text-left text-ui-caption text-ink-3">
          <th scope="col" className="py-1 font-medium">{c.receipts.item}</th>
          <th scope="col" className="py-1 text-right font-medium">{c.receipts.qty}</th>
          <th scope="col" className="py-1 text-right font-medium">{c.receipts.price}</th>
          <th scope="col" className="py-1 text-right font-medium">{c.receipts.total}</th>
        </tr>
      </thead>
      <tbody>
        {receipt.items.map((l) => (
          <tr key={l.name} className="border-t border-hairline">
            <td className="py-1.5 text-ink-1">{l.name}</td>
            <td className="py-1.5 text-right tabular-nums text-ink-2">
              {number(l.qty)} {l.unit}
            </td>
            <td className="py-1.5 text-right tabular-nums text-ink-2">{money(l.price)}</td>
            <td className="py-1.5 text-right font-bold tabular-nums text-ink-1">
              {money(l.qty * l.price)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function OverviewTab() {
  const c = useCopy();
  const { date } = useFormat();
  const items: DescriptionListItemData[] = [
    {
      id: "phone",
      term: c.details.phone,
      description: (
        <a href={`tel:${PHONE}`} className="font-medium text-brand-ink underline-offset-4 hover:underline">
          {formatTjPhone(PHONE, { international: true })}
        </a>
      ),
      copyable: PHONE,
    },
    { id: "address", term: c.details.address, description: c.details.addressValue },
    { id: "inn", term: c.details.inn, description: "020 045 671", copyable: "020045671" },
    {
      id: "registered",
      term: c.details.registered,
      description: date(new Date(2023, 2, 14), { dateStyle: "long" }),
    },
    { id: "manager", term: c.details.manager, description: c.details.managerValue },
    { id: "branch", term: c.details.branch, description: c.details.branchValue },
    { id: "terms", term: c.details.terms, description: c.details.termsValue },
  ];
  return (
    <Card variant="elevated">
      <CardContent className="p-5">
        <DescriptionList items={items} />
      </CardContent>
    </Card>
  );
}

function PurchasesTab() {
  const c = useCopy();
  const columns = useReceiptColumns();
  return (
    <DataTable<ReceiptRow>
      data={RECEIPTS}
      columns={columns}
      rowKey={(r) => r.doc}
      title={c.receipts.title}
      titleAs="h2"
      caption={c.receipts.caption}
      searchable
      searchPlaceholder={c.receipts.search}
      getSearchText={(r) => `${r.doc} ${r.store} ${c.pay[r.payment]} ${r.items.map((l) => l.name).join(" ")}`}
      defaultSort={{ key: "date", dir: "desc" }}
      renderExpanded={(r) => <ReceiptItems receipt={r} />}
    />
  );
}

function DebtTab() {
  const c = useCopy();
  const { money, date } = useFormat();
  const [open, setOpen] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const invoices = [
    { doc: "НК-1874", due: NOW - 12 * DAY, amount: DEBT_OVERDUE, overdue: true },
    { doc: "НК-1921", due: NOW + 5 * DAY, amount: DEBT_TOTAL - DEBT_REPAID - DEBT_OVERDUE, overdue: false },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      <Card variant="elevated" className="lg:col-span-3">
        <CardContent className="flex flex-col gap-5 p-5">
          <Alert
            tone="warning"
            title={c.debt.overdueTitle(money(DEBT_OVERDUE))}
            description={c.debt.overdueText}
            action={
              sent ? (
                <Badge tone="success">{c.debt.reminded}</Badge>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  iconLeft={<MessageSquareText className="size-4" aria-hidden />}
                  onClick={() => setOpen(true)}
                >
                  {c.debt.remind}
                </Button>
              )
            }
          />
          <Progress
            value={DEBT_REPAID}
            max={DEBT_TOTAL}
            tone="success"
            label={c.debt.repaid(money(DEBT_REPAID), money(DEBT_TOTAL))}
            showValue
          />
        </CardContent>
      </Card>

      <Card variant="elevated" className="lg:col-span-2">
        <CardContent className="p-5">
          <h2 className="text-ui-title font-bold text-ink-1">{c.debt.invoices}</h2>
          <ul className="mt-3 flex flex-col divide-y divide-hairline">
            {invoices.map((inv) => (
              <li key={inv.doc} className="flex items-center gap-3 py-2.5">
                <CalendarClock className="size-4 shrink-0 text-ink-3" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-ui-label text-ink-1">{inv.doc}</div>
                  <div className="text-ui-helper text-ink-3">{date(inv.due, { dateStyle: "medium" })}</div>
                </div>
                <Badge tone={inv.overdue ? "danger" : "neutral"} size="sm">
                  {inv.overdue ? c.debtor : c.debt.remaining}
                </Badge>
                <span className="font-bold tabular-nums text-ink-1">{money(inv.amount)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>{c.debt.dialogTitle}</DialogTitle>
            <DialogDescription>{c.debt.dialogText}</DialogDescription>
          </DialogHeader>
          <ApprovalCard
            kind="sms"
            title={c.debt.smsTitle}
            summary={c.debt.smsText}
            amount={DEBT_OVERDUE}
            requestedBy={{ name: "TijoratAI", kind: "ai" }}
            requestedAt={NOW - 4 * 60_000}
            now={NOW}
            headingLevel={3}
            details={[
              { label: c.debt.recipient, value: formatTjPhone(PHONE, { international: true }) },
              { label: c.debt.channel, value: "SMS" },
              { label: c.debt.sendAt, value: c.debt.sendAtValue },
              { label: c.debt.cost, value: money(0.15) },
            ]}
            requireRejectReason
            labels={{ rejectReasonPlaceholder: c.debt.rejectPlaceholder }}
            onApprove={async () => {
              await wait(900);
              setSent(true);
              setOpen(false);
            }}
            onReject={async () => {
              await wait(400);
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function useHistory(): ActivityItem[] {
  const tgLocale = useLocale() === "tg";
  const { money } = useFormat();
  const manager = { name: tgLocale ? "Фарҳод Назаров" : "Фарход Назаров", kind: "user" as const };
  const ai = { name: "TijoratAI", kind: "ai" as const };
  return [
    {
      id: "h1",
      actor: ai,
      action: tgLocale ? "ёдрасии SMS-ро дар бораи қарз омода кард" : "подготовил SMS-напоминание о долге",
      target: "НК-1874",
      time: NOW - 40 * 60_000,
      meta: tgLocale ? "Интизори тасдиқ" : "Ждёт вашего одобрения",
    },
    {
      id: "h2",
      actor: manager,
      action: tgLocale ? "пардохтро қабул кард" : "принял оплату",
      target: money(1200),
      time: NOW - 3 * HOUR,
      icon: <Wallet className="size-4" aria-hidden />,
      tone: "success",
    },
    {
      id: "h3",
      actor: { name: "Касса 2", kind: "system" },
      action: tgLocale ? "чек сохт" : "пробила чек",
      target: "ЧК-2180",
      time: NOW - 2 * DAY + HOUR,
      icon: <Receipt className="size-4" aria-hidden />,
      tone: "info",
    },
    {
      id: "h4",
      actor: ai,
      action: tgLocale ? "мӯҳлати пардохтро қайд кард" : "отметил просрочку оплаты",
      target: "НК-1874",
      time: NOW - 2 * DAY - 2 * HOUR,
      tone: "warning",
    },
    {
      id: "h5",
      actor: manager,
      action: tgLocale ? "ҳадди қарзро то 10 000,00 с баланд кард" : "повысил лимит долга до 10 000,00 с",
      time: NOW - 9 * DAY,
      icon: <BadgePercent className="size-4" aria-hidden />,
      tone: "brand",
    },
    {
      id: "h6",
      actor: manager,
      action: tgLocale ? "фармоишро супорид" : "выдал заказ",
      target: "ЗК-0412",
      time: NOW - 9 * DAY - 4 * HOUR,
      icon: <PackageCheck className="size-4" aria-hidden />,
      tone: "neutral",
    },
  ];
}

function HistoryTab() {
  const c = useCopy();
  const items = useHistory();
  return (
    <Card variant="elevated">
      <CardContent className="p-5">
        <ActivityTimeline aria-label={c.timelineLabel} items={items} groupByDay now={NOW} />
      </CardContent>
    </Card>
  );
}

// ── Screen ──────────────────────────────────────────────────────────

function CustomerCardScreen() {
  const c = useCopy();
  const debtLeft = DEBT_TOTAL - DEBT_REPAID;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:p-6">
      <Card variant="elevated">
        <CardContent className="flex flex-wrap items-center gap-4 p-5">
          <Avatar size="xl">
            <AvatarFallback>{initialsOf(c.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-ink-1">{c.name}</h1>
              <Badge tone="danger">{c.debtor}</Badge>
            </div>
            <a
              href={`tel:${PHONE}`}
              className="mt-1 inline-flex items-center gap-1.5 text-ui-control font-medium tabular-nums text-ink-2 hover:text-brand-ink"
            >
              <Phone className="size-4" aria-hidden />
              {formatTjPhone(PHONE, { international: true })}
            </a>
            <p className="mt-0.5 text-ui-helper text-ink-3">{c.segment}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="subtle" size="md" iconLeft={<Pencil className="size-4" aria-hidden />}>
              {c.edit}
            </Button>
            <Button asChild size="md">
              <a href={`tel:${PHONE}`}>
                <Phone className="size-4" aria-hidden />
                {c.call}
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<ShoppingBag />}
          label={c.kpi.purchases}
          amount={48620}
          format="money"
          delta={14.2}
          deltaLabel={c.kpi.vsLastYear}
          sparkline={[3.1, 3.4, 3.9, 3.6, 4.2, 4.4, 4.9]}
        />
        <StatCard
          icon={<Receipt />}
          label={c.kpi.avg}
          amount={412.5}
          format="money"
          delta={3.8}
          deltaLabel={c.kpi.vsLastYear}
        />
        <StatCard
          icon={<Wallet />}
          label={c.kpi.debt}
          amount={debtLeft}
          format="money"
          delta={22}
          invertDelta
          deltaLabel={c.kpi.vsLastMonth}
          sparkline={[1.2, 1.8, 2.1, 2.6, 3.0, 3.2, 3.48]}
        />
        <StatCard icon={<BadgePercent />} label={c.kpi.bonus} amount={1240} format="number" />
      </div>

      <Tabs
        aria-label={c.tabsLabel}
        keepMounted
        panelClassName="pt-4"
        tabs={[
          { id: "overview", label: c.tabs.overview, content: <OverviewTab /> },
          { id: "purchases", label: c.tabs.purchases, badge: RECEIPTS.length, content: <PurchasesTab /> },
          { id: "debt", label: c.tabs.debt, badge: 1, content: <DebtTab /> },
          { id: "history", label: c.tabs.history, content: <HistoryTab /> },
        ]}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <CustomerCardScreen />,
};

export const Tajik: Story = {
  name: "Tajik (тоҷикӣ)",
  render: () => (
    <TajUIProvider locale="tg">
      <CustomerCardScreen />
    </TajUIProvider>
  ),
};
