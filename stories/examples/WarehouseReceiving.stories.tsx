import type { Meta, StoryObj } from "@storybook/react";
import { AlertTriangle, CheckCircle2, Save } from "lucide-react";
import * as React from "react";
import {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConfirmHost,
  DataTable,
  DatePicker,
  DescriptionList,
  FileUpload,
  Label,
  MoneyInput,
  NumberField,
  Stepper,
  TajUIProvider,
  Toaster,
  addDays,
  confirm,
  startOfDay,
  toast,
  useFormat,
  type DataTableColumn,
  type StepperStep,
} from "../../src";

const meta: Meta = {
  title: "Examples/Warehouse Receiving",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Goods-receipt document (Приход товара) for a pharmacy warehouse: Breadcrumb, Stepper, a DescriptionList header with a DatePicker, a DataTable of editable lines (NumberField quantity, DatePicker expiry with a warning Badge under 30 days, MoneyInput price) with a totals footer, Excel import via FileUpload, and posting confirmed with `confirm()`.",
      },
    },
  },
  tags: ["!autodocs"],
};
export default meta;

type Story = StoryObj;

// ── Texts (component strings localize on their own) ─────────────────

const RU = {
  crumbs: ["Склад", "Приход товара"],
  title: "Приход товара",
  draft: "Черновик",
  posted: "Проведён",
  steps: ["Документ", "Позиции", "Проверка", "Проведение"],
  stepsHint: ["Поставщик и склад", "Товары и цены", "Сроки и суммы", "Обновление остатков"],
  header: "Реквизиты документа",
  supplier: "Поставщик",
  warehouse: "Склад",
  date: "Дата",
  number: "Номер",
  basis: "Основание",
  supplierValue: "ООО «Дорусоз»",
  supplierHint: "ИНН 020 334 118 · отсрочка 30 дней",
  warehouseValue: "Аптека «Шифо», Душанбе — основной склад",
  basisValue: "Заказ поставщику ЗП-00142",
  lines: "Позиции",
  colName: "Наименование",
  colBarcode: "Штрихкод",
  colQty: "Кол-во",
  colUnit: "Ед.",
  colExpiry: "Срок годности",
  colPrice: "Цена закупки",
  colTotal: "Сумма",
  total: "Итого",
  positions: (n: number) => `${n} поз.`,
  qtyOf: (name: string) => `Количество: ${name}`,
  expiryOf: (name: string) => `Срок годности: ${name}`,
  priceOf: (name: string) => `Цена закупки: ${name}`,
  expired: "Просрочен",
  daysLeft: (n: number) => `Осталось ${n} дн.`,
  importLabel: "Импорт позиций из Excel",
  importTitle: "Перетащите накладную поставщика (Excel)",
  importHint: "XLSX, XLS или CSV · до 5 МБ · колонки: наименование, штрихкод, кол-во, цена, срок",
  imported: (n: number, file: string) => `Добавлено ${n} поз. из «${file}»`,
  alertTitle: "Проверьте сроки годности",
  alertText:
    "Товары со сроком меньше 30 дней отмечены жёлтым, просроченные — красным. Такие позиции лучше вернуть поставщику до проведения.",
  saveDraft: "Сохранить черновик",
  post: "Провести",
  draftSaved: "Черновик сохранён",
  draftSavedText: (n: string) => `Документ ${n} можно продолжить позже.`,
  confirmTitle: (n: string) => `Провести документ ${n}?`,
  confirmText: (sum: string, warn: number) =>
    `Остатки склада увеличатся, долг поставщику — на ${sum}.` +
    (warn ? ` Внимание: ${warn} поз. с коротким или истёкшим сроком годности.` : ""),
  confirmLabel: "Провести",
  postedToast: (n: string) => `Документ ${n} проведён`,
  postedText: "Остатки обновлены, кассы получат их при следующей синхронизации.",
};

type Texts = typeof RU;

