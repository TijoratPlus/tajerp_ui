import type { Meta, StoryObj } from "@storybook/react";
import { CheckCheck, Inbox } from "lucide-react";
import * as React from "react";
import {
  AIAssistantPanel,
  ApprovalCard,
  Badge,
  EmptyState,
  ToggleGroup,
  ToggleGroupItem,
  Toaster,
  toast,
  useFormat,
  type AIMessage,
  type ApprovalCardProps,
  type ApprovalStatus,
} from "../../src";

const meta: Meta = {
  title: "Examples/AI Approvals",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Approvals inbox for TijoratAI drafts: pending ApprovalCards (supplier order, SMS to debtors, price change, stock transfer) filtered by a ToggleGroup with counts. Approve / Reject return a Promise (spinner on the card), then the card moves to «Обработано» and a toast offers «Отменить». The TijoratAI panel on the right explains each draft — nothing runs without the owner's «да».",
      },
    },
  },
  tags: ["!autodocs"],
};
export default meta;

type Story = StoryObj;

/** Fixed reference time for relative dates. */
const NOW = new Date(2026, 9, 21, 9, 40).getTime();
const MIN = 60_000;
const HOUR = 60 * MIN;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Filter = "all" | "orders" | "sms" | "prices";

interface Draft {
  id: string;
  group: Exclude<Filter, "all">;
  card: Omit<ApprovalCardProps, "onApprove" | "onReject" | "onEdit" | "status">;
  /** Toast text after approval. */
  approvedText: string;
}

interface Decision {
  status: Extract<ApprovalStatus, "approved" | "rejected">;
  reason?: string;
  at: number;
}

const AI = { name: "TijoratAI", kind: "ai" as const };

const DRAFTS: Draft[] = [
  {
    id: "po-0142",
    group: "orders",
    approvedText: "Заказ ЗП-00142 отправлен «Сомон Трейд»",
    card: {
      kind: "purchase_order",
      title: "Заказ поставщику ЗП-00142",
      summary: "До пятницы на складе «Корвон» закончатся 5 позиций. Цены как в прошлом заказе.",
      amount: 4850,
      requestedBy: AI,
      requestedAt: NOW - 12 * MIN,
      escalatesAt: NOW + 3 * HOUR,
      requireRejectReason: true,
      details: [
        { label: "Поставщик", value: "ООО «Сомон Трейд»" },
        { label: "Склад", value: "Корвон, Душанбе" },
        { label: "Доставка", value: "чт, 23.10" },
      ],
      items: [
        { name: "Мука высший сорт, 50 кг", qty: 10, unit: "меш." },
        { name: "Сахар-песок, 50 кг", qty: 6, unit: "меш." },
        { name: "Масло подсолнечное 5 л", qty: 24, unit: "шт" },
        { name: "Рис девзира", qty: 40, unit: "кг" },
        { name: "Чай зелёный №95", qty: 30, unit: "уп" },
      ],
      steps: [
        { approver: "Фарход, бухгалтер", note: "свыше 3 000 с", status: "approved", decidedAt: NOW - 8 * MIN },
        { approver: "Вы, владелец", status: "pending" },
      ],
    },
  },
  {
    id: "sms-debtors",
    group: "sms",
    approvedText: "SMS отправлены 5 должникам",
    card: {
      kind: "sms",
      title: "SMS-напоминание 5 должникам",
      summary:
        "«Ассалому алейкум! Напоминаем о долге в магазине «Нур». Оплатить можно через Alif или на кассе.»",
      amount: 7320.5,
      requestedBy: AI,
      requestedAt: NOW - 20 * MIN,
      details: [
        { label: "Получатели", value: "5 клиентов" },
        { label: "Отправка", value: "сегодня, 10:00" },
        { label: "Стоимость", value: "0,75 с" },
      ],
      items: [
        { name: "Шарифов Д. — 2 140,00 с", qty: 1, unit: "SMS" },
        { name: "Рахимова М. — 1 980,00 с", qty: 1, unit: "SMS" },
        { name: "Каримов А. — 1 450,50 с", qty: 1, unit: "SMS" },
        { name: "Хусейнов Ф. — 960,00 с", qty: 1, unit: "SMS" },
        { name: "Назарова З. — 790,00 с", qty: 1, unit: "SMS" },
      ],
    },
  },
  {
    id: "price-dairy",
    group: "prices",
    approvedText: "Новые цены на молочное применятся с завтрашнего дня",
    card: {
      kind: "price_change",
      title: "Новые цены: молочные продукты",
      summary: "Поставщик поднял закупочные цены на 6%. Чтобы сохранить наценку 18%, предлагаю изменить 4 позиции.",
      requestedBy: AI,
      requestedAt: NOW - 45 * MIN,
      details: [
        { label: "Позиций", value: "4" },
        { label: "Действует с", value: "ср, 22.10" },
        { label: "Филиалы", value: "все" },
      ],
      items: [
        { name: "Молоко 3,2% 1 л: 9,50 → 10,10 с", qty: 1, unit: "поз." },
        { name: "Кефир 1 л: 10,00 → 10,60 с", qty: 1, unit: "поз." },
        { name: "Сметана 20% 400 г: 14,00 → 14,90 с", qty: 1, unit: "поз." },
        { name: "Творог 5% 500 г: 22,00 → 23,30 с", qty: 1, unit: "поз." },
      ],
    },
  },
  {
    id: "tr-0031",
    group: "orders",
    approvedText: "Перемещение ПМ-0031 передано на склад",
    card: {
      kind: "transfer",
      title: "Перемещение ПМ-0031: Душанбе → Худжанд",
      summary: "В Худжанде заканчивается вода и соки, а на центральном складе их запас на 3 недели.",
      requestedBy: AI,
      requestedAt: NOW - 2 * HOUR,
      details: [
        { label: "Откуда", value: "Центральный склад" },
        { label: "Куда", value: "Худжанд, Ленина 12" },
        { label: "Машина", value: "пт, 24.10" },
      ],
      items: [
        { name: "Вода «Оби Зулол» 1,5 л", qty: 120, unit: "шт" },
        { name: "Сок яблочный 1 л", qty: 48, unit: "шт" },
        { name: "Кола 1,5 л", qty: 36, unit: "шт" },
      ],
    },
  },
];

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "orders", label: "Заказы" },
  { value: "sms", label: "SMS" },
  { value: "prices", label: "Цены" },
];

