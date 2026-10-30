import * as React from "react";

import { defineMessages } from "../i18n/messages";
import {
  CHANNEL_ICONS,
  CHANNEL_LABELS,
  parseChatTime,
  type ChatChannel,
} from "../lib/channels";
import { cn } from "../lib/cn";
import { focusRing } from "../lib/control";
import { isSameDay, startOfDay } from "../lib/date";
import { useFormat, useLocale, useMessages } from "./TajUIProvider";

function ruUnread(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} непрочитанное`;
  return `${n} непрочитанных`;
}

export const conversationListItemMessages = defineMessages(
  "conversationListItem",
  {
    ru: {
      unread: "Есть непрочитанные",
      unreadCount: ruUnread,
      via: "Канал:",
    },
    tg: {
      unread: "Паёмҳои нахонда ҳаст",
      unreadCount: (n: number) => `${n} паёми нахонда`,
      via: "Канал:",
    },
    en: {
      unread: "Unread",
      unreadCount: (n: number) => `${n} unread`,
      via: "Channel:",
    },
  },
);

export type ConversationListItemLabels = Partial<
  (typeof conversationListItemMessages.locales)["ru"]
>;

export interface ConversationListItemProps {
  /** Contact or conversation name. */
  title: React.ReactNode;
  /** Second line, e.g. `@username` or the phone number. */
  subtitle?: React.ReactNode;
  /** Last message, one line. */
  preview?: React.ReactNode;
  /** Last activity. Today shows the time, this week the weekday, older the date. */
  time?: Date | string | number;
  channel?: ChatChannel;
  /** Avatar slot; the channel icon is badged onto it. */
  avatar?: React.ReactNode;
  /** `true` shows a dot, a number shows a counter. */
  unread?: boolean | number;
  /** The open conversation (`aria-current`). */
  active?: boolean;
  onClick?: () => void;
  /** Renders the row as a link. */
  href?: string;
  className?: string;
  /** Override UI strings. */
  labels?: ConversationListItemLabels;
}

/**
 * One row of an inbox: avatar with the channel badge, name, last-activity
 * time, a subtitle and the last message, and an unread dot or counter.
 * Renders a link with `href`, a button with `onClick`, otherwise a plain row.
 */
export const ConversationListItem = React.forwardRef<
  HTMLElement,
  ConversationListItemProps
>(
  (
    {
      title,
      subtitle,
      preview,
      time,
      channel,
      avatar,
      unread,
      active = false,
      onClick,
      href,
      className,
      labels,
    },
    ref,
  ) => {
    const t = useMessages(conversationListItemMessages, labels);
    const locale = useLocale();
    const fmt = useFormat();

    const date = time !== undefined ? parseChatTime(time) : null;
    let timeText: string | undefined;
    if (time !== undefined) {
      if (!date) timeText = String(time);
      else {
        const today = startOfDay(new Date());
        const ageDays = Math.round(
          (today.getTime() - startOfDay(date).getTime()) / 86_400_000,
        );
        timeText = isSameDay(date, today)
          ? fmt.date(date, { hour: "2-digit", minute: "2-digit" })
          : ageDays > 0 && ageDays < 7
            ? fmt.date(date, { weekday: "short" })
            : date.getFullYear() === today.getFullYear()
              ? fmt.date(date, { day: "numeric", month: "short" })
              : fmt.date(date, {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                });
      }
    }

    const count = typeof unread === "number" ? unread : unread ? -1 : 0;
    const isUnread = count !== 0;
    const ChannelIcon = channel ? CHANNEL_ICONS[channel] : null;
    const channelName = channel ? CHANNEL_LABELS[locale][channel] : undefined;

    const channelBadge = ChannelIcon ? (
      <span
        data-slot="conversation-list-item-channel"
        data-channel={channel}
        className={cn(
          "grid shrink-0 place-items-center text-ink-2",
          avatar &&
            "absolute -right-1 -bottom-1 size-4 !rounded-full bg-ui-surface ring-2 ring-ui-surface",
        )}
      >
        <ChannelIcon aria-hidden className={avatar ? "size-2.5" : "size-3.5"} />
        <span className="sr-only">
          {t.via} {channelName}
        </span>
      </span>
    ) : null;

    const body = (
      <>
        {avatar ? (
          <span
            data-slot="conversation-list-item-avatar"
            className="relative shrink-0"
          >
            {avatar}
            {channelBadge}
          </span>
        ) : null}
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex min-w-0 items-baseline gap-2">
            {!avatar && channelBadge}
            <span
              data-slot="conversation-list-item-title"
              className={cn(
                "min-w-0 flex-1 truncate text-ui-body text-ink-1",
                isUnread ? "font-semibold" : "font-medium",
              )}
            >
              {title}
            </span>
            {timeText && (
              <time
                dateTime={date?.toISOString()}
                className={cn(
                  "shrink-0 text-ui-caption",
                  isUnread ? "font-semibold text-ink-1" : "text-ink-3",
                )}
              >
                {timeText}
              </time>
            )}
          </span>
          {subtitle && (
            <span
              data-slot="conversation-list-item-subtitle"
              className="truncate text-ui-caption text-ink-3"
            >
              {subtitle}
            </span>
          )}
          {(preview || isUnread) && (
            <span className="flex min-w-0 items-center gap-2">
              <span
                data-slot="conversation-list-item-preview"
                className={cn(
                  "min-w-0 flex-1 truncate text-ui-label",
                  isUnread ? "text-ink-1" : "text-ink-3",
                )}
              >
                {preview}
              </span>
              {count > 0 ? (
                <span
                  data-slot="conversation-list-item-unread"
                  className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center !rounded-pill bg-brand-solid px-1.5 text-ui-micro font-bold text-on-brand"
                >
                  <span aria-hidden>{count > 99 ? "99+" : count}</span>
                  <span className="sr-only">{t.unreadCount(count)}</span>
                </span>
              ) : count < 0 ? (
                <span
                  data-slot="conversation-list-item-unread"
                  className="size-2.5 shrink-0 !rounded-full bg-brand"
                >
                  <span className="sr-only">{t.unread}</span>
                </span>
              ) : null}
            </span>
          )}
        </span>
      </>
    );

    const rowClass = cn(
      "group flex w-full min-w-0 items-start gap-3 !rounded-xl px-3 py-2.5 text-left no-underline transition-colors duration-150",
      active ? "bg-ui-surface-inset" : "hover:bg-ui-surface-2",
      (href || onClick) && cn("cursor-pointer", focusRing),
      className,
    );

    if (href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          onClick={onClick}
          data-slot="conversation-list-item"
          data-active={active || undefined}
          data-unread={isUnread || undefined}
          aria-current={active ? "true" : undefined}
          className={rowClass}
        >
          {body}
        </a>
      );
    }
    if (onClick) {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          onClick={onClick}
          data-slot="conversation-list-item"
          data-active={active || undefined}
          data-unread={isUnread || undefined}
          aria-current={active ? "true" : undefined}
          className={rowClass}
        >
          {body}
        </button>
      );
    }
    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        data-slot="conversation-list-item"
        data-active={active || undefined}
        data-unread={isUnread || undefined}
        aria-current={active ? "true" : undefined}
        className={rowClass}
      >
        {body}
      </div>
    );
  },
);
ConversationListItem.displayName = "ConversationListItem";
