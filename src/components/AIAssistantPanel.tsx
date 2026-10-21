import { ArrowDown, Mic, SendHorizontal, Sparkles, X } from "lucide-react";
import * as React from "react";

import { defineMessages } from "../i18n/messages";
import { focusRing } from "../lib/control";
import { cn } from "../lib/cn";
import { Button } from "./Button";
import {
  ChatBubble,
  type ChatChannel,
  type ChatMessageStatus,
  type ChatRole,
} from "./ChatBubble";
import { Textarea } from "./Textarea";
import { useCommonMessages, useMessages } from "./TajUIProvider";

export interface AIMessage {
  id: string;
  role: ChatRole;
  /** Message body: text or any node (e.g. an ApprovalCard). */
  content: React.ReactNode;
  author?: string;
  avatar?: React.ReactNode;
  time?: Date | number | string;
  status?: ChatMessageStatus;
  channel?: ChatChannel;
  onRetry?: () => void;
  /** Let rich content use the full bubble width. */
  fullWidth?: boolean;
}

export type AIAssistantPanelMessages = {
  assistantName: string;
  subtitle: string;
  log: (name: string) => string;
  typing: (name: string) => string;
  placeholder: string;
  composerLabel: string;
  send: string;
  voice: string;
  suggestions: string;
  suggestion1: string;
  suggestion2: string;
  suggestion3: string;
  greetingTitle: (name: string) => string;
  greetingBody: string;
  newMessages: string;
};

export const aiAssistantPanelMessages = defineMessages<AIAssistantPanelMessages>(
  "aiAssistantPanel",
  {
    ru: {
      assistantName: "TijoratAI",
      subtitle: "Ваш помощник по бизнесу",
      log: (name) => `Переписка с ${name}`,
      typing: (name) => `${name} печатает…`,
      placeholder: "Спросите о продажах, долгах или складе…",
      composerLabel: "Сообщение",
      send: "Отправить",
      voice: "Голосовой ввод",
      suggestions: "Подсказки",
      suggestion1: "Сколько я заработал сегодня?",
      suggestion2: "Кто мне должен?",
      suggestion3: "Что заканчивается на складе?",
      greetingTitle: (name) => `Салом! Я ${name}`,
      greetingBody:
        "Считаю выручку, слежу за долгами и остатками, готовлю заказы и SMS. Ничего без вашего «да».",
      newMessages: "Новые сообщения",
    },
    tg: {
      assistantName: "TijoratAI",
      subtitle: "Ёрдамчии тиҷоратии шумо",
      log: (name) => `Мукотиба бо ${name}`,
      typing: (name) => `${name} менависад…`,
      placeholder: "Дар бораи фурӯш, қарзҳо ё анбор пурсед…",
      composerLabel: "Паём",
      send: "Фиристодан",
      voice: "Вуруди овозӣ",
      suggestions: "Пешниҳодҳо",
      suggestion1: "Имрӯз чӣ қадар фоида кардам?",
      suggestion2: "Кӣ ба ман қарздор аст?",
      suggestion3: "Дар анбор чӣ тамом шуда истодааст?",
      greetingTitle: (name) => `Салом! Ман ${name} ҳастам`,
      greetingBody:
        "Даромадро ҳисоб мекунам, қарзҳо ва бақияро назорат мекунам, фармоишҳо ва SMS омода мекунам. Бе «ҳа»-и шумо ҳеҷ чиз иҷро намешавад.",
      newMessages: "Паёмҳои нав",
    },
    en: {
      assistantName: "TijoratAI",
      subtitle: "Your business assistant",
      log: (name) => `Conversation with ${name}`,
      typing: (name) => `${name} is typing…`,
      placeholder: "Ask about sales, debts or stock…",
      composerLabel: "Message",
      send: "Send",
      voice: "Voice input",
      suggestions: "Suggestions",
      suggestion1: "How much did I earn today?",
      suggestion2: "Who owes me money?",
      suggestion3: "What is running low in stock?",
      greetingTitle: (name) => `Salom! I'm ${name}`,
      greetingBody:
        "I track revenue, debts and stock, and draft orders and SMS. Nothing happens without your “yes”.",
      newMessages: "New messages",
    },
  },
);

export interface AIAssistantPanelProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "onSubmit"> {
  /** Defaults to "TijoratAI". */
  assistantName?: string;
  /** Line under the name. Defaults to a localized tagline; pass null to hide. */
  subtitle?: React.ReactNode;
  /** Shows a close button in the header. */
  onClose?: () => void;
  messages: AIMessage[];
  /** Custom message renderer; defaults to ChatBubble. */
  renderMessage?: (message: AIMessage, index: number) => React.ReactNode;
  /** Show the "TijoratAI печатает…" indicator. */
  typing?: boolean;
  /** Quick prompts. Defaults to three localized ones; pass [] to hide. */
  suggestions?: string[];
  /** "empty" (default): only before the first message. "always": above the composer. */
  suggestionsPlacement?: "empty" | "always";
  /** Send a message (composer or suggestion). A rejected Promise restores the draft. */
  onSend?: (text: string) => void | Promise<unknown>;
  /** Blocks sending (the assistant is answering). */
  busy?: boolean;
  /** Shows a mic button. */
  onVoice?: () => void;
  /** Marks the mic button as pressed (recording). */
  voiceActive?: boolean;
  /** Content shown while there are no messages. Defaults to a greeting. */
  emptyState?: React.ReactNode;
  /** Composer text (controlled). */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  /** Heading level of the assistant name. Defaults to 2. */
  headingLevel?: 2 | 3 | 4;
  labels?: Partial<AIAssistantPanelMessages>;
}

