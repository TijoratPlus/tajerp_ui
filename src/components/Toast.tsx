"use client";

import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

export type ToastTone = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  tone: ToastTone;
  message: React.ReactNode;
  description?: React.ReactNode;
  duration: number;
}

export interface ToastOptions {
  description?: React.ReactNode;
  /** Auto-dismiss delay in ms (default 5000; 0 keeps it until dismissed). */
  duration?: number;
}

// ── Tiny external store ─────────────────────────────────────────────────────
let items: ToastItem[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
const getSnapshot = () => items;

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
  const id = `t${++counter}`;
  const duration = opts?.duration ?? 5000;
  items = [...items, { id, tone, message, description: opts?.description, duration }];
  emit();
  if (duration > 0) {
    timers.set(id, { remaining: duration, startedAt: Date.now() });
    startTimer(id);
  }
  return id;
}
function dismiss(id: string) {
  const t = timers.get(id);
  if (t?.handle) clearTimeout(t.handle);
  timers.delete(id);
  items = items.filter((t) => t.id !== id);
  emit();
}

/** Imperative toast API — call from anywhere (no hook required). */
export const toast = {
  success: (message: React.ReactNode, opts?: ToastOptions) => push("success", message, opts),
  error: (message: React.ReactNode, opts?: ToastOptions) => push("error", message, opts),
  warning: (message: React.ReactNode, opts?: ToastOptions) => push("warning", message, opts),
  info: (message: React.ReactNode, opts?: ToastOptions) => push("info", message, opts),
  dismiss,
};

const TONE: Record<
  ToastTone,
  { icon: React.ComponentType<{ className?: string }>; cls: string }
> = {
  success: { icon: CheckCircle2, cls: "text-tj-success-ink" },
  error: { icon: XCircle, cls: "text-tj-error-ink" },
  warning: { icon: AlertTriangle, cls: "text-tj-warning-ink" },
  info: { icon: Info, cls: "text-tj-info-ink" },
};

/**
 * Renders active toasts in a fixed stack. Mount once near the app root.
 *
 * The stack is a persistent polite live region, so new toasts are announced;
 * error toasts use `role="alert"` and interrupt. Auto-dismiss pauses while
 * the stack is hovered or focused.
 */
export function Toaster({
  position = "bottom-right",
  closeLabel = "Закрыть",
}: {
  position?: "bottom-right" | "bottom-center" | "top-right";
  /** Accessible label of each toast's close button. */
  closeLabel?: string;
}) {
  const toasts = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      onMouseEnter={pauseTimers}
      onMouseLeave={resumeTimers}
      onFocus={pauseTimers}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) resumeTimers();
      }}
      className={cn(
        "pointer-events-none fixed z-[100] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2",
        position === "bottom-right" &&
          "right-4 bottom-[max(1rem,env(safe-area-inset-bottom))]",
        position === "bottom-center" &&
          "left-1/2 bottom-[max(1rem,env(safe-area-inset-bottom))] -translate-x-1/2",
        position === "top-right" && "right-4 top-[max(1rem,env(safe-area-inset-top))]",
      )}
    >
      {toasts.map((t) => {
        const { icon: Icon, cls } = TONE[t.tone];
        return (
          <div
            key={t.id}
            // The stack itself is the polite live region; errors escalate.
            role={t.tone === "error" ? "alert" : undefined}
            className="pointer-events-auto flex items-start gap-2 !rounded-xl border border-hairline bg-ui-surface p-3 shadow-tj-lg animate-in fade-in-0 slide-in-from-bottom-2"
          >
            <Icon className={cn("mt-0.5 size-5 shrink-0", cls)} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-bold text-ink-1">{t.message}</p>
              {t.description ? (
                <p className="mt-0.5 text-[12.5px] text-ink-3">{t.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="-m-1 inline-flex size-7 shrink-0 items-center justify-center !rounded-md text-ink-3 outline-none transition-colors hover:bg-ui-surface-2 hover:text-ink-1 focus-visible:ring-2 focus-visible:ring-brand/40 cursor-pointer"
              aria-label={closeLabel}
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        );
      })}
    </div>
  );
}
