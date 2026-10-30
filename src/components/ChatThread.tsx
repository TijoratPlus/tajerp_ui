import { ArrowDown } from "lucide-react";
import * as React from "react";

import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import { focusRing } from "../lib/control";
import { isSameDay, startOfDay } from "../lib/date";
import type { ChatGroupPosition } from "./ChatBubble";
import { Spinner } from "./Spinner";
import { useFormat, useMessages } from "./TajUIProvider";

export const chatThreadMessages = defineMessages("chatThread", {
  ru: {
    conversation: "Переписка",
    today: "Сегодня",
    yesterday: "Вчера",
    newMessages: "Новые сообщения",
    loadOlder: "Показать более ранние",
    loading: "Загрузка…",
  },
  tg: {
    conversation: "Мукотиба",
    today: "Имрӯз",
    yesterday: "Дирӯз",
    newMessages: "Паёмҳои нав",
    loadOlder: "Паёмҳои пештараро нишон додан",
    loading: "Боркунӣ…",
  },
  en: {
    conversation: "Conversation",
    today: "Today",
    yesterday: "Yesterday",
    newMessages: "New messages",
    loadOlder: "Show earlier messages",
    loading: "Loading…",
  },
});

export type ChatThreadLabels = Partial<
  (typeof chatThreadMessages.locales)["ru"]
>;

export interface ChatThreadProps<T> {
  items: T[];
  getKey: (item: T) => string;
  /** Message time; drives the day separators and grouping. */
  getTime: (item: T) => Date | string | number;
  /** Messages by the same author within 5 minutes form one group. */
  getAuthorKey: (item: T) => string;
  /** Render one message; pass `grouped` on to `ChatBubble`. */
  renderItem: (item: T, grouped: ChatGroupPosition) => React.ReactNode;
  /** Shows a spinner (at the top when older messages are loading). */
  loading?: boolean;
  /** Shown when there are no items and nothing is loading. */
  empty?: React.ReactNode;
  /** Called when the reader scrolls to the top (or presses the button) and `hasOlder` is set. */
  onLoadOlder?: () => void;
  hasOlder?: boolean;
  className?: string;
  /** Override UI strings. */
  labels?: ChatThreadLabels;
}

/** Messages closer than this (same author, same day) are grouped. */
export const CHAT_GROUP_WINDOW_MS = 5 * 60 * 1000;
/** Within this distance from the bottom the thread keeps following new messages. */
const STICK_THRESHOLD = 48;
/** Within this distance from the top, scrolling asks for older messages. */
const LOAD_OLDER_THRESHOLD = 80;

function toDate(v: Date | string | number): Date {
  if (v instanceof Date) return v;
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2} /.test(v))
    return new Date(v.replace(" ", "T"));
  return new Date(v);
}

export interface ChatThreadRow<T> {
  item: T;
  key: string;
  grouped: ChatGroupPosition;
  /** Set on the first message of a calendar day: that day's midnight. */
  day?: Date;
}

/**
 * Lay out a thread: the day separator before each new calendar day, and each
 * message's position in its author run. Pure, so it is tested without a DOM.
 */
export function layoutChatThread<T>(
  items: T[],
  getKey: (item: T) => string,
  getTime: (item: T) => Date | string | number,
  getAuthorKey: (item: T) => string,
): ChatThreadRow<T>[] {
  const times = items.map((it) => toDate(getTime(it)));
  const authors = items.map(getAuthorKey);
  const joins = (a: number, b: number) =>
    authors[a] === authors[b] &&
    isSameDay(times[a], times[b]) &&
    Math.abs(times[b].getTime() - times[a].getTime()) <= CHAT_GROUP_WINDOW_MS;

  return items.map((item, i) => {
    const prev = i > 0 && joins(i - 1, i);
    const next = i < items.length - 1 && joins(i, i + 1);
    const grouped: ChatGroupPosition =
      prev && next ? "middle" : prev ? "last" : next ? "first" : "single";
    const newDay = i === 0 || !isSameDay(times[i - 1], times[i]);
    return {
      item,
      key: getKey(item),
      grouped,
      day:
        newDay && !Number.isNaN(times[i].getTime())
          ? startOfDay(times[i])
          : undefined,
    };
  });
}

