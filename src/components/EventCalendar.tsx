import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import { focusRing } from "../lib/control";
import {
  addDays,
  addMonths,
  daysInMonth,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  weekdayIndex,
} from "../lib/date";
import { formatClock } from "../lib/time";
import { Button } from "./Button";
import { calendarMessages } from "./Calendar";
import { SegmentedControl } from "./SegmentedControl";
import { useMessages } from "./TajUIProvider";

// ─── Types ──────────────────────────────────────────────────────────

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  /**
   * End of the event. For `allDay` events the end is exclusive (00:00 of the
   * day after the last day); an end equal to the start means one day.
   */
  end: Date;
  allDay?: boolean;
  /** Any CSS colour (a token var such as `var(--ui-chart-2)` is preferred). */
  color?: string;
  data?: unknown;
}

export type CalendarView = "day" | "week" | "month";

export interface CalendarEventRange {
  start: Date;
  end: Date;
  allDay: boolean;
}

export interface EventCalendarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  events: CalendarEvent[];
  view?: CalendarView;
  defaultView?: CalendarView;
  onViewChange?: (view: CalendarView) => void;
  /** Anchor date: the shown day, a day of the shown week or month. */
  date?: Date;
  defaultDate?: Date;
  onDateChange?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onEventDoubleClick?: (event: CalendarEvent) => void;
  /**
   * Click on an empty slot or drag across slots. All-day ranges end at
   * 00:00 of the day after the last selected day (exclusive).
   */
  onCreate?: (range: CalendarEventRange) => void;
  /** An event was moved or resized (drag, or Alt+arrows on a focused event). */
  onEventChange?: (event: CalendarEvent, next: CalendarEventRange) => void;
  /** First day of the week: 1 = Monday (default), 0 = Sunday. */
  weekStartsOn?: 0 | 1;
  /** Snap step for creating, moving and resizing. Defaults to 30. */
  slotMinutes?: 15 | 30 | 60;
  /** Height of one hour row in px. Defaults to 48. */
  hourHeight?: number;
  /** Max height of the scrolling time grid. Defaults to 640px. */
  bodyHeight?: number | string;
  /** Hour scrolled into view when the time grid mounts. Defaults to 8. */
  scrollToHour?: number;
  /** Events listed per month cell before "+N more". Defaults to 3. */
  maxEventsPerDay?: number;
  /** Set false to disable drag-create, move and resize. */
  editable?: boolean;
  /** Custom event content (title/time by default). */
  renderEvent?: (event: CalendarEvent, view: CalendarView) => React.ReactNode;
  /** Extra controls at the end of the toolbar (filters, "New event"). */
  toolbarExtra?: React.ReactNode;
  showToolbar?: boolean;
  /** Override "now" (tests, screenshots). Defaults to the live clock. */
  now?: Date;
  labels?: Partial<EventCalendarLabels>;
}

// ─── Strings ────────────────────────────────────────────────────────

const RU_MONTHS_OF = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];
const TG_MONTHS_OF = [
  "январи", "феврали", "марти", "апрели", "майи", "июни",
  "июли", "августи", "сентябри", "октябри", "ноябри", "декабри",
];
const EN_MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const span = (a: Date, b: Date, monthsOf: string[], suffix = "") =>
  a.getMonth() === b.getMonth()
    ? `${a.getDate()}–${b.getDate()} ${monthsOf[b.getMonth()]} ${b.getFullYear()}${suffix}`
    : a.getFullYear() === b.getFullYear()
      ? `${a.getDate()} ${monthsOf[a.getMonth()]} – ${b.getDate()} ${monthsOf[b.getMonth()]} ${b.getFullYear()}${suffix}`
      : `${a.getDate()} ${monthsOf[a.getMonth()]} ${a.getFullYear()} – ${b.getDate()} ${monthsOf[b.getMonth()]} ${b.getFullYear()}${suffix}`;

