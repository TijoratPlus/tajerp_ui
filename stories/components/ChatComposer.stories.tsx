import type { Meta, StoryObj } from "@storybook/react";
import { FileText, Paperclip, Smile } from "lucide-react";
import * as React from "react";

import {
  Button,
  ChatComposer,
  TajUIProvider,
  type ChatComposerProps,
} from "../../src";

const meta: Meta<typeof ChatComposer> = {
  title: "Components/Business/ChatComposer",
  component: ChatComposer,
  parameters: {
    docs: {
      description: {
        component:
          "Message input under a conversation (inbox, lead page, TijoratAI). The field grows with the text up to `maxRows` (8), Enter sends and Shift+Enter starts a new line; Enter that confirms an IME composition does not send. `leading` and `trailing` hold attach/emoji/template buttons. When replying is impossible — the WhatsApp/Instagram 24-hour window has closed, the channel is disconnected — pass `disabledReason`: it is shown above the field and disables it.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 680 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof ChatComposer>;

function Live(props: Partial<ChatComposerProps>) {
  const [value, setValue] = React.useState(props.value ?? "");
  const [sent, setSent] = React.useState<string[]>([]);
  const [sending, setSending] = React.useState(false);
  return (
    <div className="flex flex-col gap-3">
      {sent.length > 0 && (
        <ul className="flex flex-col gap-1 text-ui-label text-ink-2">
          {sent.map((m, i) => (
            <li key={i} className="whitespace-pre-wrap">
              ✓ {m}
            </li>
          ))}
        </ul>
      )}
      <ChatComposer
        {...props}
        value={value}
        onChange={setValue}
        sending={sending}
        onSend={() => {
          setSending(true);
          setTimeout(() => {
            setSent((s) => [...s, value]);
            setValue("");
            setSending(false);
          }, 600);
        }}
      />
    </div>
  );
}

const attach = (
  <Button variant="ghost" size="icon-sm" aria-label="Прикрепить файл">
    <Paperclip aria-hidden className="size-4" />
  </Button>
);
const emoji = (
  <Button variant="ghost" size="icon-sm" aria-label="Эмодзи">
    <Smile aria-hidden className="size-4" />
  </Button>
);
const templates = (
  <Button variant="ghost" size="icon-sm" aria-label="Шаблоны">
    <FileText aria-hidden className="size-4" />
  </Button>
);

export const Playground: Story = {
  render: () => <Live />,
};

export const WithSlots: Story = {
  name: "Attach, emoji and templates",
  render: () => (
    <Live
      leading={
        <>
          {attach}
          {emoji}
        </>
      }
      trailing={templates}
    />
  ),
};

export const LongText: Story = {
  name: "Grows to 8 rows",
  render: () => (
    <Live
      value={
        "Здравствуйте, Мадина!\nКурта синяя, размер M — 320,00 с.\nДоставка по Душанбе бесплатно, в Худжанд — 25,00 с.\nОплата наличными или картой «Корти милли».\nМожем отложить до завтра.\nНапишите адрес и удобное время.\nСпасибо, что выбрали «Нур»!\nХорошего дня."
      }
    />
  ),
};

export const WindowClosed: Story = {
  name: "Disabled with a reason",
  render: () => (
    <ChatComposer
      value=""
      onChange={() => {}}
      onSend={() => {}}
      leading={attach}
      disabledReason={
        <>
          Окно ответа WhatsApp (24 часа) закрыто. Отправьте одобренный шаблон,
          чтобы продолжить переписку.
        </>
      }
    />
  ),
};

export const Tajik: Story = {
  name: "Tajik (тоҷикӣ)",
  render: () => (
    <TajUIProvider locale="tg">
      <Live />
    </TajUIProvider>
  ),
};