const CONVERSATION: AIMessage[] = [
  {
    id: "m1",
    role: "user",
    author: "Ахмадшох",
    time: NOW - 25 * MIN,
    status: "read",
    content: "Что ты подготовил на сегодня?",
  },
  {
    id: "m2",
    role: "assistant",
    time: NOW - 24 * MIN,
    content:
      "Четыре черновика ждут вашего решения. Самый срочный — заказ «Сомон Трейд» на 4 850,00 с: мука и масло закончатся в пятницу, а доставка идёт два дня. Фарход уже согласовал его как бухгалтер.",
  },
  {
    id: "m3",
    role: "assistant",
    time: NOW - 24 * MIN,
    content:
      "SMS-напоминание получат 5 клиентов с долгом старше 10 дней — всего 7 320,50 с. Отправка стоит 0,75 с. Новые цены на молочное сохраняют наценку 18% после повышения у поставщика.",
  },
  {
    id: "m4",
    role: "user",
    author: "Ахмадшох",
    time: NOW - 5 * MIN,
    status: "read",
    content: "Зачем перемещение в Худжанд?",
  },
  {
    id: "m5",
    role: "assistant",
    time: NOW - 5 * MIN,
    content:
      "В Худжанде воды осталось на 2 дня, а на центральном складе — на 3 недели. Перемещение дешевле нового заказа. Ничего не выполняется без вашего «да».",
  },
];

function Count({ n }: { n: number }) {
  return (
    <span className="ml-1.5 inline-flex min-w-5 items-center justify-center !rounded-pill bg-ui-surface-2 px-1.5 text-ui-caption font-bold tabular-nums text-ink-2">
      {n}
    </span>
  );
}