function ChatThreadInner<T>(
  {
    items,
    getKey,
    getTime,
    getAuthorKey,
    renderItem,
    loading = false,
    empty,
    onLoadOlder,
    hasOlder = false,
    className,
    labels,
  }: ChatThreadProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const t = useMessages(chatThreadMessages, labels);
  const fmt = useFormat();
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  /** Following the latest message (the reader has not scrolled up). */
  const stickRef = React.useRef(true);
  const prevRef = React.useRef<{
    first?: string;
    last?: string;
    count: number;
    height: number;
  }>({
    count: 0,
    height: 0,
  });
  const olderRequested = React.useRef(false);
  const [unseen, setUnseen] = React.useState(0);
  const [atBottom, setAtBottom] = React.useState(true);

  const rows = React.useMemo(
    () => layoutChatThread(items, getKey, getTime, getAuthorKey),
    [items, getKey, getTime, getAuthorKey],
  );

  const scrollToBottom = React.useCallback((smooth = false) => {
    const el = viewportRef.current;
    if (!el) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (smooth && !reduce && typeof el.scrollTo === "function") {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    } else {
      el.scrollTop = el.scrollHeight;
    }
    stickRef.current = true;
    setAtBottom(true);
    setUnseen(0);
  }, []);

  // React to new items: follow appended messages, keep the reading position
  // when older ones are prepended.
  React.useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const prev = prevRef.current;
    const first = rows[0]?.key;
    const last = rows[rows.length - 1]?.key;

    if (prev.count === 0 && rows.length > 0) {
      scrollToBottom();
    } else if (last !== prev.last && rows.length > 0) {
      if (stickRef.current) scrollToBottom();
      else {
        const lastBefore = prev.last
          ? rows.findIndex((r) => r.key === prev.last)
          : -1;
        const added = lastBefore >= 0 ? rows.length - 1 - lastBefore : 1;
        setUnseen((n) => n + Math.max(1, added));
      }
    } else if (first !== prev.first && rows.length > prev.count) {
      el.scrollTop += el.scrollHeight - prev.height;
    }
    if (first !== prev.first) olderRequested.current = false;
    prevRef.current = {
      first,
      last,
      count: rows.length,
      height: el.scrollHeight,
    };
  }, [rows, scrollToBottom]);

  // Images and media load after layout: stay pinned while content grows.
  React.useEffect(() => {
    const content = contentRef.current;
    if (!content || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const el = viewportRef.current;
      if (el && stickRef.current) el.scrollTop = el.scrollHeight;
      if (el) prevRef.current.height = el.scrollHeight;
    });
    ro.observe(content);
    return () => ro.disconnect();
  }, []);

  const requestOlder = React.useCallback(() => {
    if (!hasOlder || loading || !onLoadOlder || olderRequested.current) return;
    olderRequested.current = true;
    onLoadOlder();
  }, [hasOlder, loading, onLoadOlder]);

  // A finished load (loading → false) may be retried.
  React.useEffect(() => {
    if (!loading) olderRequested.current = false;
  }, [loading]);

  const onScroll = () => {
    const el = viewportRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    const bottom = distance <= STICK_THRESHOLD;
    stickRef.current = bottom;
    setAtBottom(bottom);
    if (bottom) setUnseen(0);
    if (el.scrollTop <= LOAD_OLDER_THRESHOLD) requestOlder();
  };

  const today = startOfDay(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const dayLabel = (d: Date) =>
    isSameDay(d, today)
      ? t.today
      : isSameDay(d, yesterday)
        ? t.yesterday
        : fmt.date(d, {
            day: "numeric",
            month: "long",
            year:
              d.getFullYear() === today.getFullYear() ? undefined : "numeric",
          });

  const isEmpty = items.length === 0;

  return (
    <div
      ref={ref}
      data-slot="chat-thread"
      className={cn("relative flex min-h-0 flex-1 flex-col", className)}
    >
      <div
        ref={viewportRef}
        role="log"
        aria-label={t.conversation}
        aria-busy={loading || undefined}
        tabIndex={0}
        data-slot="chat-thread-viewport"
        onScroll={onScroll}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-inset"
      >
        <div ref={contentRef} className="flex min-h-full flex-col px-4 py-4">
          {hasOlder && !isEmpty && (
            <div className="flex justify-center pb-3">
              {loading ? (
                <Spinner className="size-5 text-ink-3" aria-label={t.loading} />
              ) : (
                <button
                  type="button"
                  data-slot="chat-thread-load-older"
                  onClick={requestOlder}
                  className={cn(
                    "min-h-8 cursor-pointer !rounded-pill px-3 text-ui-label font-medium text-ink-2 hover:bg-ui-surface-2 hover:text-ink-1",
                    focusRing,
                  )}
                >
                  {t.loadOlder}
                </button>
              )}
            </div>
          )}
          {isEmpty ? (
            loading ? (
              <div className="flex flex-1 items-center justify-center py-12">
                <Spinner className="size-6 text-ink-3" aria-label={t.loading} />
              </div>
            ) : (
              <div
                data-slot="chat-thread-empty"
                className="flex flex-1 items-center justify-center py-12"
              >
                {empty}
              </div>
            )
          ) : (
            // Push a short thread to the bottom, next to the composer.
            <div className="mt-auto flex flex-col">
              {rows.map((row, i) => (
                <React.Fragment key={row.key}>
                  {row.day && (
                    <div
                      data-slot="chat-thread-day"
                      className={cn(
                        "flex justify-center pb-2",
                        i === 0 ? "pt-0" : "pt-5",
                      )}
                    >
                      <time
                        dateTime={row.day.toISOString()}
                        className="!rounded-pill bg-ui-surface-2 px-3 py-0.5 text-ui-caption font-medium text-ink-3"
                      >
                        {dayLabel(row.day)}
                      </time>
                    </div>
                  )}
                  <div
                    data-slot="chat-thread-item"
                    data-grouped={row.grouped}
                    className={
                      row.grouped === "middle" || row.grouped === "last"
                        ? "pt-0.5"
                        : i === 0 || row.day
                          ? ""
                          : "pt-4"
                    }
                  >
                    {renderItem(row.item, row.grouped)}
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
      {!atBottom && unseen > 0 && (
        <button
          type="button"
          data-slot="chat-thread-new"
          onClick={() => scrollToBottom(true)}
          className={cn(
            "absolute bottom-3 left-1/2 z-(--tj-z-sticky) inline-flex min-h-8 -translate-x-1/2 cursor-pointer items-center gap-1.5 !rounded-pill border border-hairline bg-ui-surface px-3.5 text-ui-label font-semibold text-ink-1 shadow-tj-md hover:bg-ui-surface-2",
            focusRing,
          )}
        >
          {t.newMessages}
          <span className="inline-flex min-w-5 items-center justify-center !rounded-pill bg-brand-solid px-1.5 text-ui-micro font-bold text-on-brand">
            {unseen}
          </span>
          <ArrowDown aria-hidden className="size-4" />
        </button>
      )}
    </div>
  );
}

/**
 * Scrolling message list for a conversation. Owns its scroll: give it a
 * parent with `min-h-0 flex-1` (a flex column) and it fills it. Adds day
 * separators, groups messages by author (5-minute window), follows new
 * messages unless the reader has scrolled up — then a "new messages ↓" pill
 * appears — and asks for older messages at the top (`onLoadOlder`).
 */
export const ChatThread = React.forwardRef(ChatThreadInner) as <T>(
  props: ChatThreadProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement;
(ChatThread as unknown as { displayName: string }).displayName = "ChatThread";
