import { Info, SendHorizontal } from "lucide-react";
import * as React from "react";

import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import { focusRing } from "../lib/control";
import { Spinner } from "./Spinner";
import { useMessages } from "./TajUIProvider";

export const chatComposerMessages = defineMessages("chatComposer", {
  ru: {
    placeholder: "Напишите сообщение…",
    send: "Отправить",
    sending: "Отправляется…",
    message: "Сообщение",
    hint: "Enter — отправить, Shift+Enter — новая строка",
  },
  tg: {
    placeholder: "Паём нависед…",
    send: "Фиристодан",
    sending: "Фиристода мешавад…",
    message: "Паём",
    hint: "Enter — фиристодан, Shift+Enter — сатри нав",
  },
  en: {
    placeholder: "Write a message…",
    send: "Send",
    sending: "Sending…",
    message: "Message",
    hint: "Enter to send, Shift+Enter for a new line",
  },
});

export type ChatComposerLabels = Partial<
  (typeof chatComposerMessages.locales)["ru"]
>;

export interface ChatComposerProps {
  value: string;
  onChange: (v: string) => void;
  /** Called on Enter (outside IME composition) and by the send button, when there is text. */
  onSend: () => void;
  /** A send is in flight: the button shows a spinner and Enter is ignored. Typing stays possible. */
  sending?: boolean;
  disabled?: boolean;
  /** Why sending is not possible (e.g. "the 24-hour reply window has closed"). Shown above the field; disables it. */
  disabledReason?: React.ReactNode;
  placeholder?: string;
  /** Before the field, e.g. attach and emoji buttons. */
  leading?: React.ReactNode;
  /** Between the field and the send button, e.g. a templates menu. */
  trailing?: React.ReactNode;
  /** Rows the field grows to before it scrolls. Defaults to 8. */
  maxRows?: number;
  autoFocus?: boolean;
  className?: string;
  /** Override UI strings. */
  labels?: ChatComposerLabels;
}

/** Fallback when the computed line height is "normal" (jsdom, some browsers). */
const FALLBACK_LINE_HEIGHT = 22;

/** Grow a textarea with its content up to `maxRows`, then scroll. */
export function autosizeTextarea(el: HTMLTextAreaElement, maxRows: number) {
  const style = window.getComputedStyle(el);
  const lineHeight = parseFloat(style.lineHeight) || FALLBACK_LINE_HEIGHT;
  const pad =
    (parseFloat(style.paddingTop) || 0) +
    (parseFloat(style.paddingBottom) || 0);
  const border =
    (parseFloat(style.borderTopWidth) || 0) +
    (parseFloat(style.borderBottomWidth) || 0);
  el.style.height = "auto";
  // scrollHeight is content + padding (no border).
  const natural = el.scrollHeight;
  const max = lineHeight * maxRows + pad;
  const target = Math.min(natural, max);
  el.style.height = `${style.boxSizing === "border-box" ? target + border : target - pad}px`;
  el.style.overflowY = natural > max ? "auto" : "hidden";
}

/**
 * Message input for a conversation. The field grows with the text (up to
 * `maxRows`), Enter sends and Shift+Enter starts a new line; Enter that
 * confirms an IME composition (e.g. a Chinese or Japanese keyboard) does not
 * send. The ref points at the textarea, so you can focus it after a send.
 */
export const ChatComposer = React.forwardRef<
  HTMLTextAreaElement,
  ChatComposerProps
