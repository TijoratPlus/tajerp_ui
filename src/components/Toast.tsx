"use client";

import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";
import { Spinner } from "./Spinner";
import { useCommonMessages } from "./TajUIProvider";

export type ToastTone = "success" | "error" | "warning" | "info" | "loading";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  tone: ToastTone;
  message: React.ReactNode;
  description?: React.ReactNode;
  duration: number;
  action?: ToastAction;
}

export interface ToastOptions {
  description?: React.ReactNode;
  /** Auto-dismiss delay in ms (default 5000; 0 keeps it until dismissed). */
  duration?: number;
  /** One inline action, e.g. "Отменить" (undo) or "Повторить". */
  action?: ToastAction;
  /** Reuse an id to replace an existing toast instead of stacking a new one. */
  id?: string;
}

// ── Tiny external store ─────────────────────────────────────────────────────
// Module-level by design (an imperative `toast()` callable from anywhere).
// In SSR, render <Toaster /> only on the client.
let items: ToastItem[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
const getSnapshot = () => items;
const getServerSnapshot = (): ToastItem[] => [];

// Auto-dismiss timers. Paused while the pointer or keyboard focus is inside the
// stack so people can finish reading (WCAG 2.2.1 Timing Adjustable).
const timers = new Map<
  string,
  { handle?: ReturnType<typeof setTimeout>; remaining: number; startedAt: number }
>();
let paused = false;

function startTimer(id: string) {
  const t = timers.get(id);
  if (!t || paused) return;
  t.startedAt = Date.now();
  t.handle = setTimeout(() => dismiss(id), t.remaining);
}
function clearTimer(id: string) {
  const t = timers.get(id);
  if (t?.handle) clearTimeout(t.handle);
  timers.delete(id);
}
function pauseTimers() {
  if (paused) return;
  paused = true;
  timers.forEach((t) => {
    if (t.handle) clearTimeout(t.handle);
    t.handle = undefined;
    t.remaining = Math.max(1000, t.remaining - (Date.now() - t.startedAt));
  });
}
function resumeTimers() {
  if (!paused) return;
  paused = false;
  timers.forEach((_, id) => startTimer(id));
}

let counter = 0;
function push(tone: ToastTone, message: React.ReactNode, opts?: ToastOptions): string {
  const id = opts?.id ?? `t${++counter}`;
  // Loading toasts stay until they are updated or dismissed.
  const duration = opts?.duration ?? (tone === "loading" ? 0 : 5000);
  const item: ToastItem = {
    id,
    tone,
    message,
    description: opts?.description,
    duration,
    action: opts?.action,
  };
  const exists = items.some((t) => t.id === id);
  items = exists ? items.map((t) => (t.id === id ? item : t)) : [...items, item];
  emit();
  clearTimer(id);
  if (duration > 0) {
    timers.set(id, { remaining: duration, startedAt: Date.now() });
    startTimer(id);
  }
  return id;
}
function dismiss(id?: string) {
  if (id === undefined) {
    timers.forEach((_, tid) => clearTimer(tid));
    items = [];
  } else {
    clearTimer(id);
    items = items.filter((t) => t.id !== id);
  }
  emit();
}

/** Imperative toast API — call from anywhere (no hook required). */
export const toast = {
  success: (message: React.ReactNode, opts?: ToastOptions) => push("success", message, opts),
  error: (message: React.ReactNode, opts?: ToastOptions) => push("error", message, opts),
  warning: (message: React.ReactNode, opts?: ToastOptions) => push("warning", message, opts),
  info: (message: React.ReactNode, opts?: ToastOptions) => push("info", message, opts),
  /** A spinner toast that stays until updated (e.g. "Отправка чека…"). */
  loading: (message: React.ReactNode, opts?: ToastOptions) => push("loading", message, opts),
  /** Replace the content/tone of an existing toast. */
  update: (id: string, tone: ToastTone, message: React.ReactNode, opts?: Omit<ToastOptions, "id">) =>
    push(tone, message, { ...opts, id }),
  /**
   * Show a loading toast while `promise` runs, then success or error.
   * Returns the original promise.
   */
  promise: <T,>(
    promise: Promise<T>,
    msgs: {
      loading: React.ReactNode;
      success: React.ReactNode | ((value: T) => React.ReactNode);
      error: React.ReactNode | ((error: unknown) => React.ReactNode);
    },
    opts?: Omit<ToastOptions, "id">,
  ): Promise<T> => {
    const id = push("loading", msgs.loading, { ...opts, duration: 0 });
    promise.then(
      (value) =>
        push("success", typeof msgs.success === "function" ? msgs.success(value) : msgs.success, {
          ...opts,
          id,
        }),
      (error) =>
        push("error", typeof msgs.error === "function" ? msgs.error(error) : msgs.error, {
          ...opts,
          id,
        }),
    );
    return promise;
  },
  /** Dismiss one toast, or all when called without an id. */
  dismiss,
};

const TONE: Record<
  ToastTone,
  { icon?: React.ComponentType<{ className?: string }>; cls: string }
> = {
  success: { icon: CheckCircle2, cls: "text-tj-success-ink" },
  error: { icon: XCircle, cls: "text-tj-error-ink" },
  warning: { icon: AlertTriangle, cls: "text-tj-warning-ink" },
  info: { icon: Info, cls: "text-tj-info-ink" },
  loading: { cls: "text-brand" },
};

export interface ToasterProps {
  position?: "bottom-right" | "bottom-center" | "top-right" | "top-center";
  /** Accessible label of each toast's close button. Defaults to the locale's. */
  closeLabel?: string;
  /** Maximum toasts shown at once; older ones wait. Defaults to 4. */
  limit?: number;
}

/**
 * Renders active toasts in a fixed stack. Mount once near the app root.
 *
 * Two persistent live regions announce new toasts: errors in an assertive
 * one, everything else in a polite one (so nothing is read twice). Auto-dismiss
 * pauses while the stack is hovered or focused.
 */
export function Toaster({
  position = "bottom-right",
  closeLabel,
  limit = 4,
}: ToasterProps) {
  const t = useCommonMessages();
  const all = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const visible = all.slice(-limit);
  const errors = visible.filter((x) => x.tone === "error");
  const others = visible.filter((x) => x.tone !== "error");
  const top = position.startsWith("top");

  const renderItem = (item: ToastItem) => {
    const { icon: Icon, cls } = TONE[item.tone];
    return (
      <div
        key={item.id}
        data-slot="toast"
        data-tone={item.tone}
        className={cn(
          "pointer-events-auto flex items-start gap-2 !rounded-xl border border-hairline bg-ui-surface p-3 shadow-tj-lg animate-in fade-in-0",
          top ? "slide-in-from-top" : "slide-in-from-bottom-2",
        )}
      >
        {Icon ? (
          <Icon className={cn("mt-0.5 size-5 shrink-0", cls)} aria-hidden />
        ) : (
          <Spinner className="mt-0.5 size-5 shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-ui-body font-bold text-ink-1">{item.message}</p>
          {item.description ? (
            <p className="mt-0.5 text-ui-helper text-ink-3">{item.description}</p>
          ) : null}
          {item.action ? (
            <button
              type="button"
              onClick={() => {
                item.action?.onClick();
                dismiss(item.id);
              }}
              className="mt-1.5 -ml-1 inline-flex min-h-6 items-center !rounded-md px-1 text-ui-label font-bold text-brand-ink outline-none transition-colors hover:bg-mist focus-visible:ring-2 focus-visible:ring-focus cursor-pointer"
            >
              {item.action.label}
            </button>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => dismiss(item.id)}
          className="-m-1 inline-flex size-7 shrink-0 items-center justify-center !rounded-md text-ink-3 outline-none transition-colors hover:bg-ui-surface-2 hover:text-ink-1 focus-visible:ring-2 focus-visible:ring-focus cursor-pointer"
          aria-label={closeLabel ?? t.close}
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    );
  };

  return (
    <section
      aria-label={t.notifications}
      data-slot="toaster"
      onMouseEnter={pauseTimers}
      onMouseLeave={resumeTimers}
      onFocus={pauseTimers}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) resumeTimers();
      }}
      className={cn(
        "pointer-events-none fixed z-(--tj-z-toast) flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2",
        position === "bottom-right" &&
          "right-4 bottom-[max(1rem,env(safe-area-inset-bottom))]",
        position === "bottom-center" &&
          "left-1/2 bottom-[max(1rem,env(safe-area-inset-bottom))] -translate-x-1/2",
        position === "top-right" && "right-4 top-[max(1rem,env(safe-area-inset-top))]",
        position === "top-center" &&
          "left-1/2 top-[max(1rem,env(safe-area-inset-top))] -translate-x-1/2",
      )}
    >
      <div aria-live="assertive" aria-relevant="additions text" className="flex flex-col gap-2">
        {errors.map(renderItem)}
      </div>
      <div aria-live="polite" aria-relevant="additions text" className="flex flex-col gap-2">
        {others.map(renderItem)}
      </div>
    </section>
  );
}
