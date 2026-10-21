import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import {
  AIAssistantPanel,
  ApprovalCard,
  TajUIProvider,
  type AIMessage,
} from "../../src";

const meta: Meta<typeof AIAssistantPanel> = {
  title: "Components/Business/AIAssistantPanel",
  component: AIAssistantPanel,
  parameters: {
    docs: {
      description: {
        component:
          "The TijoratAI chat panel: header, a live conversation log that auto-scrolls unless the owner scrolled up, quick suggestions, a typing indicator and a composer (Enter sends, Shift+Enter adds a line, grows up to 6 lines). Drafted actions come as ApprovalCards inside assistant bubbles — nothing happens without the owner's «да». Give the panel a height; put it in a Sheet on desktop or full screen on phones.",
      },
    },
  },
  decorators: [(Story) => <div style={{ height: 640, maxWidth: 460 }}><Story /></div>],
};
export default meta;

type Story = StoryObj<typeof AIAssistantPanel>;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const NOW = Date.now();

const items = [
  { name: "Мука высший сорт, 50 кг", qty: 10, unit: "меш." },
  { name: "Сахар-песок, 50 кг", qty: 6, unit: "меш." },
  { name: "Масло подсолнечное 5 л", qty: 24, unit: "шт" },
  { name: "Рис девзира", qty: 40, unit: "кг" },
  { name: "Чай зелёный №95", qty: 30, unit: "уп" },
];

function OrderCard({ tg = false }: { tg?: boolean }) {
  const [status, setStatus] = React.useState<"pending" | "approved" | "rejected">("pending");
  return (
    <ApprovalCard
      kind="purchase_order"
      amount={4850}
      requestedBy={{ name: "TijoratAI", kind: "ai" }}
      requestedAt={NOW - 60_000}
      details={[
        { label: tg ? "Таъминкунанда" : "Поставщик", value: tg ? "ҶДММ «Сомон Трейд»" : "ООО «Сомон Трейд»" },
        { label: tg ? "Расонидан" : "Доставка", value: tg ? "панҷшанбе" : "чт, 23.10" },
      ]}
      items={items}
      status={status}
      requireRejectReason
      onApprove={async () => {
        await wait(1000);
        setStatus("approved");
      }}
      onEdit={() => {}}
      onReject={async () => {
        await wait(600);
        setStatus("rejected");
      }}
    />
  );
}

const ruConversation: AIMessage[] = [
  { id: "1", role: "user", author: "Фарход", time: "09:12", status: "read", content: "Что заканчивается?" },
  {
    id: "2",
    role: "assistant",
    time: "09:12",
    content:
      "На складе «Корвон» до конца недели закончатся 5 позиций: мука, сахар, масло, рис и чай. Я подготовил заказ «Сомон Трейд» — проверьте и одобрите.",
  },
  { id: "3", role: "assistant", time: "09:12", fullWidth: true, content: <OrderCard /> },
];

function Conversation({ initial, tg = false }: { initial: AIMessage[]; tg?: boolean }) {
  const [messages, setMessages] = React.useState(initial);
  const [typing, setTyping] = React.useState(false);
  const onSend = async (text: string) => {
    const id = String(Date.now());
    setMessages((m) => [...m, { id, role: "user", author: tg ? "Фарҳод" : "Фарход", time: new Date(), status: "sent", content: text }]);
    setTyping(true);
    await wait(1400);
    setTyping(false);
    setMessages((m) => [
      ...m,
      {
        id: id + "a",
        role: "assistant",
        time: new Date(),
        content: tg
          ? "Имрӯз даромад 12 480,00 с аст (64 чек)."
          : "Сегодня выручка 12 480,00 с (64 чека), прибыль ≈ 2 910,00 с.",
      },
    ]);
  };
  return (
    <AIAssistantPanel
      messages={messages}
      typing={typing}
      busy={typing}
      onSend={onSend}
      onVoice={() => {}}
      onClose={() => {}}
      suggestionsPlacement="always"
    />
  );
}

export const PurchaseOrderConversation: Story = {
  name: "Conversation with a purchase order",
  render: () => <Conversation initial={ruConversation} />,
};

export const Empty: Story = {
  render: () => {
    const [messages, setMessages] = React.useState<AIMessage[]>([]);
    return (
      <AIAssistantPanel
        messages={messages}
        onSend={(text) =>
          setMessages((m) => [...m, { id: String(m.length), role: "user", time: new Date(), content: text }])
        }
        onClose={() => {}}
      />
    );
  },
};

export const Typing: Story = {
  render: () => (
    <AIAssistantPanel
      messages={ruConversation.slice(0, 1)}
      typing
      busy
      onSend={() => {}}
    />
  ),
};

const tgConversation: AIMessage[] = [
  { id: "1", role: "user", author: "Фарҳод", time: "09:12", status: "read", content: "Чӣ тамом шуда истодааст?" },
  {
    id: "2",
    role: "assistant",
    time: "09:12",
    content:
      "Дар анбори «Корвон» то охири ҳафта 5 номгӯи мол тамом мешавад: орд, қанд, равған, биринҷ ва чой. Ман фармоишро ба «Сомон Трейд» омода кардам — санҷед ва тасдиқ кунед.",
  },
  { id: "3", role: "assistant", time: "09:12", fullWidth: true, content: <OrderCard tg /> },
];

export const Tajik: Story = {
  name: "Tajik (тоҷикӣ)",
  render: () => (
    <TajUIProvider locale="tg">
      <Conversation initial={tgConversation} tg />
    </TajUIProvider>
  ),
};
