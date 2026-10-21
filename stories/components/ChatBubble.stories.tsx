import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarFallback, ChatBubble, TajUIProvider } from "../../src";

const meta: Meta<typeof ChatBubble> = {
  title: "Components/Business/ChatBubble",
  component: ChatBubble,
  parameters: {
    docs: {
      description: {
        component:
          "One message in a TijoratAI or customer conversation. User messages align right, assistant left, system notices centre. Shows the channel (Telegram, WhatsApp, SMS, app — text label + generic icon), the delivery status with a retry on error, and accepts any node as content, e.g. an ApprovalCard.",
      },
    },
  },
  args: { role: "assistant", children: "Сегодня выручка 12 480,00 с — на 8% больше, чем вчера." },
  decorators: [(Story) => <div style={{ maxWidth: 520, display: "flex", flexDirection: "column", gap: 12 }}><Story /></div>],
};
export default meta;

type Story = StoryObj<typeof ChatBubble>;

const ai = (
  <Avatar className="size-8">
    <AvatarFallback className="bg-brand-solid text-on-brand text-ui-caption">AI</AvatarFallback>
  </Avatar>
);
const owner = (
  <Avatar className="size-8">
    <AvatarFallback className="text-ui-caption">ФК</AvatarFallback>
  </Avatar>
);

export const Playground: Story = {};

export const Telegram: Story = {
  render: () => (
    <>
      <ChatBubble role="user" author="Фарход" avatar={owner} time="09:12" channel="telegram" status="read">
        Сколько я заработал сегодня?
      </ChatBubble>
      <ChatBubble role="assistant" avatar={ai} time="09:12" channel="telegram">
        Выручка с 08:00 — 12 480,00 с (64 чека). Прибыль ≈ 2 910,00 с.
      </ChatBubble>
    </>
  ),
};

export const WhatsApp: Story = {
  render: () => (
    <>
      <ChatBubble role="assistant" avatar={ai} time="18:40" channel="whatsapp">
        3 клиента должны больше 1 000 с. Отправить им напоминание?
      </ChatBubble>
      <ChatBubble role="user" author="Фарход" avatar={owner} time="18:41" channel="whatsapp" status="sending">
        Да, только Шарифову не надо
      </ChatBubble>
    </>
  ),
};

export const Sms: Story = {
  name: "SMS (with error)",
  render: () => (
    <>
      <ChatBubble role="system">Напоминание о долге отправлено 5 клиентам</ChatBubble>
      <ChatBubble role="user" author="Магазин «Нур»" time="10:00" channel="sms" status="error" onRetry={() => {}}>
        Ассалому алейкум! Напоминаем о долге 1 250,00 с в магазине «Нур».
      </ChatBubble>
      <ChatBubble role="user" author="Магазин «Нур»" time="10:00" channel="sms" status="sent">
        Ассалому алейкум! Напоминаем о долге 640,00 с в магазине «Нур».
      </ChatBubble>
    </>
  ),
};

export const Tajik: Story = {
  name: "Tajik (тоҷикӣ)",
  render: () => (
    <TajUIProvider locale="tg">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <ChatBubble role="user" author="Фарҳод" avatar={owner} time="09:15" channel="app" status="read">
          Кӣ ба ман қарздор аст?
        </ChatBubble>
        <ChatBubble role="assistant" avatar={ai} time="09:15" channel="app">
          5 мизоҷ ҳамагӣ 7 320,50 с қарздоранд. Ба онҳо ёдраси SMS фиристам?
        </ChatBubble>
      </div>
    </TajUIProvider>
  ),
};
