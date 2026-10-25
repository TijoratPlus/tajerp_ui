import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import * as React from "react";

import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import { focusRing } from "../lib/control";
import { useOnlineStatus } from "../lib/useOnlineStatus";
import { useFormat, useMessages } from "./TajUIProvider";

function ruSales(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "продажа ждёт отправки";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
    return "продажи ждут отправки";
  return "продаж ждут отправки";
}

export const syncStatusMessages = defineMessages("syncStatus", {
  ru: {
    online: "В сети",
    offline: "Нет связи",
    syncing: "Синхронизация…",
    error: "Ошибка синхронизации",
    pending: (count: number, formatted: string) => `${formatted} ${ruSales(count)}`,
    lastSynced: (when: string) => `Синхронизировано ${when}`,
    retry: "Повторить",
  },
  tg: {
    online: "Дар шабака",
    offline: "Алоқа нест",
    syncing: "Ҳамоҳангсозӣ…",
    error: "Хатои ҳамоҳангсозӣ",
    pending: (_count: number, formatted: string) =>
      `${formatted} фурӯш дар навбати ирсол`,
    lastSynced: (when: string) => `Ҳамоҳангсозии охирин: ${when}`,
    retry: "Такрор кардан",
  },
  en: {
    online: "Online",
    offline: "Offline",
    syncing: "Syncing…",
    error: "Sync failed",
    pending: (count: number, formatted: string) =>
      `${formatted} ${count === 1 ? "sale" : "sales"} waiting to send`,
    lastSynced: (when: string) => `Synced ${when}`,
    retry: "Retry",
  },
});

export type SyncStatusLabels = (typeof syncStatusMessages.locales)["ru"];

export type SyncState = "online" | "offline" | "syncing" | "error";

export type SyncStatusProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  status: SyncState;
  /** Sales queued locally and not yet sent to the server. */
  pending?: number;
  /** Time of the last successful sync, shown as relative time in `full`. */
  lastSyncedAt?: Date | number | string;
  /**
   * `compact`: icon + dot (+ pending count) with the text for screen readers
   * and as a tooltip — for headers. `full` (default): icon + text.
   */
  variant?: "compact" | "full";
  /** Shown as a "Повторить" button while `status` is "error". */
  onRetry?: () => void;
  labels?: Partial<SyncStatusLabels>;
};

const STATUS_STYLE: Record<
  SyncState,
  { icon: typeof Wifi; dot: string; ink: string }
> = {
  online: { icon: Wifi, dot: "bg-tj-success", ink: "text-tj-success-ink" },
  offline: { icon: WifiOff, dot: "bg-tj-warning", ink: "text-tj-warning-ink" },
  syncing: { icon: RefreshCw, dot: "bg-tj-info", ink: "text-tj-info-ink" },
  error: { icon: AlertTriangle, dot: "bg-tj-error", ink: "text-tj-error-ink" },
};

/** Re-render every `ms` so relative times stay current. */
function useNow(enabled: boolean, ms = 30_000): number {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    if (!enabled) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(id);
  }, [enabled, ms]);
  return now;
}

/**
 * Connection and sync state for the offline-first POS: online, offline with
 * queued sales, syncing, or a failed sync with a retry button. Status is
 * conveyed by icon and text, never colour alone, and announced politely.
 */
export const SyncStatus = React.forwardRef<HTMLDivElement, SyncStatusProps>(
  (
    {
      className,
      status,
      pending = 0,
      lastSyncedAt,
      variant = "full",
      onRetry,
      labels,
      title,
      ...props
    },
    ref,
  ) => {
    const t = useMessages(syncStatusMessages, labels);
    const fmt = useFormat();
    const showTime = lastSyncedAt !== undefined && variant === "full";
    const now = useNow(showTime);
    const { icon: Icon, dot, ink } = STATUS_STYLE[status];

    const pendingText = pending > 0 ? t.pending(pending, fmt.number(pending)) : "";
    const message = [t[status], pendingText].filter(Boolean).join(" · ");
    const syncedText =
      lastSyncedAt !== undefined ? t.lastSynced(fmt.relative(lastSyncedAt, now)) : "";
    const compact = variant === "compact";

    return (
      <div
        ref={ref}
        data-slot="sync-status"
        data-status={status}
        data-variant={variant}
        title={title ?? (compact ? [message, syncedText].filter(Boolean).join(". ") : undefined)}
        className={cn(
          "inline-flex items-center gap-2 text-ui-label",
          !compact && "flex-wrap",
          className,
        )}
        {...props}
      >
        <span
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={cn("inline-flex items-center gap-1.5 font-semibold", ink)}
        >
          <span className="relative inline-flex">
            <Icon
              aria-hidden
              className={cn(
                "size-4 shrink-0",
                status === "syncing" && "motion-safe:animate-spin",
              )}
            />
            {compact ? (
              <span
                aria-hidden
                className={cn(
                  "absolute -right-0.5 -bottom-0.5 size-2 !rounded-full ring-2 ring-ui-surface",
                  dot,
                )}
              />
            ) : null}
          </span>
          {compact ? (
            <>
              <span className="sr-only">{message}</span>
              {pending > 0 ? (
                <span
                  aria-hidden
                  className="inline-flex min-w-5 h-5 items-center justify-center px-1 !rounded-pill bg-ui-surface-2 border border-hairline text-ink-1 text-ui-caption font-bold tabular-nums"
                >
                  {fmt.number(pending)}
                </span>
              ) : null}
            </>
          ) : (
            <span>{message}</span>
          )}
        </span>

        {showTime ? (
          <span data-slot="sync-status-time" className="text-ink-3 text-ui-helper">
            {syncedText}
          </span>
        ) : null}

        {status === "error" && onRetry ? (
          <button
            type="button"
            data-slot="sync-status-retry"
            onClick={onRetry}
            aria-label={compact ? t.retry : undefined}
            className={cn(
              "inline-flex items-center gap-1 !rounded-md font-bold text-brand-ink cursor-pointer",
              "hover:bg-mist transition-colors",
              compact ? "size-6 justify-center" : "h-6 px-2",
              focusRing,
            )}
          >
            <RefreshCw aria-hidden className="size-3.5" />
            {compact ? null : t.retry}
          </button>
        ) : null}
      </div>
    );
  },
);
SyncStatus.displayName = "SyncStatus";

export type OfflineIndicatorProps = Omit<SyncStatusProps, "status"> & {
  /** A sync is in progress (shown only while online). */
  syncing?: boolean;
  /** The last sync failed (shown only while online). */
  error?: boolean;
  /** Fires when the browser goes online or offline. */
  onOnlineChange?: (online: boolean) => void;
};

/** SyncStatus wired to the browser's online state (`useOnlineStatus`). */
export const OfflineIndicator = React.forwardRef<HTMLDivElement, OfflineIndicatorProps>(
  ({ syncing = false, error = false, onOnlineChange, ...props }, ref) => {
    const online = useOnlineStatus();
    const onChange = React.useRef(onOnlineChange);
    React.useEffect(() => {
      onChange.current = onOnlineChange;
    });
    const previous = React.useRef(online);
    React.useEffect(() => {
      if (previous.current === online) return;
      previous.current = online;
      onChange.current?.(online);
    }, [online]);

    const status: SyncState = !online
      ? "offline"
      : error
        ? "error"
        : syncing
          ? "syncing"
          : "online";
    return <SyncStatus ref={ref} status={status} {...props} />;
  },
);
OfflineIndicator.displayName = "OfflineIndicator";