>(
  (
    {
      value,
      onChange,
      onSend,
      sending = false,
      disabled = false,
      disabledReason,
      placeholder,
      leading,
      trailing,
      maxRows = 8,
      autoFocus,
      className,
      labels,
    },
    ref,
  ) => {
    const t = useMessages(chatComposerMessages, labels);
    const innerRef = React.useRef<HTMLTextAreaElement>(null);
    React.useImperativeHandle(
      ref,
      () => innerRef.current as HTMLTextAreaElement,
    );
    const composing = React.useRef(false);
    const id = React.useId();
    const hintId = `${id}-hint`;
    const reasonId = `${id}-reason`;

    const hasReason =
      disabledReason !== undefined &&
      disabledReason !== null &&
      disabledReason !== false;
    const isDisabled = disabled || hasReason;
    const canSend = !isDisabled && !sending && value.trim().length > 0;

    React.useLayoutEffect(() => {
      if (innerRef.current) autosizeTextarea(innerRef.current, maxRows);
    }, [value, maxRows]);

    const send = () => {
      if (canSend) onSend();
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key !== "Enter" || e.shiftKey) return;
      // IME: the Enter that commits a composition must not send (keyCode 229
      // covers Safari, which ends composition before keydown).
      if (composing.current || e.nativeEvent.isComposing || e.keyCode === 229)
        return;
      // Ctrl/Cmd+Enter also sends; Alt+Enter is left to the platform.
      if (e.altKey) return;
      e.preventDefault();
      send();
    };

    return (
      <div
        data-slot="chat-composer"
        data-disabled={isDisabled || undefined}
        className={cn("flex flex-col gap-2", className)}
      >
        {hasReason && (
          <div
            id={reasonId}
            role="status"
            data-slot="chat-composer-reason"
            className="flex items-start gap-2 !rounded-lg bg-ui-surface-2 px-3 py-2 text-ui-label text-ink-2"
          >
            <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-3" />
            <div className="min-w-0">{disabledReason}</div>
          </div>
        )}
        <div
          data-slot="chat-composer-frame"
          className={cn(
            "flex items-end gap-1.5 !rounded-2xl border border-hairline-strong bg-ui-surface p-1.5 transition-colors duration-150",
            "focus-within:border-brand focus-within:ring-2 focus-within:ring-focus",
            isDisabled && "bg-ui-surface-2",
          )}
        >
          {leading && (
            <div
              data-slot="chat-composer-leading"
              className="flex shrink-0 items-center gap-0.5"
            >
              {leading}
            </div>
          )}
          <textarea
            ref={innerRef}
            data-slot="chat-composer-input"
            rows={1}
            value={value}
            placeholder={placeholder ?? t.placeholder}
            aria-label={t.message}
            aria-describedby={hasReason ? `${reasonId} ${hintId}` : hintId}
            disabled={isDisabled}
            autoFocus={autoFocus}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            onCompositionStart={() => {
              composing.current = true;
            }}
            onCompositionEnd={() => {
              composing.current = false;
            }}
            className="min-h-control-sm min-w-0 flex-1 resize-none bg-transparent px-2 py-1.5 text-ui-control leading-normal text-ink-1 outline-none placeholder:font-normal placeholder:text-ink-4 disabled:cursor-not-allowed"
          />
          {trailing && (
            <div
              data-slot="chat-composer-trailing"
              className="flex shrink-0 items-center gap-0.5"
            >
              {trailing}
            </div>
          )}
          <button
            type="button"
            data-slot="chat-composer-send"
            onClick={send}
            disabled={!canSend}
            aria-label={sending ? t.sending : t.send}
            aria-busy={sending || undefined}
            className={cn(
              "inline-flex size-control-sm shrink-0 cursor-pointer items-center justify-center !rounded-xl bg-brand-solid text-on-brand transition-colors duration-150 hover:bg-brand-solid-hover disabled:cursor-not-allowed disabled:bg-ui-surface-2 disabled:text-ink-4",
              focusRing,
              "focus-visible:ring-offset-1 focus-visible:ring-offset-ui-surface",
            )}
          >
            {sending ? (
              <Spinner className="size-4 text-current" />
            ) : (
              <SendHorizontal aria-hidden className="size-4" />
            )}
          </button>
        </div>
        <span id={hintId} className="sr-only">
          {t.hint}
        </span>
      </div>
    );
  },
);
ChatComposer.displayName = "ChatComposer";