const TG: Texts = {
  crumbs: ["Анбор", "Воридоти мол"],
  title: "Воридоти мол",
  draft: "Сиёҳнавис",
  posted: "Гузаронида шуд",
  steps: ["Ҳуҷҷат", "Мавқеъҳо", "Санҷиш", "Гузаронидан"],
  stepsHint: ["Таъминкунанда ва анбор", "Мол ва нархҳо", "Мӯҳлатҳо ва маблағҳо", "Навсозии бақия"],
  header: "Маълумоти ҳуҷҷат",
  supplier: "Таъминкунанда",
  warehouse: "Анбор",
  date: "Сана",
  number: "Рақам",
  basis: "Асос",
  supplierValue: "ҶДММ «Дорусоз»",
  supplierHint: "РМА 020 334 118 · мӯҳлати пардохт 30 рӯз",
  warehouseValue: "Дорухонаи «Шифо», Душанбе — анбори асосӣ",
  basisValue: "Фармоиш ба таъминкунанда ЗП-00142",
  lines: "Мавқеъҳо",
  colName: "Номгӯй",
  colBarcode: "Штрихкод",
  colQty: "Миқдор",
  colUnit: "Воҳид",
  colExpiry: "Мӯҳлати истифода",
  colPrice: "Нархи харид",
  colTotal: "Маблағ",
  total: "Ҳамагӣ",
  positions: (n: number) => `${n} мавқеъ`,
  qtyOf: (name: string) => `Миқдор: ${name}`,
  expiryOf: (name: string) => `Мӯҳлати истифода: ${name}`,
  priceOf: (name: string) => `Нархи харид: ${name}`,
  expired: "Мӯҳлаташ гузаштааст",
  daysLeft: (n: number) => `${n} рӯз монд`,
  importLabel: "Воридоти мавқеъҳо аз Excel",
  importTitle: "Борхати таъминкунандаро ба ин ҷо кашед (Excel)",
  importHint: "XLSX, XLS ё CSV · то 5 МБ · сутунҳо: номгӯй, штрихкод, миқдор, нарх, мӯҳлат",
  imported: (n: number, file: string) => `${n} мавқеъ аз «${file}» илова шуд`,
  alertTitle: "Мӯҳлати истифодаро санҷед",
  alertText:
    "Молҳое, ки мӯҳлаташон камтар аз 30 рӯз аст, бо ранги зард, мӯҳлатгузаштаҳо бо сурх қайд шудаанд. Беҳтар аст онҳоро пеш аз гузаронидан ба таъминкунанда баргардонед.",
  saveDraft: "Сабти сиёҳнавис",
  post: "Гузаронидан",
  draftSaved: "Сиёҳнавис сабт шуд",
  draftSavedText: (n: string) => `Ҳуҷҷати ${n}-ро баъдтар идома додан мумкин аст.`,
  confirmTitle: (n: string) => `Ҳуҷҷати ${n} гузаронида шавад?`,
  confirmText: (sum: string, warn: number) =>
    `Бақияи анбор зиёд мешавад, қарз ба таъминкунанда — ба андозаи ${sum}.` +
    (warn ? ` Диққат: ${warn} мавқеъ мӯҳлати кӯтоҳ ё гузашта дорад.` : ""),
  confirmLabel: "Гузаронидан",
  postedToast: (n: string) => `Ҳуҷҷати ${n} гузаронида шуд`,
  postedText: "Бақия нав шуд, хазинаҳо онро ҳангоми ҳамоҳангсозии навбатӣ мегиранд.",
};

// ── Sample data ─────────────────────────────────────────────────────

interface Line {
  id: string;
  name: string;
  barcode: string;
  qty: number;
  unit: string;
  expiry?: Date;
  price: number;
}

const DOC_NUMBER = "ПТ-000318";
const TODAY = startOfDay(new Date());

const INITIAL_LINES: Line[] = [
  { id: "l1", name: "Парацетамол 500 мг, таб. №20", barcode: "4870204390016", qty: 100, unit: "уп", expiry: addDays(TODAY, 540), price: 6.5 },
  { id: "l2", name: "Ибупрофен 400 мг, таб. №30", barcode: "4870204390023", qty: 40, unit: "уп", expiry: addDays(TODAY, 21), price: 14.8 },
  { id: "l3", name: "Нурофен для детей, сироп 100 мл", barcode: "5000158100145", qty: 12, unit: "фл", expiry: addDays(TODAY, 9), price: 48 },
  { id: "l4", name: "Регидрон, порошок, пак. №20", barcode: "6430000270102", qty: 25, unit: "уп", expiry: addDays(TODAY, 365), price: 39.9 },
  { id: "l5", name: "Перекись водорода 3%, 100 мл", barcode: "4870204390047", qty: 60, unit: "фл", expiry: addDays(TODAY, -5), price: 3.2 },
  { id: "l6", name: "Бинт стерильный 7 × 14 см", barcode: "4870204390054", qty: 200, unit: "шт", expiry: addDays(TODAY, 1460), price: 2.4 },
];

