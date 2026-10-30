import { Check, CheckCheck, CircleAlert, Clock, FileText, RotateCw } from "lucide-react";
import * as React from "react";

import { defineMessages } from "../i18n/messages";
import { CHANNEL_ICONS, CHANNEL_LABELS, parseChatTime, type ChatChannel } from "../lib/channels";
import { cn } from "../lib/cn";
import { focusRing } from "../lib/control";
import { useFormat, useMessages } from "./TajUIProvider";

export type { ChatChannel } from "../lib/channels";
export type ChatRole = "user" | "assistant" | "system";
/**
 * Delivery state. Outgoing: `sending → sent → delivered → read`, or `error`.
 * `received` marks an incoming message (announced to screen readers only).
 */
export type ChatMessageStatus = "sending" | "sent" | "delivered" | "read" | "received" | "error";
/** Position of a bubble in a run of messages from one author (see ChatThread). */
export type ChatGroupPosition = "single" | "first" | "middle" | "last";

/** Attachment shown inside the bubble, above the text. */
export interface ChatBubbleMedia {
  kind: "image" | "video" | "audio" | "file";
  src: string;
  /** File name; also the image's alt text. */
  name?: string;
  /** Open a preview (lightbox, viewer). Images become a button, files call it instead of downloading. */
  onOpen?: () => void;
}

export type ChatBubbleMessages = {
  you: string;
  assistant: string;
  system: string;
  sending: string;
  sent: string;
  delivered: string;
  read: string;
  received: string;
  error: string;
  retry: string;
  channelTelegram: string;
  channelWhatsapp: string;
  channelSms: string;
  channelApp: string;
  channelInstagram: string;
  channelMessenger: string;
  via: string;
  image: string;
  openImage: string;
  file: string;
};

export const chatBubbleMessages = defineMessages<ChatBubbleMessages>("chatBubble", {
  ru: {
    you: "Вы",
    assistant: "TijoratAI",
    system: "Система",
    sending: "Отправляется…",
    sent: "Отправлено",
    delivered: "Доставлено",
    read: "Прочитано",
    received: "Получено",
    error: "Не отправлено",
    retry: "Повторить",
    channelTelegram: CHANNEL_LABELS.ru.telegram,
    channelWhatsapp: CHANNEL_LABELS.ru.whatsapp,
    channelSms: CHANNEL_LABELS.ru.sms,
    channelApp: CHANNEL_LABELS.ru.app,
    channelInstagram: CHANNEL_LABELS.ru.instagram,
    channelMessenger: CHANNEL_LABELS.ru.messenger,
    via: "Канал:",
    image: "Изображение",
    openImage: "Открыть изображение",
    file: "Файл",
  },
  tg: {
    you: "Шумо",
    assistant: "TijoratAI",
    system: "Низом",
    sending: "Фиристода мешавад…",
    sent: "Фиристода шуд",
    delivered: "Расонида шуд",
    read: "Хонда шуд",
    received: "Қабул шуд",
    error: "Фиристода нашуд",
    retry: "Аз нав фиристодан",
    channelTelegram: CHANNEL_LABELS.tg.telegram,
    channelWhatsapp: CHANNEL_LABELS.tg.whatsapp,
    channelSms: CHANNEL_LABELS.tg.sms,
    channelApp: CHANNEL_LABELS.tg.app,
    channelInstagram: CHANNEL_LABELS.tg.instagram,
    channelMessenger: CHANNEL_LABELS.tg.messenger,
    via: "Канал:",
    image: "Тасвир",
    openImage: "Кушодани тасвир",
    file: "Файл",
  },
  en: {
    you: "You",
    assistant: "TijoratAI",
    system: "System",
    sending: "Sending…",
    sent: "Sent",
    delivered: "Delivered",
    read: "Read",
    received: "Received",
    error: "Not sent",
    retry: "Retry",
    channelTelegram: CHANNEL_LABELS.en.telegram,
    channelWhatsapp: CHANNEL_LABELS.en.whatsapp,
    channelSms: CHANNEL_LABELS.en.sms,
    channelApp: CHANNEL_LABELS.en.app,
    channelInstagram: CHANNEL_LABELS.en.instagram,
    channelMessenger: CHANNEL_LABELS.en.messenger,
    via: "Channel:",
    image: "Image",
    openImage: "Open image",
    file: "File",
  },
});

const CHANNEL_LABEL_KEY: Record<ChatChannel, keyof ChatBubbleMessages> = {
  telegram: "channelTelegram",
  whatsapp: "channelWhatsapp",
  sms: "channelSms",
  app: "channelApp",
  instagram: "channelInstagram",
  messenger: "channelMessenger",
};