export const eventCalendarMessages = defineMessages("eventCalendar", {
  ru: {
    today: "Сегодня",
    prev: "Назад",
    next: "Вперёд",
    day: "День",
    week: "Неделя",
    month: "Месяц",
    viewLabel: "Вид календаря",
    allDay: "Весь день",
    untitled: "(без названия)",
    more: (n: number) => `Ещё ${n}`,
    openDay: (label: string) => `Открыть день: ${label}`,
    weekTitle: (from: Date, to: Date) => span(from, to, RU_MONTHS_OF, " г."),
    dayTitle: (d: Date) => `${d.getDate()} ${RU_MONTHS_OF[d.getMonth()]} ${d.getFullYear()} г.`,
  },
  tg: {
    today: "Имрӯз",
    prev: "Қаблӣ",
    next: "Баъдӣ",
    day: "Рӯз",
    week: "Ҳафта",
    month: "Моҳ",
    viewLabel: "Намуди тақвим",
    allDay: "Тамоми рӯз",
    untitled: "(бе ном)",
    more: (n: number) => `Боз ${n}`,
    openDay: (label: string) => `Кушодани рӯз: ${label}`,
    weekTitle: (from: Date, to: Date) => span(from, to, TG_MONTHS_OF),
    dayTitle: (d: Date) => `${d.getDate()} ${TG_MONTHS_OF[d.getMonth()]} ${d.getFullYear()}`,
  },
  en: {
    today: "Today",
    prev: "Previous",
    next: "Next",
    day: "Day",
    week: "Week",
    month: "Month",
    viewLabel: "Calendar view",
    allDay: "All day",
    untitled: "(no title)",
    more: (n: number) => `${n} more`,
    openDay: (label: string) => `Open day: ${label}`,
    weekTitle: (from: Date, to: Date) =>
      from.getMonth() === to.getMonth()
        ? `${EN_MONTHS_SHORT[from.getMonth()]} ${from.getDate()}–${to.getDate()}, ${to.getFullYear()}`
        : `${EN_MONTHS_SHORT[from.getMonth()]} ${from.getDate()} – ${EN_MONTHS_SHORT[to.getMonth()]} ${to.getDate()}, ${to.getFullYear()}`,
    dayTitle: (d: Date) =>
      `${EN_MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
  },
});

export type EventCalendarLabels = (typeof eventCalendarMessages.locales)["ru"];

// ─── Date math ──────────────────────────────────────────────────────

const DAY_MS = 86_400_000;
const MINUTES_PER_DAY = 1440;

function startOfWeekOn(date: Date, weekStartsOn: 0 | 1): Date {
  const d = startOfDay(date);
  return addDays(d, -((d.getDay() - weekStartsOn + 7) % 7));
}

/** Whole calendar days from `b` to `a` (DST-safe). */
function dayDiff(a: Date, b: Date): number {
  return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / DAY_MS);
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

function minutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** The last calendar day an event touches. */
function lastDayOf(e: CalendarEvent): Date {
  if (e.end.getTime() <= e.start.getTime()) return startOfDay(e.start);
  return startOfDay(new Date(e.end.getTime() - 1));
}

/** Shown in the all-day row (week/day) instead of the time grid. */
function isAllDayRow(e: CalendarEvent): boolean {
  return !!e.allDay || e.end.getTime() - e.start.getTime() >= DAY_MS;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function visibleDays(view: CalendarView, anchor: Date, weekStartsOn: 0 | 1): Date[] {
  if (view === "day") return [startOfDay(anchor)];
  if (view === "week") {
    const first = startOfWeekOn(anchor, weekStartsOn);
    return Array.from({ length: 7 }, (_, i) => addDays(first, i));
  }
  const monthStart = startOfMonth(anchor);
  const first = startOfWeekOn(monthStart, weekStartsOn);
  const lead = dayDiff(monthStart, first);
  const weeks = Math.ceil((lead + daysInMonth(anchor.getFullYear(), anchor.getMonth())) / 7);
  return Array.from({ length: weeks * 7 }, (_, i) => addDays(first, i));
}

// ─── Layout ─────────────────────────────────────────────────────────

interface TimedSegment {
  event: CalendarEvent;
  col: number;
  startMin: number;
  endMin: number;
  /** The segment holds the event's real end (can be resized). */
  hasEnd: boolean;
  lane: number;
  lanes: number;
}

function timedSegments(events: CalendarEvent[], days: Date[]): TimedSegment[][] {
  const cols: TimedSegment[][] = days.map(() => []);
  for (const event of events) {
    if (isAllDayRow(event)) continue;
    days.forEach((day, col) => {
      const dayStart = day.getTime();
      const dayEnd = addDays(day, 1).getTime();
      const s = event.start.getTime();
      const e = Math.max(event.end.getTime(), s + 1);
      if (e <= dayStart || s >= dayEnd) return;
      const startMin = s <= dayStart ? 0 : minutesOfDay(event.start);
      const endMin = e >= dayEnd ? MINUTES_PER_DAY : Math.max(startMin + 1, minutesOfDay(event.end));
      cols[col].push({ event, col, startMin, endMin, hasEnd: e <= dayEnd, lane: 0, lanes: 1 });
    });
  }
  // Side-by-side lanes for overlapping events, per cluster of overlaps.
  for (const segs of cols) {
    segs.sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);
    let cluster: TimedSegment[] = [];
    let laneEnds: number[] = [];
    let clusterEnd = -1;
    const flush = () => {
      for (const s of cluster) s.lanes = laneEnds.length;
      cluster = [];
      laneEnds = [];
    };
    for (const seg of segs) {
      if (seg.startMin >= clusterEnd) flush();
      let lane = laneEnds.findIndex((end) => end <= seg.startMin);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(seg.endMin);
      } else laneEnds[lane] = seg.endMin;
      seg.lane = lane;
      cluster.push(seg);
      clusterEnd = Math.max(clusterEnd, seg.endMin);
    }
    flush();
  }
  return cols;
}

interface DayBar {
  event: CalendarEvent;
  from: number;
  to: number;
  lane: number;
}

function allDayBars(events: CalendarEvent[], days: Date[]): DayBar[] {
  const first = days[0];
  const n = days.length;
  const bars: DayBar[] = [];
  const sorted = events
    .filter(isAllDayRow)
    .sort(
      (a, b) =>
        a.start.getTime() - b.start.getTime() ||
        dayDiff(lastDayOf(b), b.start) - dayDiff(lastDayOf(a), a.start),
    );
  const laneEnds: number[] = [];
  for (const event of sorted) {
    const from = dayDiff(event.start, first);
    const to = dayDiff(lastDayOf(event), first);
    if (to < 0 || from > n - 1) continue;
    const f = clamp(from, 0, n - 1);
    const t = clamp(to, 0, n - 1);
    let lane = laneEnds.findIndex((end) => end < f);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(t);
    } else laneEnds[lane] = t;
    bars.push({ event, from: f, to: t, lane });
  }
  return bars;
}

function eventsOnDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events
    .filter((e) => dayDiff(e.start, day) <= 0 && dayDiff(lastDayOf(e), day) >= 0)
    .sort(
      (a, b) =>
        Number(isAllDayRow(b)) - Number(isAllDayRow(a)) ||
        a.start.getTime() - b.start.getTime(),
    );
}

// ─── Drag state ─────────────────────────────────────────────────────

type DragArea = "time" | "allday" | "month";

interface DragState {
  kind: "create" | "move" | "resize";
  area: DragArea;
  event?: CalendarEvent;
  startX: number;
  startY: number;
  moved: boolean;
  /** Day index (into the visible days) where the pointer went down / is now. */
  anchorIdx: number;
  curIdx: number;
  /** Unsnapped minutes of day (time area only). */
  anchorMin: number;
  curMin: number;
}

const eventStyle = (color: string | undefined) =>
  ({ "--tj-event": color ?? "var(--ui-brand)" }) as React.CSSProperties;

const eventChrome =
  "border-l-[3px] border-(color:--tj-event) bg-[color-mix(in_srgb,var(--tj-event)_16%,var(--ui-surface))] text-ink-1 hover:bg-[color-mix(in_srgb,var(--tj-event)_26%,var(--ui-surface))]";

// ─── Component ──────────────────────────────────────────────────────

/**
 * Day / week / month calendar for meetings, calls and tasks. Drag on empty
 * time to create, drag an event to move it, drag its bottom edge to resize.
 * A focused event moves with Alt+↑/↓ (one slot) and Alt+←/→ (one day), and
 * resizes with Alt+Shift+↑/↓.
 */
export const EventCalendar = React.forwardRef<HTMLDivElement, EventCalendarProps>(
  (props, ref) => {
    const {
      events,
      view: viewProp,
      defaultView = "week",
      onViewChange,
      date: dateProp,
      defaultDate,
      onDateChange,
      onEventClick,
      onEventDoubleClick,
      onCreate,
      onEventChange,
      weekStartsOn = 1,
      slotMinutes = 30,
      hourHeight = 48,
      bodyHeight = 640,
      scrollToHour = 8,
      maxEventsPerDay = 3,
      editable = true,
      renderEvent,
      toolbarExtra,
      showToolbar = true,
      now: nowProp,
      labels,
      className,
      ...rest
    } = props;
    const t = useMessages(eventCalendarMessages, labels);
    const cal = useMessages(calendarMessages);

    const [viewState, setViewState] = React.useState<CalendarView>(defaultView);
    const view = viewProp ?? viewState;
    const setView = (v: CalendarView) => {
      if (viewProp === undefined) setViewState(v);
      onViewChange?.(v);
    };

    const [liveNow, setLiveNow] = React.useState(() => new Date());
    React.useEffect(() => {
      if (nowProp) return;
      const id = window.setInterval(() => setLiveNow(new Date()), 60_000);
      return () => window.clearInterval(id);
    }, [nowProp]);
    const now = nowProp ?? liveNow;

    const [dateState, setDateState] = React.useState<Date>(() => defaultDate ?? nowProp ?? new Date());
    const anchor = dateProp ?? dateState;
    const setAnchor = (d: Date) => {
      if (dateProp === undefined) setDateState(d);
      onDateChange?.(d);
    };

    const days = React.useMemo(
      () => visibleDays(view, anchor, weekStartsOn),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [view, anchor.getTime(), weekStartsOn],
    );

    const step = (dir: 1 | -1) => {
      if (view === "day") setAnchor(addDays(anchor, dir));
      else if (view === "week") setAnchor(addDays(anchor, 7 * dir));
      else setAnchor(addMonths(anchor, dir));
    };

    const openDay = (d: Date) => {
      setAnchor(d);
      setView("day");
    };

    const title =
      view === "month"
        ? `${cal.monthName(anchor.getMonth())} ${anchor.getFullYear()}`
        : view === "week"
          ? t.weekTitle(days[0], days[days.length - 1])
          : t.dayTitle(anchor);

    // ── Dragging ────────────────────────────────────────────────────
    const canCreate = editable && !!onCreate;
    const canChange = editable && !!onEventChange;

    const timeColsRef = React.useRef<HTMLDivElement>(null);
    const allDayRef = React.useRef<HTMLDivElement>(null);
    const monthRef = React.useRef<HTMLDivElement>(null);
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const dragRef = React.useRef<DragState | null>(null);
    const [drag, setDrag] = React.useState<DragState | null>(null);
    /** Swallow the click that follows a drag that moved. */
    const suppressClick = React.useRef(false);

    const snap = (min: number) => Math.round(min / slotMinutes) * slotMinutes;
    const floorSlot = (min: number) => Math.floor(min / slotMinutes) * slotMinutes;

    const pointFor = React.useCallback(
      (area: DragArea, x: number, y: number) => {
        const el =
          area === "time" ? timeColsRef.current : area === "allday" ? allDayRef.current : monthRef.current;
        const rect = el?.getBoundingClientRect();
        if (!rect || rect.width === 0) return { idx: 0, min: 0 };
        if (area === "month") {
          const rows = Math.max(1, days.length / 7);
          const col = clamp(Math.floor(((x - rect.left) / rect.width) * 7), 0, 6);
          const row = clamp(Math.floor(((y - rect.top) / Math.max(1, rect.height)) * rows), 0, rows - 1);
          return { idx: row * 7 + col, min: 0 };
        }
        const idx = clamp(Math.floor(((x - rect.left) / rect.width) * days.length), 0, days.length - 1);
        const min = clamp(((y - rect.top) / hourHeight) * 60, 0, MINUTES_PER_DAY);
        return { idx, min };
      },
      [days.length, hourHeight],
    );

    const rangeFor = React.useCallback(
      (d: DragState): CalendarEventRange | null => {
        const dayShift = d.curIdx - d.anchorIdx;
        if (d.kind === "create") {
          if (d.area === "time") {
            const a = floorSlot(clamp(d.anchorMin, 0, MINUTES_PER_DAY - slotMinutes));
            const c = floorSlot(clamp(d.curMin, 0, MINUTES_PER_DAY - slotMinutes));
            const day = days[d.anchorIdx];
            return {
              start: addMinutes(day, Math.min(a, c)),
              end: addMinutes(day, Math.max(a, c) + slotMinutes),
              allDay: false,
            };
          }
          const lo = Math.min(d.anchorIdx, d.curIdx);
          const hi = Math.max(d.anchorIdx, d.curIdx);
          return { start: days[lo], end: addDays(days[hi], 1), allDay: true };
        }
        const e = d.event;
        if (!e) return null;
        const allDay = !!e.allDay;
        if (d.area !== "time") {
          return { start: addDays(e.start, dayShift), end: addDays(e.end, dayShift), allDay };
        }
        const deltaMin = snap(d.curMin - d.anchorMin);
        if (d.kind === "resize") {
          const end = addMinutes(e.end, deltaMin);
          const minEnd = addMinutes(e.start, slotMinutes);
          return { start: e.start, end: end < minEnd ? minEnd : end, allDay };
        }
        return {
          start: addMinutes(addDays(e.start, dayShift), deltaMin),
          end: addMinutes(addDays(e.end, dayShift), deltaMin),
          allDay,
        };
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [days, slotMinutes],
    );

    const finishRef = React.useRef<(d: DragState) => void>(() => {});
    finishRef.current = (d: DragState) => {
      const range = rangeFor(d);
      if (!range) return;
      if (d.kind === "create") {
        onCreate?.(range);
        return;
      }
      if (!d.moved || !d.event) return;
      suppressClick.current = true;
      window.setTimeout(() => (suppressClick.current = false), 0);
      const e = d.event;
      if (range.start.getTime() !== e.start.getTime() || range.end.getTime() !== e.end.getTime()) {
        onEventChange?.(e, range);
      }
    };

    React.useEffect(() => {
      if (!drag) return;
      const move = (ev: PointerEvent) => {
        const d = dragRef.current;
        if (!d) return;
        const p = pointFor(d.area, ev.clientX, ev.clientY);
        const moved = d.moved || Math.hypot(ev.clientX - d.startX, ev.clientY - d.startY) > 3;
        const next = { ...d, curIdx: d.kind === "resize" ? d.anchorIdx : p.idx, curMin: p.min, moved };
        dragRef.current = next;
        setDrag(next);
      };
      const up = () => {
        const d = dragRef.current;
        dragRef.current = null;
        setDrag(null);
        if (d) finishRef.current(d);
      };
      const cancel = () => {
        dragRef.current = null;
        setDrag(null);
      };
      const key = (ev: KeyboardEvent) => {
        if (ev.key === "Escape") cancel();
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", cancel);
      window.addEventListener("keydown", key);
      return () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", cancel);
        window.removeEventListener("keydown", key);
      };
      // Listeners are attached once per drag gesture.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [drag !== null]);

    const begin = (
      e: React.PointerEvent,
      kind: DragState["kind"],
      area: DragArea,
      event?: CalendarEvent,
    ) => {
      if (e.button !== 0) return;
      // An event's pointerdown never reaches the empty-slot handler below it.
      if (kind !== "create") e.stopPropagation();
      if (kind === "create" ? !canCreate : !canChange) return;
      const p = pointFor(area, e.clientX, e.clientY);
      const d: DragState = {
        kind,
        area,
        event,
        startX: e.clientX,
        startY: e.clientY,
        moved: false,
        anchorIdx: p.idx,
        curIdx: p.idx,
        anchorMin: p.min,
        curMin: p.min,
      };
      if (kind === "create") e.preventDefault();
      dragRef.current = d;
      setDrag(d);
    };

    // While dragging, show the event at its new place.
    const preview = drag && drag.kind !== "create" && drag.moved ? rangeFor(drag) : null;
    const shown = React.useMemo(() => {
      if (!preview || !drag?.event) return events;
      return events.map((e) =>
        e === drag.event ? { ...e, start: preview.start, end: preview.end } : e,
      );
    }, [events, preview?.start.getTime(), preview?.end.getTime(), drag?.event]); // eslint-disable-line react-hooks/exhaustive-deps
    const createPreview = drag?.kind === "create" ? rangeFor(drag) : null;

    // ── Keyboard move/resize ────────────────────────────────────────
    const onEventKeyDown = (e: React.KeyboardEvent, event: CalendarEvent) => {
      if (!canChange || !e.altKey) return;
      const allDay = !!event.allDay;
      let next: CalendarEventRange | null = null;
      const timed = view !== "month" && !isAllDayRow(event);
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const d = e.key === "ArrowLeft" ? -1 : 1;
        next = { start: addDays(event.start, d), end: addDays(event.end, d), allDay };
      } else if ((e.key === "ArrowUp" || e.key === "ArrowDown") && timed) {
        const m = e.key === "ArrowUp" ? -slotMinutes : slotMinutes;
        if (e.shiftKey) {
          const end = addMinutes(event.end, m);
          if (end.getTime() - event.start.getTime() < slotMinutes * 60_000) return;
          next = { start: event.start, end, allDay };
        } else {
          next = { start: addMinutes(event.start, m), end: addMinutes(event.end, m), allDay };
        }
      } else if ((e.key === "ArrowUp" || e.key === "ArrowDown") && view === "month") {
        const d = e.key === "ArrowUp" ? -7 : 7;
        next = { start: addDays(event.start, d), end: addDays(event.end, d), allDay };
      }
      if (next) {
        e.preventDefault();
        onEventChange?.(event, next);
      }
    };

    const eventButtonProps = (event: CalendarEvent, area: DragArea) => ({
      type: "button" as const,
      "data-slot": "event-calendar-event",
      "data-event-id": event.id,
      "data-dragging": drag?.event === event && drag.moved ? "" : undefined,
      style: eventStyle(event.color),
      onPointerDown: (e: React.PointerEvent) => begin(e, "move", area, event),
      onClick: () => {
        if (suppressClick.current) return;
        onEventClick?.(event);
      },
      onDoubleClick: () => onEventDoubleClick?.(event),
      onKeyDown: (e: React.KeyboardEvent) => onEventKeyDown(e, event),
    });

    const timeRange = (e: CalendarEvent) => `${formatClock(e.start)}–${formatClock(e.end)}`;
    const accessibleName = (e: CalendarEvent) =>
      `${e.title || t.untitled}, ${isAllDayRow(e) ? t.allDay : timeRange(e)}`;

    // ── Scroll the time grid to the working day ─────────────────────
    React.useEffect(() => {
      if (view === "month" || !scrollRef.current) return;
      scrollRef.current.scrollTop = scrollToHour * hourHeight;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view]);

    // ── Render ──────────────────────────────────────────────────────
    const viewOptions = [
      { value: "day" as const, label: t.day },
      { value: "week" as const, label: t.week },
      { value: "month" as const, label: t.month },
    ];

    const toolbar = showToolbar ? (
      <div
        data-slot="event-calendar-toolbar"
        className="flex flex-wrap items-center gap-2 border-b border-hairline px-3 py-2"
      >
        <Button variant="subtle" size="sm" onClick={() => setAnchor(startOfDay(now))}>
          {t.today}
        </Button>
        <div className="flex items-center">
          <Button variant="ghost" size="icon-sm" aria-label={t.prev} onClick={() => step(-1)}>
            <ChevronLeft aria-hidden className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label={t.next} onClick={() => step(1)}>
            <ChevronRight aria-hidden className="size-4" />
          </Button>
        </div>
        <h2
          data-slot="event-calendar-title"
          aria-live="polite"
          className="m-0 min-w-0 flex-1 truncate text-ui-title font-bold text-ink-1"
        >
          {title}
        </h2>
        {toolbarExtra}
        <SegmentedControl
          aria-label={t.viewLabel}
          size="sm"
          options={viewOptions}
          value={view}
          onValueChange={setView}
        />
      </div>
    ) : null;

    const dayHeader = (d: Date) => {
      const isToday = isSameDay(d, now);
      const label = cal.dayLabel(d);
      const content = (
        <>
          <span className="text-ui-caption font-bold uppercase text-ink-3">
            {cal.weekdayShort(weekdayIndex(d))}
          </span>
          <span
            className={cn(
              "inline-flex size-7 items-center justify-center !rounded-pill text-ui-title font-bold",
              isToday ? "bg-brand-solid text-on-brand" : "text-ink-1",
            )}
          >
            {d.getDate()}
          </span>
        </>
      );
      return view === "week" ? (
        <button
          type="button"
          aria-label={t.openDay(label)}
          aria-current={isToday ? "date" : undefined}
          onClick={() => openDay(d)}
          className={cn(
            "flex flex-col items-center gap-0.5 py-1.5 !rounded-md cursor-pointer hover:bg-mist",
            focusRing,
          )}
        >
          {content}
        </button>
      ) : (
        <div className="flex flex-col items-center gap-0.5 py-1.5" aria-current={isToday ? "date" : undefined}>
          {content}
        </div>
      );
    };

    const renderTimeGrid = () => {
      const segs = timedSegments(shown, days);
      const bars = allDayBars(shown, days);
      const lanes = Math.max(1, ...bars.map((b) => b.lane + 1));
      const n = days.length;
      const colTemplate = { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` };
      const nowCol = days.findIndex((d) => isSameDay(d, now));
      const allDayPreview = createPreview?.allDay && drag?.area === "allday" ? drag : null;

      return (
        <>
          <div className="flex overflow-y-hidden border-b border-hairline [scrollbar-gutter:stable]" data-slot="event-calendar-header">
            <div className="w-14 shrink-0" />
            <div className="grid flex-1" style={colTemplate}>
              {days.map((d) => (
                <div key={d.getTime()} className="border-l border-hairline px-1">
                  {dayHeader(d)}
                </div>
              ))}
            </div>
          </div>
          <div className="flex overflow-y-hidden border-b border-hairline [scrollbar-gutter:stable]" data-slot="event-calendar-all-day">
            <div className="flex w-14 shrink-0 items-start justify-end px-1.5 py-1 text-right text-ui-micro font-bold uppercase leading-tight text-ink-3">
              {t.allDay}
            </div>
            <div
              ref={allDayRef}
              className={cn("relative flex-1", canCreate && "cursor-cell")}
              style={{ height: lanes * 24 + 8 }}
              onPointerDown={(e) => begin(e, "create", "allday")}
            >
              <div className="absolute inset-0 grid" style={colTemplate} aria-hidden>
                {days.map((d, i) => (
                  <div
                    key={d.getTime()}
                    className={cn(
                      "border-l border-hairline",
                      allDayPreview &&
                        i >= Math.min(allDayPreview.anchorIdx, allDayPreview.curIdx) &&
                        i <= Math.max(allDayPreview.anchorIdx, allDayPreview.curIdx) &&
                        "bg-mist",
                    )}
                  />
                ))}
              </div>
              {bars.map((b) => (
                <button
                  key={b.event.id}
                  {...eventButtonProps(b.event, "allday")}
                  aria-label={accessibleName(b.event)}
                  className={cn(
                    "absolute flex h-[22px] items-center truncate !rounded-sm px-1.5 text-left text-ui-caption font-bold cursor-pointer touch-none",
                    eventChrome,
                    focusRing,
                    drag?.event === b.event && drag.moved && "opacity-80 shadow-tj-md",
                  )}
                  style={{
                    ...eventStyle(b.event.color),
                    left: `calc(${(b.from / n) * 100}% + 2px)`,
                    width: `calc(${((b.to - b.from + 1) / n) * 100}% - 4px)`,
                    top: 4 + b.lane * 24,
                  }}
                >
                  {renderEvent ? renderEvent(b.event, view) : b.event.title || t.untitled}
                </button>
              ))}
            </div>
          </div>
          <div
            ref={scrollRef}
            data-slot="event-calendar-body"
            // The header and all-day rows reserve the same gutter, so day columns line up.
            className="relative flex overflow-y-auto [scrollbar-gutter:stable]"
            style={{ maxHeight: bodyHeight }}
          >
            <div className="relative w-14 shrink-0" style={{ height: 24 * hourHeight }} aria-hidden>
              {Array.from({ length: 24 }, (_, h) =>
                h === 0 ? null : (
                  <span
                    key={h}
                    className="absolute right-1.5 -translate-y-1/2 text-ui-caption tabular-nums text-ink-3"
                    style={{ top: h * hourHeight }}
                  >
                    {String(h).padStart(2, "0")}:00
                  </span>
                ),
              )}
            </div>
            <div
              ref={timeColsRef}
              className={cn("relative grid flex-1", canCreate && "cursor-cell")}
              style={{ ...colTemplate, height: 24 * hourHeight }}
              onPointerDown={(e) => begin(e, "create", "time")}
            >
              {/* Hour lines */}
              <div aria-hidden className="pointer-events-none absolute inset-0">
                {Array.from({ length: 24 }, (_, h) => (
                  <div
                    key={h}
                    className="absolute inset-x-0 border-t border-hairline"
                    style={{ top: h * hourHeight }}
                  />
                ))}
              </div>
              {days.map((d, col) => (
                <div
                  key={d.getTime()}
                  data-slot="event-calendar-column"
                  className={cn("relative border-l border-hairline", isSameDay(d, now) && "bg-ui-surface-2")}
                >
                  {createPreview && !createPreview.allDay && drag?.anchorIdx === col ? (
                    <div
                      aria-hidden
                      data-slot="event-calendar-selection"
                      className="pointer-events-none absolute inset-x-1 !rounded-md border border-brand bg-mist"
                      style={{
                        top: (minutesOfDay(createPreview.start) / 60) * hourHeight,
                        height:
                          ((createPreview.end.getTime() - createPreview.start.getTime()) / 3_600_000) *
                          hourHeight,
                      }}
                    />
                  ) : null}
                  {segs[col].map((s) => {
                    const top = (s.startMin / 60) * hourHeight;
                    const height = Math.max(18, ((s.endMin - s.startMin) / 60) * hourHeight - 2);
                    const compact = height < 36;
                    return (
                      <button
                        key={`${s.event.id}-${col}`}
                        {...eventButtonProps(s.event, "time")}
                        aria-label={accessibleName(s.event)}
                        className={cn(
                          "absolute flex flex-col overflow-hidden !rounded-md px-1.5 py-0.5 text-left text-ui-caption cursor-pointer touch-none",
                          eventChrome,
                          focusRing,
                          drag?.event === s.event && drag.moved && "z-(--tj-z-sticky) opacity-90 shadow-tj-md",
                        )}
                        style={{
                          ...eventStyle(s.event.color),
                          top,
                          height,
                          left: `calc(${(s.lane / s.lanes) * 100}% + 2px)`,
                          width: `calc(${100 / s.lanes}% - 4px)`,
                        }}
                      >
                        {renderEvent ? (
                          renderEvent(s.event, view)
                        ) : (
                          <>
                            <span className="truncate font-bold">
                              {s.event.title || t.untitled}
                              {compact ? (
                                <span className="font-medium text-ink-2"> {formatClock(s.event.start)}</span>
                              ) : null}
                            </span>
                            {!compact ? (
                              <span className="truncate tabular-nums text-ink-2">{timeRange(s.event)}</span>
                            ) : null}
                          </>
                        )}
                        {s.hasEnd && canChange ? (
                          <span
                            aria-hidden
                            data-slot="event-calendar-resize"
                            onPointerDown={(e) => begin(e, "resize", "time", s.event)}
                            className="absolute inset-x-0 bottom-0 h-1.5 cursor-ns-resize"
                          />
                        ) : null}
                      </button>
                    );
                  })}
                  {col === nowCol ? (
                    <div
                      aria-hidden
                      data-slot="event-calendar-now"
                      className="pointer-events-none absolute inset-x-0 z-(--tj-z-sticky) h-0.5 bg-tj-error"
                      style={{ top: (minutesOfDay(now) / 60) * hourHeight }}
                    >
                      <span className="absolute -left-1 -top-1 size-2.5 !rounded-pill bg-tj-error" />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </>
      );
    };

    const renderMonth = () => {
      const header = days.slice(0, 7);
      const rows = days.length / 7;
      const monthPreview = createPreview?.allDay && drag?.area === "month" ? drag : null;
      return (
        <>
          <div className="grid grid-cols-7 border-b border-hairline" data-slot="event-calendar-header">
            {header.map((d) => (
              <div
                key={d.getTime()}
                className="py-1.5 text-center text-ui-caption font-bold uppercase text-ink-3"
              >
                {cal.weekdayShort(weekdayIndex(d))}
              </div>
            ))}
          </div>
          <div
            ref={monthRef}
            data-slot="event-calendar-month"
            className={cn("grid grid-cols-7", canCreate && "cursor-cell")}
            style={{ gridTemplateRows: `repeat(${rows}, minmax(6.5rem, 1fr))` }}
            onPointerDown={(e) => begin(e, "create", "month")}
          >
            {days.map((d, i) => {
              const list = eventsOnDay(shown, d);
              const visible = list.slice(0, maxEventsPerDay);
              const hidden = list.length - visible.length;
              const isToday = isSameDay(d, now);
              const outside = !isSameMonth(d, anchor);
              const selected =
                monthPreview &&
                i >= Math.min(monthPreview.anchorIdx, monthPreview.curIdx) &&
                i <= Math.max(monthPreview.anchorIdx, monthPreview.curIdx);
              return (
                <div
                  key={d.getTime()}
                  data-slot="event-calendar-day"
                  data-outside={outside || undefined}
                  className={cn(
                    "flex min-w-0 flex-col gap-0.5 border-b border-l border-hairline p-1",
                    outside && "bg-ui-surface-2",
                    selected && "bg-mist",
                  )}
                >
                  <button
                    type="button"
                    aria-label={t.openDay(cal.dayLabel(d))}
                    aria-current={isToday ? "date" : undefined}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => openDay(d)}
                    className={cn(
                      "inline-flex size-6 items-center justify-center self-end !rounded-pill text-ui-label font-bold cursor-pointer",
                      focusRing,
                      isToday
                        ? "bg-brand-solid text-on-brand"
                        : outside
                          ? "text-ink-3 hover:bg-mist"
                          : "text-ink-1 hover:bg-mist",
                    )}
                  >
                    {d.getDate()}
                  </button>
                  {visible.map((e) => {
                    const bar = isAllDayRow(e);
                    return (
                      <button
                        key={e.id}
                        {...eventButtonProps(e, "month")}
                        aria-label={accessibleName(e)}
                        className={cn(
                          // 24px tall: the WCAG 2.5.8 minimum target size for stacked chips.
                          "flex min-h-6 w-full items-center gap-1 truncate !rounded-sm px-1 text-left text-ui-caption cursor-pointer touch-none",
                          focusRing,
                          bar ? cn(eventChrome, "font-bold") : "text-ink-1 hover:bg-mist",
                          drag?.event === e && drag.moved && "opacity-80",
                        )}
                      >
                        {renderEvent ? (
                          renderEvent(e, view)
                        ) : (
                          <>
                            {!bar ? (
                              <span aria-hidden className="size-2 shrink-0 !rounded-pill bg-(--tj-event)" />
                            ) : null}
                            {!bar ? (
                              <span className="shrink-0 tabular-nums text-ink-3">{formatClock(e.start)}</span>
                            ) : null}
                            <span className="truncate font-medium">{e.title || t.untitled}</span>
                          </>
                        )}
                      </button>
                    );
                  })}
                  {hidden > 0 ? (
                    <button
                      type="button"
                      data-slot="event-calendar-more"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => openDay(d)}
                      className={cn(
                        "w-full truncate !rounded-sm px-1 text-left text-ui-caption font-bold text-brand-ink cursor-pointer hover:bg-mist",
                        focusRing,
                      )}
                    >
                      {t.more(hidden)}
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </>
      );
    };

    return (
      <div
        ref={ref}
        data-slot="event-calendar"
        data-view={view}
        className={cn(
          "flex flex-col overflow-hidden !rounded-lg border border-hairline bg-ui-surface text-ink-1 select-none",
          className,
        )}
        {...rest}
      >
        {toolbar}
        {view === "month" ? renderMonth() : renderTimeGrid()}
      </div>
    );
  },
);
EventCalendar.displayName = "EventCalendar";
