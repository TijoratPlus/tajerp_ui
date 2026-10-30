import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import {
  Avatar,
  AvatarFallback,
  ConversationListItem,
  TajUIProvider,
  initialsOf,
  type ChatChannel,
} from "../../src";

const meta: Meta<typeof ConversationListItem> = {
  title: "Components/Business/ConversationListItem",
  component: ConversationListItem,
  parameters: {
    docs: {
      description: {
        component:
          "One row of an inbox: avatar with the channel badged on it, the contact name, last-activity time (today → time, this week → weekday, older → date), a subtitle such as `@username`, the last message and an unread dot or counter. Renders a link with `href`, a button with `onClick`. Mark the open conversation with `active`.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof ConversationListItem>;

const now = new Date();
const ago = (minutes: number) => new Date(now.getTime() - minutes * 60_000);

const ROWS: {
  id: string;
  name: string;
  subtitle?: string;
  preview: string;
  channel: ChatChannel;
  time: Date;
  unread?: number | boolean;
}[] = [
  {
    id: "1",
    name: "Мадина Каримова",
    subtitle: "@madina.k",
    preview: "Хуб, фардо гирифта метавонам?",
    channel: "instagram",
    time: ago(4),
    unread: 2,
  },
  {
    id: "2",
    name: "Бахтиёр Саидов",
    subtitle: "+992 93 123 45 67",
    preview: "Рахмат, қабул шуд!",
    channel: "whatsapp",
    time: ago(52),
  },
  {
    id: "3",
    name: "Фарҳод",
    subtitle: "@farhod_tj",
    preview: "Есть доставка в Худжанд?",
    channel: "telegram",
    time: ago(60 * 26),
    unread: true,
  },
  {
    id: "4",
    name: "Зарина Раҳимова",
    preview: "Вы: Счёт отправлен",
    channel: "messenger",
    time: ago(60 * 24 * 3),
  },
  {
    id: "5",
    name: "Магазин «Нур»",
    preview: "Напоминание о долге 1 250,00 с",
    channel: "sms",
    time: ago(60 * 24 * 40),
  },
];

function avatarFor(name: string) {
  return (
    <Avatar size="md">
      <AvatarFallback>{initialsOf(name)}</AvatarFallback>
    </Avatar>
  );
}

export const Playground: Story = {
  args: {
    title: "Мадина Каримова",
    subtitle: "@madina.k",
    preview: "Ин курта ҳаст? Размер M",
    channel: "instagram",
    time: ago(4),
    unread: 2,
    avatar: avatarFor("Мадина Каримова"),
    onClick: () => {},
  },
};

/** An inbox column: rows as buttons, one active. */
export const Inbox: Story = {
  render: () => {
    const [active, setActive] = React.useState("1");
    return (
      <nav
        aria-label="Входящие"
        className="flex flex-col gap-0.5 !rounded-xl bg-ui-surface p-2"
      >
        {ROWS.map((r) => (
          <ConversationListItem
            key={r.id}
            title={r.name}
            subtitle={r.subtitle}
            preview={r.preview}
            channel={r.channel}
            time={r.time}
            unread={r.id === active ? undefined : r.unread}
            avatar={avatarFor(r.name)}
            active={r.id === active}
            onClick={() => setActive(r.id)}
          />
        ))}
      </nav>
    );
  },
};

export const WithoutAvatar: Story = {
  name: "Without avatar (compact list)",
  render: () => (
    <div className="flex flex-col gap-0.5">
      {ROWS.slice(0, 3).map((r) => (
        <ConversationListItem
          key={r.id}
          href={`#${r.id}`}
          title={r.name}
          preview={r.preview}
          channel={r.channel}
          time={r.time}
          unread={r.unread}
        />
      ))}
    </div>
  ),
};

export const Tajik: Story = {
  name: "Tajik (тоҷикӣ)",
  render: () => (
    <TajUIProvider locale="tg">
      <ConversationListItem
        title="Фарҳод Назаров"
        subtitle="@farhod_tj"
        preview="Қарзи ман чанд аст?"
        channel="telegram"
        time={ago(60 * 24 * 2)}
        unread={5}
        avatar={avatarFor("Фарҳод Назаров")}
        onClick={() => {}}
      />
    </TajUIProvider>
  ),
};