const IMPORTED_LINES: Line[] = [
  { id: "i1", name: "Аскорбиновая кислота с глюкозой, таб. №10", barcode: "4870204390061", qty: 150, unit: "уп", expiry: addDays(TODAY, 270), price: 1.9 },
  { id: "i2", name: "Цитрамон П, таб. №10", barcode: "4870204390078", qty: 80, unit: "уп", expiry: addDays(TODAY, 27), price: 4.6 },
];

const daysUntil = (d: Date) => Math.round((startOfDay(d).getTime() - TODAY.getTime()) / 86_400_000);
const lineTotal = (l: Line) => Math.round(l.qty * l.price * 100) / 100;
const isShortExpiry = (l: Line) => !!l.expiry && daysUntil(l.expiry) < 30;

// ── Screen ──────────────────────────────────────────────────────────

function ReceivingScreen({ text }: { text: Texts }) {
  const fmt = useFormat();
  const [lines, setLines] = React.useState<Line[]>(INITIAL_LINES);
  const [docDate, setDocDate] = React.useState<Date | undefined>(TODAY);
  const [files, setFiles] = React.useState<File[]>([]);
  const [importedFrom, setImportedFrom] = React.useState<string | null>(null);
  const [step, setStep] = React.useState(1);
  const [posted, setPosted] = React.useState(false);
  const [posting, setPosting] = React.useState(false);

  const patch = (id: string, change: Partial<Line>) =>
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...change } : l)));

  const sum = lines.reduce((s, l) => s + lineTotal(l), 0);
  const warnings = lines.filter(isShortExpiry).length;

  const onFiles = (next: File[]) => {
    setFiles(next);
    const file = next[0];
    if (!file || importedFrom === file.name) return;
    setImportedFrom(file.name);
    setLines((ls) => [...ls.filter((l) => !l.id.startsWith("i")), ...IMPORTED_LINES]);
    toast.success(text.imported(IMPORTED_LINES.length, file.name));
  };

  const saveDraft = () =>
    toast.success(text.draftSaved, { description: text.draftSavedText(DOC_NUMBER) });

  const post = async () => {
    setStep(2);
    const ok = await confirm({
      title: text.confirmTitle(DOC_NUMBER),
      description: text.confirmText(fmt.money(sum), warnings),
      confirmLabel: text.confirmLabel,
      tone: "brand",
    });
    if (!ok) return;
    setStep(3);
    setPosting(true);
    await new Promise((r) => setTimeout(r, 700));
    setPosting(false);
    setPosted(true);
    setStep(4);
    toast.success(text.postedToast(DOC_NUMBER), { description: text.postedText });
  };

  const steps: StepperStep[] = text.steps.map((label, i) => ({
    id: `s${i}`,
    label,
    description: text.stepsHint[i],
  }));

  const columns: DataTableColumn<Line>[] = [
    {
      key: "name",
      header: text.colName,
      width: 280,
      sortable: true,
      sortAccessor: (l) => l.name,
      cell: (l) => <span className="font-medium text-ink-1">{l.name}</span>,
      footer: (rows) => (
        <span className="font-semibold text-ink-1">
          {text.total}: {text.positions(rows.length)}
        </span>
      ),
    },
    {
      key: "barcode",
      header: text.colBarcode,
      width: 150,
      cell: (l) => <span className="font-mono tabular-nums text-ink-3">{l.barcode}</span>,
    },
    {
      key: "qty",
      header: text.colQty,
      align: "right",
      width: 150,
      cell: (l) => (
        <NumberField
          size="sm"
          min={0}
          aria-label={text.qtyOf(l.name)}
          value={l.qty}
          disabled={posted}
          onValueChange={(qty) => patch(l.id, { qty })}
        />
      ),
      footer: (rows) => (
        <span className="tabular-nums font-semibold text-ink-1">
          {fmt.number(rows.reduce((s, l) => s + l.qty, 0))}
        </span>
      ),
    },
    {
      key: "unit",
      header: text.colUnit,
      width: 60,
      cell: (l) => <span className="text-ink-2">{l.unit}</span>,
    },
    {
      key: "expiry",
      header: text.colExpiry,
      width: 220,
      sortable: true,
      sortAccessor: (l) => l.expiry?.getTime(),
      cell: (l) => {
        const days = l.expiry ? daysUntil(l.expiry) : undefined;
        return (
          <div className="flex flex-col items-start gap-1">
            <DatePicker
              size="sm"
              aria-label={text.expiryOf(l.name)}
              value={l.expiry}
              disabled={posted}
              onValueChange={(expiry) => patch(l.id, { expiry })}
            />
            {days !== undefined && days < 0 ? (
              <Badge tone="danger" size="sm">
                <AlertTriangle className="size-3" aria-hidden /> {text.expired}
              </Badge>
            ) : days !== undefined && days < 30 ? (
              <Badge tone="warning" size="sm">
                <AlertTriangle className="size-3" aria-hidden /> {text.daysLeft(days)}
              </Badge>
            ) : null}
          </div>
        );
      },
    },
    {
      key: "price",
      header: text.colPrice,
      align: "right",
      width: 150,
      cell: (l) => (
        <MoneyInput
          size="sm"
          min={0}
          aria-label={text.priceOf(l.name)}
          value={l.price}
          disabled={posted}
          onValueChange={(price) => patch(l.id, { price: price ?? 0 })}
        />
      ),
    },
    {
      key: "total",
      header: text.colTotal,
      align: "right",
      width: 140,
      sortable: true,
      sortAccessor: lineTotal,
      cell: (l) => <span className="tabular-nums font-semibold text-ink-1">{fmt.money(lineTotal(l))}</span>,
      footer: (rows) => (
        <span className="tabular-nums font-bold text-ink-1">
          {fmt.money(rows.reduce((s, l) => s + lineTotal(l), 0))}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-dvh bg-ui-bg text-ink-1">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 p-4 md:p-6">
        <div className="flex flex-col gap-2">
          <Breadcrumb
            items={[
              { label: text.crumbs[0], href: "#" },
              { label: text.crumbs[1], href: "#" },
              { label: DOC_NUMBER },
            ]}
          />
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-(length:--tj-fs-lg) font-bold text-ink-1">
              {text.title} {DOC_NUMBER}
            </h1>
            {posted ? (
              <Badge tone="success">
                <CheckCircle2 className="size-3.5" aria-hidden /> {text.posted}
              </Badge>
            ) : (
              <Badge tone="neutral">{text.draft}</Badge>
            )}
            <div className="ml-auto flex gap-2">
              <Button
                variant="subtle"
                size="md"
                disabled={posted}
                iconLeft={<Save className="size-4" aria-hidden />}
                onClick={saveDraft}
              >
                {text.saveDraft}
              </Button>
              <Button size="md" disabled={posted || lines.length === 0} loading={posting} onClick={post}>
                {text.post}
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <CardContent>
            <Stepper steps={steps} activeStep={step} onStepClick={posted ? undefined : (i) => setStep(i)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{text.header}</CardTitle>
          </CardHeader>
          <CardContent>
            <DescriptionList
              layout="grid"
              columns={3}
              items={[
                { term: text.number, description: DOC_NUMBER, copyable: true },
                {
                  term: text.date,
                  description: (
                    <DatePicker
                      size="sm"
                      aria-label={text.date}
                      value={docDate}
                      disabled={posted}
                      onValueChange={setDocDate}
                    />
                  ),
                },
                { term: text.basis, description: text.basisValue },
                { term: text.supplier, description: text.supplierValue, hint: text.supplierHint },
                { term: text.warehouse, description: text.warehouseValue },
              ]}
            />
          </CardContent>
        </Card>

        <Alert tone="info" title={text.alertTitle} description={text.alertText} />

        <DataTable<Line>
          title={text.lines}
          titleAs="h2"
          data={lines}
          columns={columns}
          rowKey={(l) => l.id}
          bordered
        />

        <div className="flex max-w-xl flex-col gap-2">
          <Label htmlFor="receiving-import">{text.importLabel}</Label>
          <FileUpload
            id="receiving-import"
            accept=".xlsx,.xls,.csv"
            maxSize={5 * 1024 * 1024}
            title={text.importTitle}
            description={text.importHint}
            value={files}
            onValueChange={onFiles}
            disabled={posted}
          />
        </div>
      </div>
      <ConfirmHost />
      <Toaster />
    </div>
  );
}

export const Default: Story = {
  render: () => <ReceivingScreen text={RU} />,
};

export const Tajik: Story = {
  name: "Тоҷикӣ",
  render: () => (
    <TajUIProvider locale="tg">
      <ReceivingScreen text={TG} />
    </TajUIProvider>
  ),
};
