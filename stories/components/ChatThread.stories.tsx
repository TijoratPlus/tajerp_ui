import type { Meta, StoryObj } from "@storybook/react";
import { MessagesSquare } from "lucide-react";
import * as React from "react";

import {
  Avatar,
  AvatarFallback,
  ChatBubble,
  ChatComposer,
  ChatThread,
  EmptyState,
  type ChatChannel,
  type ChatMessageStatus,
} from "../../src";

interface Message {
  id: string;
  direction: "in" | "out";
  author: string;
  at: Date;
  text: string;
  status?: ChatMessageStatus;
  channel: ChatChannel;
}

const meta: Meta = {
  title: "Components/Business/ChatThread",
  component: ChatThread,
  parameters: {
    docs: {
      description: {
        component:
          "Scrolling message list for one conversation. It owns its scroll — put it in a flex column with `min-h-0 flex-1` and it fills the space above the composer. Adds day separators («Сегодня», «Вчера», dates), groups messages by author within 5 minutes and hands each one its `grouped` position for `ChatBubble`, follows new messages unless the reader scrolled up (then a «Новые сообщения ↓» pill appears), and loads older messages at the top via `onLoadOlder` / `hasOlder`.",
      },
    },
  },
};
export default meta;

type Story = StoryObj;

const now = new Date();
const at = (daysAgo: number, h: number, m: number) =>
  new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo, h, m);

const SEED: Message[] = [
  {
    id: "1",
    direction: "in",
    author: "Мадина",
    at: at(3, 18, 4),
    text: "Салом! Шумо то кай кор мекунед?",
    channel: "instagram",
  },
  {
    id: "2",
    direction: "out",
    author: "Вы",
    at: at(3, 18, 10),
    text: "Здравствуйте! Каждый день с 9:00 до 20:00.",
    status: "read",
    channel: "instagram",
  },
  {
    id: "3",
    direction: "in",
    author: "Мадина",
    at: at(1, 10, 31),
    text: "Ин курта ҳаст?",
    channel: "instagram",
  },
  {
    id: "4",
    direction: "in",
    author: "Мадина",
    at: at(1, 10, 32),
    text: "Размер M, ранги кабуд",
    channel: "instagram",
  },
  {
    id: "5",
    direction: "out",
    author: "Вы",
    at: at(1, 10, 40),
    text: "Да, есть. 320,00 с.",
    status: "read",
    channel: "instagram",
  },
  {
    id: "6",
    direction: "out",
    author: "Вы",
    at: at(1, 10, 41),
    text: "Доставка по Душанбе бесплатно.",
    status: "read",
    channel: "instagram",
  },
  {
    id: "7",
    direction: "in",
    author: "Мадина",
    at: at(0, 9, 15),
    text: "Хуб, фардо гирифта метавонам?",
    channel: "instagram",
  },
  {
    id: "8",
    direction: "in",
    author: "Мадина",
    at: at(0, 9, 16),
    text: "Суроға: Рудакӣ 45",
    channel: "instagram",
  },
  {
    id: "9",
    direction: "out",
    author: "Вы",
    at: at(0, 9, 20),
    text: "Конечно, курьер привезёт с 12:00 до 14:00.",
    status: "delivered",
    channel: "instagram",
  },
];

const client = (
  <Avatar size="sm">
    <AvatarFallback>МК</AvatarFallback>
  </Avatar>
);

function renderMessage(
  m: Message,
  grouped: "single" | "first" | "middle" | "last",
) {
  const out = m.direction === "out";
  return (
    <ChatBubble
      role={out ? "user" : "assistant"}
      author={m.author}
      avatar={out ? undefined : client}
      time={m.at}
      status={m.status}
      channel={
        grouped === "single" || grouped === "last" ? m.channel : undefined
      }
      tone="neutral"
      grouped={grouped}
    >
      {m.text}
    </ChatBubble>
  );
}

const frame =
  "flex h-[560px] max-w-[760px] flex-col overflow-hidden !rounded-xl border border-hairline bg-ui-surface";

/** Thread + composer, as on the CRM inbox. Send a message, or scroll up and wait for the client. */
export const Conversation: Story = {
  render: () => {
    const [items, setItems] = React.useState(SEED);
    const [value, setValue] = React.useState("");
    // The client keeps writing: scroll up to see the «new messages» pill.
    React.useEffect(() => {
      let n = 0;
      const id = setInterval(() => {
        n++;
        setItems((list) => [
          ...list,
          {
            id: `c${n}`,
            direction: "in",
            author: "Мадина",
            at: new Date(),
            text: `Сообщение ${n}`,
            channel: "instagram",
          },
        ]);
        if (n >= 3) clearInterval(id);
      }, 4000);
      return () => clearInterval(id);
    }, []);
    return (
      <div className={frame}>
        <div className="flex min-h-0 flex-1 flex-col">
          <ChatThread
            items={items}
            getKey={(m) => m.id}
            getTime={(m) => m.at}
            getAuthorKey={(m) => m.direction + m.author}
            renderItem={renderMessage}
          />
        </div>
        <div className="border-t border-hairline p-3">
          <ChatComposer
            value={value}
            onChange={setValue}
            onSend={() => {
              setItems((list) => [
                ...list,
                {
                  id: `o${list.length}`,
                  direction: "out",
                  author: "Вы",
                  at: new Date(),
                  text: value,
                  status: "sent",
                  channel: "instagram",
                },
              ]);
              setValue("");
            }}
          />
        </div>
      </div>
    );
  },
};

/** `hasOlder` + `onLoadOlder`: scroll to the top to load the previous page. */
export const LoadOlder: Story = {
  name: "Load older messages",
  render: () => {
    const older: Message[] = Array.from({ length: 12 }, (_, i) => ({
      id: `old${i}`,
      direction: i % 3 === 0 ? "out" : "in",
      author: i % 3 === 0 ? "Вы" : "Мадина",
      at: at(10, 9 + Math.floor(i / 2), (i * 7) % 60),
      text: `Ранее: сообщение ${i + 1}`,
      channel: "instagram",
    }));
    const [items, setItems] = React.useState(SEED);
    const [loading, setLoading] = React.useState(false);
    const hasOlder = items.length === SEED.length;
    return (
      <div className={frame}>
        <ChatThread
          items={items}
          getKey={(m) => m.id}
          getTime={(m) => m.at}
          getAuthorKey={(m) => m.direction + m.author}
          renderItem={renderMessage}
          hasOlder={hasOlder}
          loading={loading}
          onLoadOlder={() => {
            setLoading(true);
            setTimeout(() => {
              setItems((list) => [...older, ...list]);
              setLoading(false);
            }, 800);
          }}
        />
      </div>
    );
  },
};

export const Empty: Story = {
  render: () => (
    <div className={frame}>
      <ChatThread
        items={[] as Message[]}
        getKey={(m) => m.id}
        getTime={(m) => m.at}
        getAuthorKey={(m) => m.author}
        renderItem={renderMessage}
        empty={
          <EmptyState
            icon={<MessagesSquare />}
            title="Сообщений пока нет"
            description="Напишите клиенту первым — он получит сообщение в Instagram."
          />
        }
      />
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className={frame}>
      <ChatThread
        items={[] as Message[]}
        loading
        getKey={(m) => m.id}
        getTime={(m) => m.at}
        getAuthorKey={(m) => m.author}
        renderItem={renderMessage}
      />
    </div>
  ),
};