const MAX_LINES = 6;
const STICK_THRESHOLD = 48;

/**
 * The TijoratAI chat panel: header, conversation log, quick suggestions and a
 * composer. Drafted actions arrive as ApprovalCards inside assistant bubbles;
 * nothing runs without the owner's "yes". Place it in a Sheet, a side column
 * or full screen on phones; give it a height (it fills its parent).
 */
export const AIAssistantPanel = React.forwardRef<HTMLElement, AIAssistantPanelProps>(
  (
    {
      assistantName,
      subtitle,
      onClose,
      messages,
      renderMessage,
      typing = false,
      suggestions,
      suggestionsPlacement = "empty",
      onSend,
      busy = false,
      onVoice,
      voiceActive,
      emptyState,
      value: valueProp,
      defaultValue = "",
      onValueChange,
      placeholder,
      headingLevel = 2,
      labels,
      className,
      ...props
    },
    ref,
  ) => {
    const t = useMessages(aiAssistantPanelMessages, labels);
    const common = useCommonMessages();
    const name = assistantName ?? t.assistantName;
    const uid = React.useId();
    const titleId = `${uid}-title`;
    const composerId = `${uid}-composer`;
    const Heading = `h${headingLevel}` as "h2";

    // ── Composer value (controlled / uncontrolled) ─────────────────────────
    const [inner, setInner] = React.useState(defaultValue);
    const controlled = valueProp !== undefined;
    const value = controlled ? valueProp : inner;
    const setValue = React.useCallback(
      (next: string) => {
        if (!controlled) setInner(next);
        onValueChange?.(next);
      },
      [controlled, onValueChange],
    );

    // ── Auto-grow textarea up to MAX_LINES ─────────────────────────────────
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    React.useLayoutEffect(() => {
      const el = textareaRef.current;
      if (!el || typeof window === "undefined") return;
      const cs = window.getComputedStyle(el);
      const line = parseFloat(cs.lineHeight) || 20;
      const border =
        (parseFloat(cs.borderTopWidth) || 0) + (parseFloat(cs.borderBottomWidth) || 0);
      const padding =
        (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
      const max = line * MAX_LINES + padding + border;
      el.style.height = "auto";
      const needed = el.scrollHeight + border;
      el.style.height = `${Math.min(needed, max)}px`;
      el.style.overflowY = needed > max ? "auto" : "hidden";
    }, [value]);

    // ── Auto-scroll, unless the user scrolled up ───────────────────────────
    const logRef = React.useRef<HTMLDivElement>(null);
    const stickRef = React.useRef(true);
    const [unseen, setUnseen] = React.useState(false);
    const lastId = messages[messages.length - 1]?.id;

    const scrollToBottom = React.useCallback(() => {
      const el = logRef.current;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
      stickRef.current = true;
      setUnseen(false);
    }, []);

    React.useLayoutEffect(() => {
      if (stickRef.current) scrollToBottom();
      else setUnseen(true);
    }, [messages.length, lastId, typing, scrollToBottom]);

    const onLogScroll = () => {
      const el = logRef.current;
      if (!el) return;
      const atBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight <= STICK_THRESHOLD;
      stickRef.current = atBottom;
      if (atBottom) setUnseen(false);
    };

    // ── Sending ────────────────────────────────────────────────────────────
    const send = (text: string, fromComposer: boolean) => {
      const trimmed = text.trim();
      if (!trimmed || busy || !onSend) return;
      if (fromComposer) setValue("");
      stickRef.current = true;
      const result = onSend(trimmed);
      if (fromComposer && result && typeof result.then === "function") {
        result.then(undefined, () => {
          if (!controlled) setInner((cur) => (cur === "" ? text : cur));
          else onValueChange?.(text);
        });
      }
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
      e.preventDefault();
      send(value, true);
    };

    const chips = suggestions ?? [t.suggestion1, t.suggestion2, t.suggestion3];
    const isEmpty = messages.length === 0;
    const showChips =
      chips.length > 0 && (suggestionsPlacement === "always" || isEmpty);
    const canSend = !busy && !!onSend && value.trim().length > 0;

    return (
      <section
        ref={ref}
        data-slot="ai-assistant-panel"
        aria-labelledby={titleId}
        aria-busy={busy || undefined}
        className={cn(
          "flex h-full min-h-0 flex-col overflow-hidden border border-hairline bg-ui-surface text-ink-1 !rounded-xl",
          className,
        )}
        {...props}
      >
        {/* Header */}
        <header
          data-slot="ai-assistant-panel-header"
          className="flex shrink-0 items-center gap-3 border-hairline border-b px-4 py-3"
        >
          <span
            aria-hidden
            className="inline-flex size-9 shrink-0 items-center justify-center !rounded-full bg-brand-solid text-on-brand"
          >
            <Sparkles className="size-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <Heading id={titleId} className="truncate font-bold text-ink-1 text-ui-title">
              {name}
            </Heading>
            {subtitle !== null && (
              <p className="truncate text-ink-3 text-ui-helper">{subtitle ?? t.subtitle}</p>
            )}
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={common.close}
              onClick={onClose}
            >
              <X aria-hidden className="size-4" />
            </Button>
          )}
        </header>

        {/* Messages */}
        <div className="relative min-h-0 flex-1">
          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            aria-label={t.log(name)}
            tabIndex={0}
            onScroll={onLogScroll}
            data-slot="ai-assistant-panel-log"
            className={cn(
              "flex h-full flex-col gap-3 overflow-y-auto overscroll-contain px-4 py-4",
              focusRing,
              "focus-visible:ring-inset",
            )}
          >
            {isEmpty &&
              (emptyState ?? (
                <div
                  data-slot="ai-assistant-panel-empty"
                  className="m-auto flex max-w-sm flex-col items-center gap-2 px-2 py-6 text-center"
                >
                  <span
                    aria-hidden
                    className="inline-flex size-12 items-center justify-center !rounded-full bg-mist text-mist-ink"
                  >
                    <Sparkles className="size-6" />
                  </span>
                  <p className="font-bold text-ink-1 text-ui-title">{t.greetingTitle(name)}</p>
                  <p className="text-ink-3 text-ui-body leading-relaxed">{t.greetingBody}</p>
                </div>
              ))}

            {messages.map((m, i) =>
              renderMessage ? (
                <React.Fragment key={m.id}>{renderMessage(m, i)}</React.Fragment>
              ) : (
                <ChatBubble
                  key={m.id}
                  role={m.role}
                  author={m.author ?? (m.role === "assistant" ? name : undefined)}
                  avatar={m.avatar}
                  time={m.time}
                  status={m.status}
                  channel={m.channel}
                  onRetry={m.onRetry}
                  fullWidth={m.fullWidth}
                >
                  {m.content}
                </ChatBubble>
              ),
            )}

            {typing && (
              <div
                data-slot="ai-assistant-panel-typing"
                className="flex items-center gap-2 self-start !rounded-2xl !rounded-bl-sm border border-hairline bg-ui-surface-2 px-3.5 py-3"
              >
                <span aria-hidden className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="size-1.5 !rounded-full bg-ink-3 motion-safe:animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </span>
                <span className="sr-only">{t.typing(name)}</span>
              </div>
            )}
          </div>

          {unseen && (
            <button
              type="button"
              onClick={scrollToBottom}
              data-slot="ai-assistant-panel-jump"
              className={cn(
                "absolute bottom-3 left-1/2 inline-flex min-h-8 -translate-x-1/2 items-center gap-1.5 !rounded-pill border border-hairline bg-ui-surface px-3 font-bold text-brand-ink text-ui-label shadow-tj-md cursor-pointer",
                focusRing,
              )}
            >
              <ArrowDown aria-hidden className="size-3.5" />
              {t.newMessages}
            </button>
          )}
        </div>

        {/* Suggestions */}
        {showChips && (
          <ul
            aria-label={t.suggestions}
            data-slot="ai-assistant-panel-suggestions"
            className="flex shrink-0 flex-wrap gap-2 px-4 pb-2"
          >
            {chips.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  disabled={busy || !onSend}
                  onClick={() => send(s, false)}
                  className={cn(
                    "inline-flex min-h-control-sm items-center !rounded-pill border border-brand/30 bg-mist px-3 py-1 text-left font-medium text-mist-ink text-ui-label transition-colors hover:border-brand/60 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60",
                    focusRing,
                  )}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Composer */}
        <form
          data-slot="ai-assistant-panel-composer"
          className="flex shrink-0 items-end gap-2 border-hairline border-t px-3 py-3"
          onSubmit={(e) => {
            e.preventDefault();
            send(value, true);
          }}
        >
          <label htmlFor={composerId} className="sr-only">
            {t.composerLabel}
          </label>
          <Textarea
            ref={textareaRef}
            id={composerId}
            rows={1}
            value={value}
            placeholder={placeholder ?? t.placeholder}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            enterKeyHint="send"
            className="min-h-control-md resize-none py-2 text-ui-control leading-normal"
          />
          {onVoice && (
            <Button
              variant="ghost"
              size="icon"
              aria-label={t.voice}
              aria-pressed={voiceActive}
              onClick={onVoice}
              className={cn("shrink-0", voiceActive && "bg-mist text-brand-ink")}
            >
              <Mic aria-hidden className="size-4.5" />
            </Button>
          )}
          <Button
            type="submit"
            variant="solid"
            size="icon"
            aria-label={t.send}
            disabled={!canSend}
            className="shrink-0"
          >
            <SendHorizontal aria-hidden className="size-4.5" />
          </Button>
        </form>
      </section>
    );
  },
);
AIAssistantPanel.displayName = "AIAssistantPanel";
