import { CalendarClock, X } from "lucide-react";
import * as React from "react";

import { defineMessages } from "../i18n/messages";
import type { ControlSize } from "../lib/control";
import { cn } from "../lib/cn";
import { formatDateInput, parseDateInput } from "../lib/date";
import {
  formatClock,
  parseTimeInput,
  secondsOfDay,
  timeSlots,
  timeToSeconds,
  withTimeOfDay,
} from "../lib/time";
import { Calendar, type CalendarLabels } from "./Calendar";
import { InputGroup, InputGroupInput } from "./InputGroup";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "./Popover";
import { useCommonMessages, useMessages } from "./TajUIProvider";

export const dateTimePickerMessages = defineMessages("dateTimePicker", {
  ru: {
    placeholder: "дд.мм.гггг чч:мм",
    openPicker: "Выбрать дату и время",
    dialogLabel: "Выбор даты и времени",
    timeLabel: "Время",
  },
  tg: {
    placeholder: "рр.мм.сссс сс:дд",
    openPicker: "Интихоби сана ва вақт",
    dialogLabel: "Интихоби сана ва вақт",
    timeLabel: "Вақт",
  },
  en: {
    placeholder: "dd.mm.yyyy hh:mm",
    openPicker: "Choose date and time",
    dialogLabel: "Choose date and time",
    timeLabel: "Time",
  },
});

export type DateTimePickerLabels = (typeof dateTimePickerMessages.locales)["ru"];

export type DateTimePickerProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "size" | "min" | "max" | "type" | "step"
> & {
  value?: Date | null;
  defaultValue?: Date | null;
  /** Fires with the picked/typed moment, or `null` when cleared. */
  onValueChange?: (value: Date | null) => void;
  /** Earliest allowed moment (inclusive). */
  min?: Date;
  /** Latest allowed moment (inclusive). */
  max?: Date;
  /** Minutes between the time slots in the popover. Defaults to 15. */
  step?: number;
  /** Time used when a day is picked before any time is set. Defaults to "09:00". */
  defaultTime?: string;
  clearable?: boolean;
  size?: ControlSize;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Override "today" (tests). */
  today?: Date;
  className?: string;
  labels?: Partial<DateTimePickerLabels>;
  calendarLabels?: Partial<CalendarLabels>;
};

const iconBtn =
  "inline-flex h-full aspect-square shrink-0 items-center justify-center text-ink-3 transition-colors cursor-pointer outline-none hover:bg-mist hover:text-brand-ink focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus disabled:pointer-events-none [&_svg]:size-4";

/** `dd.mm.yyyy HH:mm`. */
export function formatDateTimeInput(date: Date): string {
  return `${formatDateInput(date)} ${formatClock(date)}`;
}

/**
 * Parse `21.10.2026 14:30` (also `21.10.2026, 1430`, `2026-10-21T14:30` or a
 * bare date, which means 00:00). Returns `null` when either part is invalid.
 */
export function parseDateTimeInput(input: string): Date | null {
  const text = input.trim();
  if (!text) return null;
  const m = /^(\S+?)(?:[\sT,]+(.+))?$/.exec(text);
  if (!m) return null;
  const day = parseDateInput(m[1]);
  if (!day) return null;
  if (!m[2]) return day;
  const secs = parseTimeInput(m[2]);
  return secs === null ? null : withTimeOfDay(day, secs);
}

const sameMoment = (a: Date | null | undefined, b: Date | null | undefined) =>
  (!a && !b) || (!!a && !!b && a.getTime() === b.getTime());

/**
 * Date + time field for meetings, task deadlines and call-backs. Type
 * `21.10.2026 14:30` (parsed on blur/Enter) or pick a day and a time slot in
 * the popover. Alt+↓ opens the popover.
 */
