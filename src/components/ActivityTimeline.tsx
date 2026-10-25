import { Settings, Sparkles } from "lucide-react";
import * as React from "react";

import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";
import { useFormat, useMessages } from "./TajUIProvider";

export const activityTimelineMessages = defineMessages("activityTimeline", {
  ru: {
    label: "Журнал действий",
    today: "Сегодня",
    yesterday: "Вчера",
    ai: "AI",
    aiAssistant: "ИИ-ассистент",
    system: "Система",
    empty: "Пока нет событий",
  },
  tg: {
    label: "Сабти амалҳо",
    today: "Имрӯз",
    yesterday: "Дирӯз",
    ai: "AI",
    aiAssistant: "Ёрдамчии зеҳни сунъӣ",
    system: "Система",
    empty: "Ҳоло ягон амал нест",
  },
  en: {
    label: "Activity log",
    today: "Today",
    yesterday: "Yesterday",
    ai: "AI",
    aiAssistant: "AI assistant",
    system: "System",
    empty: "No activity yet",
  },
});

export type ActivityTimelineMessages =
  (typeof activityTimelineMessages.locales)["ru"];

export type ActivityActorKind = "user" | "ai" | "system";

export interface ActivityActor {
  name: string;
  /** `ai` adds an "AI" badge (TijoratAI); `system` a gear marker. */
  kind?: ActivityActorKind;
  /** Avatar image URL (users). */
  avatar?: string;
}

export type ActivityTone =
  "brand" | "neutral" | "success" | "warning" | "danger" | "info";

export interface ActivityItem {
  id: string;
  actor: ActivityActor;
  /** What happened: "создал черновик заказа", "утвердил". */
  action: React.ReactNode;
  /** Object of the action, shown emphasized: "ЗП-00142". */
  target?: React.ReactNode;
  time: Date | number | string;
  /** Marker colour (with `icon`). */
  tone?: ActivityTone;
  /** Marker icon instead of the actor's avatar. */
  icon?: React.ReactNode;
  /** Extra line: a note, an amount, an attachment. */
  meta?: React.ReactNode;
}

export interface ActivityTimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  items: ActivityItem[];
  /** Split into "Сегодня" / "Вчера" / date sections (items in given order). */
  groupByDay?: boolean;
  /** Reference time for relative labels (defaults to now). */
  now?: Date | number;
  /** Shown when `items` is empty. */
  emptyState?: React.ReactNode;
  labels?: Partial<ActivityTimelineMessages>;
}

const toneMarker: Record<ActivityTone, string> = {
  brand: "bg-mist text-mist-ink",
  neutral: "bg-ui-surface-2 text-ink-2 border border-hairline",
  success: "bg-tj-success/12 text-tj-success-ink",
  warning: "bg-tj-warning/15 text-tj-warning-ink",
  danger: "bg-tj-error/12 text-tj-error-ink",
  info: "bg-tj-info/12 text-tj-info-ink",
};