export interface ChatBubbleProps extends Omit<React.HTMLAttributes<HTMLElement>, "role"> {
  role?: ChatRole;
  /** Display name. Defaults to "Вы" / "TijoratAI" / "Система" by role. */
  author?: string;
  /** Avatar slot, e.g. `<Avatar>…</Avatar>`. Shown beside user/assistant bubbles. */
  avatar?: React.ReactNode;
  /** Send time. Dates are printed as HH:mm; a non-date string is shown as is. */
  time?: Date | number | string;
  /** Delivery state (see `ChatMessageStatus`). */
  status?: ChatMessageStatus;
  /** Called by the retry button shown when `status="error"`. */
  onRetry?: () => void;
  /** Channel the message came through or went out on. */
  channel?: ChatChannel;
  /** Image, video, voice note or file shown above the text. */
  media?: ChatBubbleMedia;
  /**
   * Position in a run of messages from one author. `first`/`middle` hide the
   * meta line and avatar (space is kept so bubbles line up) and tighten the
   * corners that touch the neighbouring bubble. Defaults to `single`.
   */
  grouped?: ChatGroupPosition;
  /** Fill of outgoing (`role="user"`) bubbles: brand green or a neutral mist. */
  tone?: "brand" | "neutral";
  /** Max bubble width (any CSS length). Defaults to `min(75%, 640px)`. */
  maxWidth?: string | number;
  /** Let rich content (an ApprovalCard, a table) use the full max width. */
  fullWidth?: boolean;
  labels?: Partial<ChatBubbleMessages>;
}

/**
 * Corner radii per side and group position: corners that touch a neighbour in
 * the run are tightened, and the tail (smallest corner) sits on the last one.
 */
const BUBBLE_RADIUS: Record<"in" | "out", Record<ChatGroupPosition, string>> = {
  in: {
    single: "!rounded-2xl !rounded-bl-sm",
    first: "!rounded-2xl !rounded-bl-md",
    middle: "!rounded-2xl !rounded-tl-md !rounded-bl-md",
    last: "!rounded-2xl !rounded-tl-md !rounded-bl-sm",
  },
  out: {
    single: "!rounded-2xl !rounded-br-sm",
    first: "!rounded-2xl !rounded-br-md",
    middle: "!rounded-2xl !rounded-tr-md !rounded-br-md",
    last: "!rounded-2xl !rounded-tr-md !rounded-br-sm",
  },
};

function MediaBlock({
  media,
  t,
  hasText,
}: {
  media: ChatBubbleMedia;
  t: ChatBubbleMessages;
  hasText: boolean;
}) {
  const frame = cn(
    "block max-w-full overflow-hidden !rounded-xl bg-ui-surface-inset",
    hasText && "mb-2",
  );
  if (media.kind === "image") {
    const img = (
      <img
        src={media.src}
        alt={media.name ?? t.image}
        loading="lazy"
        className="block max-h-80 w-auto max-w-full object-contain"
      />
    );
    return media.onOpen ? (
      <button
        type="button"
        data-slot="chat-bubble-media"
        data-kind="image"
        onClick={media.onOpen}
        aria-label={media.name ? `${t.openImage}: ${media.name}` : t.openImage}
        className={cn(frame, "cursor-zoom-in", focusRing)}
      >
        {img}
      </button>
    ) : (
      <div data-slot="chat-bubble-media" data-kind="image" className={frame}>
        {img}
      </div>
    );
  }
  if (media.kind === "video") {
    return (
      <div data-slot="chat-bubble-media" data-kind="video" className={frame}>
        <video src={media.src} controls preload="metadata" className="block max-h-80 max-w-full">
          <track kind="captions" />
        </video>
      </div>
    );
  }
  if (media.kind === "audio") {
    return (
      <div
        data-slot="chat-bubble-media"
        data-kind="audio"
        className={cn("block w-72 max-w-full", hasText && "mb-2")}
      >
        <audio src={media.src} controls preload="metadata" className="block w-full">
          <track kind="captions" />
        </audio>
      </div>
    );
  }
  const fileName = media.name ?? t.file;
  const fileClass = cn(
    "flex min-h-11 max-w-full items-center gap-2.5 !rounded-xl border border-hairline bg-ui-surface px-3 py-2 text-left text-ink-1 no-underline hover:bg-ui-surface-2",
    focusRing,
    hasText && "mb-2",
  );
  const fileBody = (
    <>
      <FileText aria-hidden className="size-5 shrink-0 text-ink-3" />
      <span className="min-w-0 truncate font-medium">{fileName}</span>
    </>
  );
  return media.onOpen ? (
    <button
      type="button"
      data-slot="chat-bubble-media"
      data-kind="file"
      onClick={media.onOpen}
      className={cn(fileClass, "cursor-pointer")}
    >
      {fileBody}
    </button>
  ) : (
    <a
      data-slot="chat-bubble-media"
      data-kind="file"
      href={media.src}
      target="_blank"
      rel="noreferrer noopener"
      download={media.name}
      className={fileClass}
    >
      {fileBody}
    </a>
  );
}