function AIApprovalsScreen() {
  const { money } = useFormat();
  const [filter, setFilter] = React.useState<Filter>("all");
  const [decisions, setDecisions] = React.useState<Record<string, Decision>>({});
  const [messages, setMessages] = React.useState<AIMessage[]>(CONVERSATION);
  const [typing, setTyping] = React.useState(false);

  const pending = DRAFTS.filter((d) => !decisions[d.id]);
  const processed = DRAFTS.filter((d) => decisions[d.id]).sort(
    (a, b) => decisions[b.id]!.at - decisions[a.id]!.at,
  );
  const countOf = (f: Filter) => pending.filter((d) => f === "all" || d.group === f).length;
  const visible = pending.filter((d) => filter === "all" || d.group === filter);

  const undo = (id: string) =>
    setDecisions((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

  const decide = (draft: Draft, status: Decision["status"], reason?: string) => {
    setDecisions((prev) => ({ ...prev, [draft.id]: { status, reason, at: Date.now() } }));
    const action = { label: "Отменить", onClick: () => undo(draft.id) };
    if (status === "approved") {
      toast.success(draft.approvedText, { action, id: `decision-${draft.id}` });
    } else {
      toast.info(`Отклонено: ${draft.card.title as string}`, {
        description: reason,
        action,
        id: `decision-${draft.id}`,
      });
    }
  };

  const onSend = async (text: string) => {
    const id = `u${messages.length}`;
    setMessages((m) => [...m, { id, role: "user", author: "Ахмадшох", time: new Date(), status: "sent", content: text }]);
    setTyping(true);
    await wait(1200);
    setTyping(false);
    setMessages((m) => [
      ...m,
      {
        id: `${id}a`,
        role: "assistant",
        time: new Date(),
        content: `Осталось черновиков: ${pending.length}. Общая сумма заказов и долгов в них — ${money(4850 + 7320.5)}. Откройте карточку слева, чтобы одобрить или отклонить.`,
      },
    ]);
  };

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_420px]">
      <main className="flex min-w-0 flex-col gap-5">
        <header className="flex flex-wrap items-end gap-3">
          <div className="mr-auto">
            <h1 className="text-xl font-bold text-ink-1">Ждут вашего решения</h1>
            <p className="mt-1 text-ui-control text-ink-3">
              TijoratAI готовит черновики — ничего не выполняется без вашего «да».
            </p>
          </div>
          <Badge tone={pending.length > 0 ? "warning" : "success"}>
            {pending.length > 0 ? `${pending.length} на согласовании` : "Всё обработано"}
          </Badge>
        </header>

        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          aria-label="Тип черновика"
          value={filter}
          onValueChange={(v) => v && setFilter(v as Filter)}
          className="flex-wrap"
        >
          {FILTERS.map((f) => (
            <ToggleGroupItem key={f.value} value={f.value}>
              {f.label}
              <Count n={countOf(f.value)} />
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <section aria-labelledby="pending-heading" className="flex flex-col gap-4">
          <h2 id="pending-heading" className="sr-only">
            На согласовании
          </h2>
          {visible.length === 0 ? (
            <EmptyState
              icon={<Inbox aria-hidden />}
              title="Здесь пусто"
              description="Новых черновиков этого типа нет. TijoratAI сообщит, когда появятся."
            />
          ) : (
            visible.map((d) => (
              <ApprovalCard
                key={d.id}
                {...d.card}
                now={NOW}
                status="pending"
                onApprove={() => wait(900).then(() => decide(d, "approved"))}
                onReject={(reason) => wait(600).then(() => decide(d, "rejected", reason))}
                onEdit={() => {
                  toast.info("Черновик открыт для редактирования");
                }}
              />
            ))
          )}
        </section>

        {processed.length > 0 ? (
          <section aria-labelledby="processed-heading" className="flex flex-col gap-3">
            <h2 id="processed-heading" className="flex items-center gap-2 text-ui-title font-bold text-ink-1">
              <CheckCheck className="size-4 text-ink-3" aria-hidden />
              Обработано
              <Count n={processed.length} />
            </h2>
            {processed.map((d) => {
              const decision = decisions[d.id]!;
              return (
                <ApprovalCard
                  key={d.id}
                  {...d.card}
                  now={NOW}
                  headingLevel={3}
                  status={decision.status}
                  statusNote={
                    decision.status === "approved"
                      ? "Одобрено вами только что"
                      : `Отклонено вами${decision.reason ? ` · ${decision.reason}` : ""}`
                  }
                />
              );
            })}
          </section>
        ) : null}
      </main>

      <aside className="h-[640px] lg:sticky lg:top-6 lg:h-[calc(100vh-48px)]">
        <AIAssistantPanel
          className="h-full"
          messages={messages}
          typing={typing}
          busy={typing}
          onSend={onSend}
          suggestions={["Что срочнее?", "Почему эти цены?", "Кто из должников платит чаще?"]}
          suggestionsPlacement="always"
        />
      </aside>

      <Toaster />
    </div>
  );
}

export const Default: Story = {
  render: () => <AIApprovalsScreen />,
};
