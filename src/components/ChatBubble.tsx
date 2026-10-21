import {
  Check,
  CheckCheck,
  CircleAlert,
  Clock,
  MessageCircle,
  MessageSquareText,
  RotateCw,
  Send,
  Smartphone,
} from "lucide-react";
import * as React from "react";

import { defineMessages } from "../i18n/messages";
import { focusRing } from "../lib/control";
import { cn } from "../lib/cn";
import { useFormat, useMessages } from "./TajUIProvider";

export type ChatRole = "user" | "assistant" | "system";
export type ChatMessageStatus = "sending" | "sent" | "read" | "error";
export type ChatChannel = "telegram" | "whatsapp" | "sms" | "app";

export type ChatBubbleMessages = {
  you: string;
  assistant: string;
  system: string;
  sending: string;
  sent: string;
  read: string;
  error: string;
  retry: string;
  channelTelegram: string;
  channelWhatsapp: string;
  channelSms: string;
  channelApp: string;
  via: string;
};

export const chatBubbleMessages = defineMessages<ChatBubbleMessages>("chatBubble", {
  ru: {
    you: "Вы",
    assistant: "TijoratAI",
    system: "Система",
    sending: "Отправляется…",
    sent: "Отправлено",
    read: "Прочитано",
    error: "Не отправлено",
    retry: "Повторить",
    channelTelegram: "Telegram",
    channelWhatsapp: "WhatsApp",
    channelSms: "SMS",
    channelApp: "Приложение",
    via: "Канал:",
  },
  tg: {
    you: "Шумо",
    assistant: "TijoratAI",
    system: "Низом",
    sending: "Фиристода мешавад…",
    sent: "Фиристода шуд",
    read: "Хонда шуд",
    error: "Фиристода нашуд",
    retry: "Аз нав фиристодан",
    channelTelegram: "Telegram",
    channelWhatsapp: "WhatsApp",
    channelSms: "SMS",
    channelApp: "Барнома",
    via: "Канал:",
  },
  en: {
    you: "You",
    assistant: "TijoratAI",
    system: "System",
    sending: "Sending…",
    sent: "Sent",
    read: "Read",
    error: "Not sent",
    retry: "Retry",
    channelTelegram: "Telegram",
    channelWhatsapp: "WhatsApp",
    channelSms: "SMS",
    channelApp: "App",
    via: "Channel:",
  },
});

const CHANNEL_META: Record<
  ChatChannel,
  { icon: React.ComponentType<{ className?: string }>; label: keyof ChatBubbleMessages }
> = {
  telegram: { icon: Send, label: "channelTelegram" },
  whatsapp: { icon: MessageCircle, label: "channelWhatsapp" },
  sms: { icon: MessageSquareText, label: "channelSms" },
  app: { icon: Smartphone, label: "channelApp" },
};

export interface ChatBubbleProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "role"> {
  role?: ChatRole;
  /** Display name. Defaults to "Вы" / "TijoratAI" / "Система" by role. */
  author?: string;
  /** Avatar slot, e.g. `<Avatar>…</Avatar>`. Shown beside user/assistant bubbles. */
  avatar?: React.ReactNode;
  /** Send time. Dates are printed as HH:mm; a non-date string is shown as is. */
  time?: Date | number | string;
  /** Delivery state of outgoing messages. */
  status?: ChatMessageStatus;
  /** Called by the retry button shown when `status="error"`. */
  onRetry?: () => void;
  /** Channel the message came through or went out on. */
  channel?: ChatChannel;
  /** Max bubble width (any CSS length). Defaults to 85%. */
  maxWidth?: string | number;
  /** Let rich content (an ApprovalCard, a table) use the full max width. */
  fullWidth?: boolean;
  labels?: Partial<ChatBubbleMessages>;
}

