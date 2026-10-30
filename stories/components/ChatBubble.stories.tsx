import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarFallback, ChatBubble, TajUIProvider } from "../../src";

const meta: Meta<typeof ChatBubble> = {
  title: "Components/Business/ChatBubble",
  component: ChatBubble,
  parameters: {
    docs: {
      description: {
        component:
          "One message in a TijoratAI or customer conversation. User (outgoing) messages align right, assistant/customer messages left, system notices centre. Shows the channel (Telegram, WhatsApp, Instagram, Messenger, SMS, app — icon + text label), the delivery status (sending → sent ✓ → delivered ✓✓ → read ✓✓ in green, or error with retry), an optional `media` attachment (image, video, voice, file), and accepts any node as content, e.g. an ApprovalCard. Inside a `ChatThread`, pass the `grouped` position so runs of messages share one meta line. `tone=\"neutral\"` gives outgoing bubbles a soft mist fill instead of brand green.",
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

const client = (
  <Avatar className="size-8">
    <AvatarFallback className="text-ui-caption">МК</AvatarFallback>
  </Avatar>
);

/** Instagram DM thread: a run of client messages, then the manager's reply (neutral tone). */
export const InstagramGrouped: Story = {
  name: "Instagram (grouped, neutral tone)",
  render: () => (
    <>
      <ChatBubble role="assistant" author="Мадина" avatar={client} channel="instagram" time="11:02" grouped="first">
        Салом! Ин курта ҳаст?
      </ChatBubble>
      <ChatBubble role="assistant" author="Мадина" avatar={client} channel="instagram" time="11:02" grouped="middle">
        Размер M, ранги кабуд
      </ChatBubble>
      <ChatBubble role="assistant" author="Мадина" avatar={client} channel="instagram" time="11:03" grouped="last" status="received">
        Нархаш чанд?
      </ChatBubble>
      <ChatBubble role="user" author="Магазин «Нур»" tone="neutral" channel="instagram" time="11:05" grouped="first">
        Здравствуйте! Да, есть.
      </ChatBubble>
      <ChatBubble role="user" author="Магазин «Нур»" tone="neutral" channel="instagram" time="11:05" grouped="last" status="delivered">
        Цена 320,00 с, доставка по Душанбе бесплатно.
      </ChatBubble>
    </>
  ),
};

export const Messenger: Story = {
  render: () => (
    <>
      <ChatBubble role="assistant" author="Бахтиёр" channel="messenger" time="16:20">
        Доставка в Худжанд есть?
      </ChatBubble>
      <ChatBubble role="user" author="Вы" channel="messenger" time="16:22" status="read">
        Да, 2–3 дня, 25,00 с.
      </ChatBubble>
    </>
  ),
};

export const Statuses: Story = {
  render: () => (
    <>
      <ChatBubble role="user" time="12:00" status="sending">Отправляется</ChatBubble>
      <ChatBubble role="user" time="12:00" status="sent">Отправлено — одна галочка</ChatBubble>
      <ChatBubble role="user" time="12:01" status="delivered">Доставлено — две серые галочки</ChatBubble>
      <ChatBubble role="user" time="12:02" status="read">Прочитано — две зелёные галочки</ChatBubble>
      <ChatBubble role="user" time="12:03" status="error" onRetry={() => {}}>Не отправлено</ChatBubble>
    </>
  ),
};

const photo =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320"><rect width="480" height="320" fill="#d1f4e2"/><circle cx="240" cy="150" r="70" fill="#1d9f6e"/><text x="240" y="290" font-family="Inter, sans-serif" font-size="22" text-anchor="middle" fill="#0d4430">курта-синяя.jpg</text></svg>',
  );

export const Media: Story = {
  render: () => (
    <>
      <ChatBubble
        role="assistant"
        author="Мадина"
        channel="whatsapp"
        time="09:40"
        media={{ kind: "image", src: photo, name: "курта-синяя.jpg", onOpen: () => {} }}
      >
        Вот такой цвет нужен
      </ChatBubble>
      <ChatBubble
        role="user"
        channel="whatsapp"
        time="09:42"
        status="read"
        media={{ kind: "file", src: "#", name: "Счёт №1042.pdf" }}
      />
    </>
  ),
};
