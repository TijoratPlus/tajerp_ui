import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { ApprovalCard, TajUIProvider } from "../../src";

const NOW = Date.now();
const MIN = 60_000;
const HOUR = 60 * MIN;

const meta: Meta<typeof ApprovalCard> = {
  title: "Components/Business/ApprovalCard",
  component: ApprovalCard,
  parameters: {
    docs: {
      description: {
        component:
          "A drafted action waiting for a person's «да»: supplier order, invoice, stock transfer, price change or SMS reminder. Use it in the approvals inbox, inside a TijoratAI ChatBubble and in notification previews. AI-drafted cards get a brand accent and an AI badge. `onApprove` / `onEdit` / `onReject` may return a Promise — the clicked button shows a spinner and the others are disabled until it settles. Set `requireRejectReason` to ask for a reason inline.",
      },
    },
  },
  decorators: [(Story) => <div style={{ maxWidth: 440 }}><Story /></div>],
};
export default meta;

type Story = StoryObj<typeof ApprovalCard>;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const orderItems = [
  { name: "Мука высший сорт «Ҷавоҳир», 50 кг", qty: 10, unit: "меш." },
  { name: "Сахар-песок, 50 кг", qty: 6, unit: "меш." },
  { name: "Масло подсолнечное «Олейна» 5 л", qty: 24, unit: "шт" },
  { name: "Рис девзира", qty: 40, unit: "кг" },
  { name: "Чай зелёный №95, 100 г", qty: 30, unit: "уп" },
  { name: "Макароны «Шебекинские» 450 г", qty: 40, unit: "уп" },
  { name: "Соль йодированная 1 кг", qty: 20, unit: "шт" },
  { name: "Горох колотый", qty: 15, unit: "кг" },
  { name: "Томатная паста 800 г", qty: 12, unit: "шт" },
  { name: "Сгущёнка «Рогачёв»", qty: 24, unit: "шт" },
  { name: "Мёд горный, 1 кг", qty: 6, unit: "шт" },
  { name: "Нут", qty: 10, unit: "кг" },
];

export const AISupplierOrder: Story = {
  name: "AI-drafted supplier order",
  render: () => (
    <ApprovalCard
      kind="purchase_order"
      summary="На складе «Душанбе, Корвон» заканчиваются 12 позиций. Остатков хватит на 2–3 дня при текущих продажах."
      amount={4850}
      requestedBy={{ name: "TijoratAI", kind: "ai" }}
      requestedAt={NOW - 4 * MIN}
      details={[
        { label: "Поставщик", value: "ООО «Сомон Трейд»" },
        { label: "Склад", value: "Душанбе, Корвон" },
        { label: "Доставка", value: "чт, 23.10" },
        { label: "Оплата", value: "Отсрочка 14 дней" },
      ]}
      items={orderItems}
      steps={[
        { approver: "Мадина, закупщик", status: "approved", decidedAt: NOW - 2 * MIN },
        { approver: "Владелец", note: "Заказы свыше 3 000 с", status: "pending" },
      ]}
      escalatesAt={NOW + 3 * HOUR}
      requireRejectReason
      onApprove={() => wait(1200)}
      onEdit={() => {}}
      onReject={() => wait(800)}
    />
  ),
};

export const SmsReminder: Story = {
  name: "SMS reminder to 5 debtors",
  render: () => (
    <ApprovalCard
      kind="sms"
      title="SMS-напоминание 5 должникам"
      summary="«Ассалому алейкум! Напоминаем о долге в магазине «Нур». Оплатить можно через Alif или на кассе.»"
      amount={7320.5}
      requestedBy={{ name: "TijoratAI", kind: "ai" }}
      requestedAt={NOW - 20 * MIN}
      details={[
        { label: "Получатели", value: "5 клиентов" },
        { label: "Канал", value: "SMS" },
        { label: "Отправка", value: "сегодня, 10:00" },
        { label: "Стоимость", value: "0,75 с" },
      ]}
      items={[
        { name: "Шарифов Д.", qty: 1, unit: "SMS" },
        { name: "Раҳимова М.", qty: 1, unit: "SMS" },
        { name: "Каримов А.", qty: 1, unit: "SMS" },
        { name: "Ҳусейнов Ф.", qty: 1, unit: "SMS" },
        { name: "Назарова З.", qty: 1, unit: "SMS" },
      ]}
      onApprove={() => wait(1000)}
      onEdit={() => {}}
      onReject={() => {}}
    />
  ),
};

export const Approved: Story = {
  render: () => (
    <ApprovalCard
      kind="transfer"
      summary="Перемещение 40 кг риса со склада «Хуҷанд» в магазин «Корвон»."
      requestedBy={{ name: "Фарход Каримов", kind: "user" }}
      requestedAt={NOW - 2 * HOUR}
      status="approved"
      steps={[{ approver: "Владелец", status: "approved", decidedAt: NOW - 90 * MIN }]}
      statusNote="Одобрил владелец через Telegram"
    />
  ),
};

export const Rejected: Story = {
  render: () => (
    <ApprovalCard
      kind="price_change"
      summary="Поднять цену на масло «Олейна» 5 л с 98,00 с до 105,00 с."
      requestedBy={{ name: "TijoratAI", kind: "ai" }}
      requestedAt={NOW - 26 * HOUR}
      status="rejected"
      steps={[{ approver: "Владелец", status: "rejected", decidedAt: NOW - 25 * HOUR }]}
      statusNote="Причина: у конкурентов на рынке «Корвон» цена 99 с"
    />
  ),
};

export const Expired: Story = {
  render: () => (
    <ApprovalCard
      kind="invoice"
      title="Счёт №А-1042 для «Нон-Бозор»"
      amount={1234.5}
      requestedBy={{ name: "Мадина", kind: "user" }}
      requestedAt={NOW - 3 * 24 * HOUR}
      status="expired"
    />
  ),
};

export const Tajik: Story = {
  name: "Tajik (тоҷикӣ)",
  render: () => (
    <TajUIProvider locale="tg">
      <ApprovalCard
        kind="purchase_order"
        summary="Дар анбори «Корвон» 12 номгӯи мол тамом шуда истодааст."
        amount={4850}
        requestedBy={{ name: "TijoratAI", kind: "ai" }}
        requestedAt={NOW - 4 * MIN}
        details={[
          { label: "Таъминкунанда", value: "ҶДММ «Сомон Трейд»" },
          { label: "Анбор", value: "Душанбе, Корвон" },
        ]}
        items={orderItems}
        steps={[
          { approver: "Мадина, харидор", status: "approved" },
          { approver: "Соҳибкор", status: "pending" },
        ]}
        escalatesAt={NOW + 3 * HOUR}
        requireRejectReason
        onApprove={() => wait(1000)}
        onEdit={() => {}}
        onReject={() => {}}
      />
    </TajUIProvider>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [status, setStatus] = React.useState<"pending" | "approved" | "rejected">("pending");
    const [note, setNote] = React.useState<string>();
    return (
      <ApprovalCard
        kind="purchase_order"
        amount={4850}
        requestedBy={{ name: "TijoratAI", kind: "ai" }}
        requestedAt={NOW - MIN}
        items={orderItems}
        status={status}
        statusNote={note}
        requireRejectReason
        onApprove={async () => {
          await wait(1000);
          setStatus("approved");
          setNote("Заказ отправлен поставщику в WhatsApp");
        }}
        onReject={async (reason) => {
          await wait(600);
          setStatus("rejected");
          setNote(`Причина: ${reason}`);
        }}
      />
    );
  },
};