export const DateTimePicker = React.forwardRef<HTMLInputElement, DateTimePickerProps>(
  (props, ref) => {
    const isControlled = "value" in props;
    const {
      value,
      defaultValue,
      onValueChange,
      min,
      max,
      step = 15,
      defaultTime = "09:00",
      clearable = false,
      size = "md",
      disabled,
      readOnly,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      today,
      placeholder,
      className,
      labels,
      calendarLabels,
      onBlur,
      onKeyDown,
      "aria-invalid": ariaInvalid,
      ...inputProps
    } = props;
    const t = useMessages(dateTimePickerMessages, labels);
    const common = useCommonMessages();

    const [internal, setInternal] = React.useState<Date | null>(defaultValue ?? null);
    const current = (isControlled ? value : internal) ?? null;
    const [text, setText] = React.useState(current ? formatDateTimeInput(current) : "");
    const [invalid, setInvalid] = React.useState(false);
    const lastCommitted = React.useRef<Date | null>(current);

    const currentTime = current?.getTime();
    React.useEffect(() => {
      if (sameMoment(lastCommitted.current, current)) return;
      lastCommitted.current = current;
      setText(current ? formatDateTimeInput(current) : "");
      setInvalid(false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTime]);

    const [openState, setOpenState] = React.useState(defaultOpen);
    const open = openProp ?? openState;
    const setOpen = (next: boolean) => {
      if (openProp === undefined) setOpenState(next);
      onOpenChange?.(next);
    };

    const allowed = (d: Date) =>
      !(min && d.getTime() < min.getTime()) && !(max && d.getTime() > max.getTime());

    const commit = (next: Date | null) => {
      setInvalid(false);
      setText(next ? formatDateTimeInput(next) : "");
      const changed = !sameMoment(next, lastCommitted.current);
      lastCommitted.current = next;
      if (!isControlled) setInternal(next);
      if (changed) onValueChange?.(next);
    };

    const commitText = () => {
      const raw = text.trim();
      if (!raw) {
        commit(null);
        return;
      }
      const parsed = parseDateTimeInput(raw);
      if (!parsed || !allowed(parsed)) {
        setInvalid(true);
        return;
      }
      commit(parsed);
    };

    const slots = React.useMemo(() => timeSlots(step), [step]);
    const selectedClock = current ? formatClock(current) : undefined;
    const timeListRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
      if (!open) return;
      // Bring the selected slot into view once the popover has mounted.
      const id = requestAnimationFrame(() => {
        timeListRef.current
          ?.querySelector('[aria-pressed="true"]')
          ?.scrollIntoView({ block: "center" });
      });
      return () => cancelAnimationFrame(id);
    }, [open]);

    const baseDay = current ?? today ?? new Date();

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <InputGroup
            size={size}
            disabled={disabled}
            data-slot="date-time-picker"
            className={className}
          >
            <InputGroupInput
              ref={ref}
              data-slot="date-time-picker-input"
              autoComplete="off"
              placeholder={placeholder ?? t.placeholder}
              disabled={disabled}
              readOnly={readOnly}
              value={text}
              aria-invalid={invalid || ariaInvalid === true || ariaInvalid === "true" || undefined}
              onChange={(e) => {
                setText(e.target.value);
                if (invalid) setInvalid(false);
              }}
              onBlur={(e) => {
                if (!readOnly) commitText();
                onBlur?.(e);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !readOnly) commitText();
                if (e.key === "ArrowDown" && e.altKey && !readOnly) {
                  e.preventDefault();
                  setOpen(true);
                }
                onKeyDown?.(e);
              }}
              {...inputProps}
            />
            {clearable && current && !disabled && !readOnly ? (
              <button
                type="button"
                data-slot="date-time-picker-clear"
                aria-label={common.clear}
                onClick={() => commit(null)}
                className={iconBtn}
              >
                <X aria-hidden />
              </button>
            ) : null}
            <PopoverTrigger asChild>
              <button
                type="button"
                data-slot="date-time-picker-trigger"
                aria-label={t.openPicker}
                disabled={disabled || readOnly}
                className={cn(iconBtn, "border-l border-hairline")}
              >
                <CalendarClock aria-hidden />
              </button>
            </PopoverTrigger>
          </InputGroup>
        </PopoverAnchor>
        <PopoverContent
          align="end"
          aria-label={t.dialogLabel}
          className="flex w-auto gap-3 p-3"
          data-slot="date-time-picker-content"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Calendar
            mode="single"
            autoFocus
            selected={current ?? undefined}
            defaultMonth={current ?? today}
            onSelect={(d) => {
              if (!d) return;
              const secs = current
                ? secondsOfDay(current)
                : (timeToSeconds(defaultTime) ?? 9 * 3600);
              const next = withTimeOfDay(d, secs);
              commit(allowed(next) ? next : (min && next < min ? min : (max ?? next)));
            }}
            min={min}
            max={max}
            today={today}
            labels={calendarLabels}
          />
          <div
            ref={timeListRef}
            role="group"
            aria-label={t.timeLabel}
            data-slot="date-time-picker-times"
            className="flex max-h-72 w-20 flex-col gap-0.5 overflow-y-auto border-l border-hairline pl-2"
          >
            {slots.map((slot) => {
              const candidate = withTimeOfDay(baseDay, timeToSeconds(slot) ?? 0);
              const ok = allowed(candidate);
              const selected = slot === selectedClock;
              return (
                <button
                  key={slot}
                  type="button"
                  aria-pressed={selected}
                  disabled={!ok}
                  onClick={() => {
                    commit(candidate);
                    setOpen(false);
                  }}
                  className={cn(
                    "min-h-7 shrink-0 !rounded-md px-2 text-left font-medium tabular-nums text-ui-body text-ink-1 outline-none cursor-pointer",
                    "hover:bg-mist hover:text-mist-ink focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-40",
                    selected && "bg-brand-solid text-on-brand hover:bg-brand-solid hover:text-on-brand",
                  )}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);
DateTimePicker.displayName = "DateTimePicker";