function toDate(value: Date | number | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Audit / activity feed: who did what and when, including TijoratAI drafts
 * and the people who approved them. Use on document pages, customer cards
 * and the dashboard "Последние действия" panel.
 */
export const ActivityTimeline = React.forwardRef<
  HTMLDivElement,
  ActivityTimelineProps
>(
  (
    {
      className,
      items,
      groupByDay = false,
      now: nowProp,
      emptyState,
      labels,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const t = useMessages(activityTimelineMessages, labels);
    const f = useFormat();
    const baseId = React.useId();
    const now = nowProp === undefined ? Date.now() : toDate(nowProp).getTime();

    const groups = React.useMemo(() => {
      if (!groupByDay)
        return [{ key: "all", date: undefined as Date | undefined, items }];
      const out: {
        key: string;
        date: Date | undefined;
        items: ActivityItem[];
      }[] = [];
      for (const item of items) {
        const d = toDate(item.time);
        const key = Number.isNaN(d.getTime()) ? "unknown" : dayKey(d);
        const last = out[out.length - 1];
        if (last && last.key === key) last.items.push(item);
        else
          out.push({
            key,
            date: Number.isNaN(d.getTime()) ? undefined : d,
            items: [item],
          });
      }
      return out;
    }, [items, groupByDay]);

    const dayLabel = (d: Date | undefined) => {
      if (!d) return "—";
      const today = new Date(now);
      const yesterday = new Date(now);
      yesterday.setDate(today.getDate() - 1);
      if (dayKey(d) === dayKey(today)) return t.today;
      if (dayKey(d) === dayKey(yesterday)) return t.yesterday;
      return f.date(d, {
        day: "numeric",
        month: "long",
        year: d.getFullYear() === today.getFullYear() ? undefined : "numeric",
      });
    };

    if (items.length === 0) {
      return (
        <div
          ref={ref}
          data-slot="activity-timeline"
          className={cn("py-6 text-center text-ui-body text-ink-3", className)}
          {...props}
        >
          {emptyState ?? t.empty}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        data-slot="activity-timeline"
        className={cn("flex flex-col gap-4", className)}
        {...props}
      >
        {groups.map((group, gi) => {
          const headingId = `${baseId}-day-${gi}`;
          return (
            <div
              key={group.key}
              data-slot="activity-timeline-group"
              className="flex flex-col gap-2"
            >
              {groupByDay ? (
                <p
                  id={headingId}
                  data-slot="activity-timeline-day"
                  className="text-ui-caption font-bold tracking-[0.04em] text-ink-3 uppercase"
                >
                  {dayLabel(group.date)}
                </p>
              ) : null}
              <ol
                aria-label={groupByDay ? undefined : (ariaLabel ?? t.label)}
                aria-labelledby={groupByDay ? headingId : undefined}
                className="flex flex-col"
              >
                {group.items.map((item, i) => (
                  <TimelineEntry
                    key={item.id}
                    item={item}
                    last={i === group.items.length - 1}
                    now={now}
                    t={t}
                  />
                ))}
              </ol>
            </div>
          );
        })}
      </div>
    );
  },
);
ActivityTimeline.displayName = "ActivityTimeline";

function TimelineEntry({
  item,
  last,
  now,
  t,
}: {
  item: ActivityItem;
  last: boolean;
  now: number;
  t: ActivityTimelineMessages;
}) {
  const f = useFormat();
  const kind = item.actor.kind ?? "user";
  const date = toDate(item.time);
  const valid = !Number.isNaN(date.getTime());

  let marker: React.ReactNode;
  if (item.icon || kind !== "user") {
    const tone = item.tone ?? (kind === "ai" ? "brand" : "neutral");
    marker = (
      <span
        aria-hidden
        className={cn(
          "inline-flex size-8 items-center justify-center !rounded-full [&>svg]:size-4",
          toneMarker[tone],
        )}
      >
        {item.icon ?? (kind === "ai" ? <Sparkles /> : <Settings />)}
      </span>
    );
  } else {
    marker = (
      <Avatar aria-hidden className="size-8">
        {item.actor.avatar ? (
          <AvatarImage src={item.actor.avatar} alt="" />
        ) : null}
        <AvatarFallback className="text-ui-caption">
          {initials(item.actor.name)}
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <li
      data-slot="activity-timeline-item"
      data-actor-kind={kind}
      className={cn("relative flex gap-3", !last && "pb-4")}
    >
      {!last ? (
        <span
          aria-hidden
          data-slot="activity-timeline-line"
          className="absolute top-9 bottom-1 left-4 w-px -translate-x-1/2 bg-hairline"
        />
      ) : null}
      <span className="relative shrink-0">{marker}</span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-1">
        <p className="text-ui-body leading-snug text-ink-2">
          <span className="font-semibold text-ink-1">{item.actor.name}</span>
          {kind === "ai" ? (
            <span
              data-slot="activity-timeline-ai-badge"
              title={t.aiAssistant}
              className="ml-1.5 inline-flex items-center !rounded-pill bg-mist px-1.5 py-px align-middle text-ui-micro font-bold tracking-[0.06em] text-mist-ink"
            >
              <span aria-hidden>{t.ai}</span>
              <span className="sr-only">({t.aiAssistant})</span>
            </span>
          ) : null}{" "}
          {item.action}
          {item.target ? (
            <>
              {" "}
              <span className="font-semibold text-ink-1">{item.target}</span>
            </>
          ) : null}
        </p>
        {valid ? (
          <time
            dateTime={date.toISOString()}
            title={f.date(date, { dateStyle: "long", timeStyle: "short" })}
            className="text-ui-caption text-ink-3"
          >
            {f.relative(date, now)}
          </time>
        ) : null}
        {item.meta ? (
          <div
            data-slot="activity-timeline-meta"
            className="mt-1 text-ui-helper text-ink-2"
          >
            {item.meta}
          </div>
        ) : null}
      </div>
    </li>
  );
}