const STATUS_ICON: Partial<Record<ChatMessageStatus, React.ReactNode>> = {
  sending: <Clock aria-hidden className="size-3.5" />,
  sent: <Check aria-hidden className="size-3.5" />,
  delivered: <CheckCheck aria-hidden className="size-3.5" />,
  read: <CheckCheck aria-hidden className="size-3.5 text-brand-ink" />,
  error: <CircleAlert aria-hidden className="size-3.5" />,
};

/**
 * One message in a TijoratAI or customer conversation (in-app, Telegram,
 * WhatsApp, Instagram, Messenger, SMS). User (outgoing) messages align right,
 * assistant/customer messages left, system notices centre. Children are the
 * text body; `media` adds an attachment. Inside a ChatThread, pass the
 * `grouped` position it hands to `renderItem`.
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
      media,
      grouped = "single",
      tone = "brand",
      maxWidth = "min(75%, 640px)",
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

    const name = author ?? (role === "user" ? t.you : role === "system" ? t.system : t.assistant);
    const date = time !== undefined ? parseChatTime(time) : null;
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
          <div className="max-w-full !rounded-pill bg-ui-surface-2 px-3 py-1 text-center text-ui-helper text-ink-3">
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
    const ChannelIcon = channel ? CHANNEL_ICONS[channel] : null;
    // Runs of messages show the meta line once, under the last bubble. An
    // error always shows it, so the retry stays reachable.
    const showMeta = grouped === "single" || grouped === "last" || status === "error";
    const showAvatar = grouped === "single" || grouped === "last";
    const hasText = children !== undefined && children !== null && children !== false && children !== "";
    const mediaOnly = !!media && !hasText;

    return (
      <article
        ref={ref}
        data-slot="chat-bubble"
        data-role={role}
        data-status={status}
        data-grouped={grouped}
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
          <div
            data-slot="chat-bubble-avatar"
            className={cn("shrink-0 self-end", !showAvatar && "invisible")}
            aria-hidden={!showAvatar || undefined}
          >
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
              "max-w-full text-ui-body leading-normal break-words whitespace-pre-wrap",
              fullWidth && "w-full",
              BUBBLE_RADIUS[isUser ? "out" : "in"][grouped],
              // A bare attachment (no text) is shown without a bubble around it.
              mediaOnly
                ? "text-ink-1"
                : cn(
                    "px-3.5 py-2.5",
                    isUser
                      ? tone === "neutral"
                        ? "bg-mist text-ink-1"
                        : "bg-brand-solid text-on-brand"
                      : "border border-hairline bg-ui-surface-2 text-ink-1",
                  ),
              status === "error" && "ring-1 ring-tj-error",
            )}
          >
            {media && <MediaBlock media={media} t={t} hasText={hasText} />}
            {children}
          </div>
          {showMeta ? (
            <div
              data-slot="chat-bubble-meta"
              className={cn(
                "flex flex-wrap items-center gap-x-1.5 gap-y-0.5 px-1 text-ui-caption text-ink-3",
                isUser && "flex-row-reverse",
              )}
            >
              <span className="font-semibold text-ink-2">{name}</span>
              {timeText && <time dateTime={date?.toISOString()}>{timeText}</time>}
              {channel && ChannelIcon && (
                <span
                  data-slot="chat-bubble-channel"
                  data-channel={channel}
                  className="inline-flex items-center gap-1 font-medium text-ink-2"
                >
                  <ChannelIcon aria-hidden className="size-3.5" />
                  <span className="sr-only">{t.via} </span>
                  {t[CHANNEL_LABEL_KEY[channel]] as string}
                </span>
              )}
              {status && (
                <span
                  data-slot="chat-bubble-status"
                  data-status={status}
                  className={cn(
                    "inline-flex items-center gap-1",
                    status === "error" && "font-semibold text-tj-error-ink",
                  )}
                >
                  {STATUS_ICON[status]}
                  {status === "error" ? t.error : <span className="sr-only">{t[status]}</span>}
                </span>
              )}
              {status === "error" && onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className={cn(
                    "inline-flex min-h-6 cursor-pointer items-center gap-1 !rounded-md px-1.5 font-semibold text-brand-ink hover:bg-mist",
                    focusRing,
                  )}
                >
                  <RotateCw aria-hidden className="size-3" />
                  {t.retry}
                </button>
              )}
            </div>
          ) : (
            // The meta line is hidden in a run; keep the time and status for screen readers.
            (timeText || status) && (
              <span className="sr-only">
                {timeText}
                {status ? ` ${t[status] as string}` : ""}
              </span>
            )
          )}
        </div>
      </article>
    );
  },
);
ChatBubble.displayName = "ChatBubble";