function parseTime(time: Date | number | string) {
  if (time instanceof Date) return time;
  if (typeof time === "number") return new Date(time);
  // Only treat ISO-ish strings as dates; "14:05" or "вчера" are shown as is.
  if (/^\d{4}-\d{2}-\d{2}/.test(time)) {
    const d = new Date(time);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

/**
 * One message in a TijoratAI or customer conversation (in-app, Telegram,
 * WhatsApp, SMS). User messages align right, assistant messages left, system
 * notices centre. Children can be text or rich nodes such as an ApprovalCard.
 */
export const ChatBubble = React.forwardRef<HTMLElement, ChatBubbleProps>(
  (
    {
      role = "assistant",
      author,
      avatar,
      time,
      status,
      onRetry,
      channel,
      maxWidth = "85%",
      fullWidth = false,
      labels,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const t = useMessages(chatBubbleMessages, labels);
    const fmt = useFormat();

    const name =
      author ?? (role === "user" ? t.you : role === "system" ? t.system : t.assistant);
    const date = time !== undefined ? parseTime(time) : null;
    const timeText =
      time === undefined
        ? undefined
        : date
          ? fmt.date(date, { hour: "2-digit", minute: "2-digit" })
          : String(time);
    const ariaLabel = timeText ? `${name}, ${timeText}` : name;

    if (role === "system") {
      return (
        <article
          ref={ref}
          data-slot="chat-bubble"
          data-role="system"
          aria-label={ariaLabel}
          className={cn("flex justify-center px-4 py-1", className)}
          style={style}
          {...props}
        >
          <div className="max-w-full !rounded-pill bg-ui-surface-2 px-3 py-1 text-center text-ink-3 text-ui-helper">
            {children}
            {timeText && (
              <>
                {" · "}
                <time dateTime={date?.toISOString()}>{timeText}</time>
              </>
            )}
          </div>
        </article>
      );
    }

    const isUser = role === "user";
    const ch = channel ? CHANNEL_META[channel] : null;
    const ChannelIcon = ch?.icon;

    const statusIcon =
      status === "sending" ? (
        <Clock aria-hidden className="size-3.5" />
      ) : status === "sent" ? (
        <Check aria-hidden className="size-3.5" />
      ) : status === "read" ? (
        <CheckCheck aria-hidden className="size-3.5 text-brand-ink" />
      ) : status === "error" ? (
        <CircleAlert aria-hidden className="size-3.5" />
      ) : null;

    return (
      <article
        ref={ref}
        data-slot="chat-bubble"
        data-role={role}
        data-status={status}
        aria-label={ariaLabel}
        className={cn(
          "flex w-full items-end gap-2",
          isUser ? "flex-row-reverse" : "flex-row",
          className,
        )}
        style={style}
        {...props}
      >
        {avatar && (
          <div data-slot="chat-bubble-avatar" className="shrink-0 self-end">
            {avatar}
          </div>
        )}
        <div
          data-slot="chat-bubble-body"
          className={cn("flex min-w-0 flex-col gap-1", isUser ? "items-end" : "items-start")}
          style={{ maxWidth, width: fullWidth ? maxWidth : undefined }}
        >
          <div
            data-slot="chat-bubble-content"
            className={cn(
              "max-w-full px-3.5 py-2.5 text-ui-body leading-relaxed break-words whitespace-pre-wrap",
              fullWidth && "w-full",
              isUser
                ? "bg-brand-solid text-on-brand !rounded-2xl !rounded-br-sm"
                : "border border-hairline bg-ui-surface-2 text-ink-1 !rounded-2xl !rounded-bl-sm",
              status === "error" && "opacity-80",
            )}
          >
            {children}
          </div>
          <div
            data-slot="chat-bubble-meta"
            className={cn(
              "flex flex-wrap items-center gap-x-1.5 gap-y-0.5 px-1 text-ink-3 text-ui-caption",
              isUser && "flex-row-reverse",
            )}
          >
            <span className="font-bold text-ink-2">{name}</span>
            {timeText && <time dateTime={date?.toISOString()}>{timeText}</time>}
            {ch && ChannelIcon && (
              <span
                data-slot="chat-bubble-channel"
                data-channel={channel}
                className="inline-flex items-center gap-1 !rounded-pill border border-hairline bg-ui-surface px-1.5 py-px font-medium text-ink-2"
              >
                <ChannelIcon aria-hidden className="size-3" />
                <span className="sr-only">{t.via} </span>
                {t[ch.label] as string}
              </span>
            )}
            {status && (
              <span
                data-slot="chat-bubble-status"
                className={cn(
                  "inline-flex items-center gap-1",
                  status === "error" && "font-bold text-tj-error-ink",
                )}
              >
                {statusIcon}
                {status === "error" ? (
                  t.error
                ) : (
                  <span className="sr-only">{t[status]}</span>
                )}
              </span>
            )}
            {status === "error" && onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className={cn(
                  "inline-flex min-h-6 items-center gap-1 !rounded-md px-1.5 font-bold text-brand-ink hover:bg-mist cursor-pointer",
                  focusRing,
                )}
              >
                <RotateCw aria-hidden className="size-3" />
                {t.retry}
              </button>
            )}
          </div>
        </div>
      </article>
    );
  },
);
ChatBubble.displayName = "ChatBubble";
