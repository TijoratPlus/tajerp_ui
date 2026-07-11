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

let counter = 0;
function push(tone: ToastTone, message: React.ReactNode, opts?: ToastOptions): string {
  const id = `t${++counter}`;
  const duration = opts?.duration ?? 5000;
  items = [...items, { id, tone, message, description: opts?.description, duration }];
  emit();
  if (duration > 0) setTimeout(() => dismiss(id), duration);
  return id;
}
function dismiss(id: string) {
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
  success: { icon: CheckCircle2, cls: "text-tj-success" },
  error: { icon: XCircle, cls: "text-tj-error" },
  warning: { icon: AlertTriangle, cls: "text-tj-warning" },
  info: { icon: Info, cls: "text-tj-info" },
};

/**
 * Renders active toasts in a fixed stack. Mount once near the app root.
 */
export function Toaster({
  position = "bottom-right",
}: {
  position?: "bottom-right" | "bottom-center" | "top-right";
}) {
  const toasts = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return (
    <div
      className={cn(
        "pointer-events-none fixed z-[100] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2",
        position === "bottom-right" && "bottom-4 right-4",
        position === "bottom-center" && "bottom-4 left-1/2 -translate-x-1/2",
        position === "top-right" && "top-4 right-4",
      )}
    >
      {toasts.map((t) => {
        const { icon: Icon, cls } = TONE[t.tone];
        return (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 !rounded-xl border border-hairline bg-ui-surface p-3.5 shadow-tj-lg"
          >
            <Icon className={cn("mt-0.5 size-5 shrink-0", cls)} />
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-bold text-ink-1">{t.message}</p>
              {t.description ? (
                <p className="mt-0.5 text-[12.5px] text-ink-3">{t.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="shrink-0 !rounded-md p-0.5 text-ink-3 transition-colors hover:text-ink-1 cursor-pointer"
              aria-label="Закрыть"
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
