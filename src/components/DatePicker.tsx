import { CalendarDays, X } from "lucide-react";
import * as React from "react";

import { defineMessages } from "../i18n/messages";
import type { ControlSize } from "../lib/control";
import { cn } from "../lib/cn";
import {
  formatDateInput,
  isAfter,
  isBefore,
  isSameDay,
  parseDateInput,
} from "../lib/date";
import { Calendar, type CalendarLabels } from "./Calendar";
import { InputGroup, InputGroupInput } from "./InputGroup";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "./Popover";
import { useCommonMessages, useMessages } from "./TajUIProvider";

export const datePickerMessages = defineMessages("datePicker", {
  ru: {
    placeholder: "дд.мм.гггг",
    openCalendar: "Открыть календарь",
    dialogLabel: "Выбор даты",
  },
  tg: {
    placeholder: "рр.мм.сссс",
    openCalendar: "Кушодани тақвим",
    dialogLabel: "Интихоби сана",
  },
  en: {
    placeholder: "dd.mm.yyyy",
    openCalendar: "Open calendar",
    dialogLabel: "Choose date",
  },
});

export type DatePickerLabels = (typeof datePickerMessages.locales)["ru"];

export type DatePickerProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "size" | "min" | "max" | "type"
> & {
  value?: Date;
  defaultValue?: Date;
  /** Fires with the picked/typed day, or `undefined` when cleared. */
  onValueChange?: (date: Date | undefined) => void;
  /** Earliest allowed day (inclusive). */
  min?: Date;
  /** Latest allowed day (inclusive). */
  max?: Date;
  /** Mark individual days as unavailable (e.g. holidays, closed shifts). */
  isDateDisabled?: (date: Date) => boolean;
  size?: ControlSize;
  /** Show a clear (×) button when a date is set. */
  clearable?: boolean;
  /** Popover state, controlled. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Override "today" (tests). */
  today?: Date;
  /** Class for the outer InputGroup frame (`className` styles the input frame too). */
  className?: string;
  labels?: Partial<DatePickerLabels>;
  calendarLabels?: Partial<CalendarLabels>;
};

const iconBtn =
  "inline-flex h-full aspect-square shrink-0 items-center justify-center text-ink-3 transition-colors cursor-pointer outline-none hover:bg-mist hover:text-brand-ink focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus disabled:pointer-events-none [&_svg]:size-4";

/**
 * Date field: type `dd.mm.yyyy` (parsed on blur/Enter) or pick from a
 * calendar popover. `id`, `name` and `aria-*` go to the text input, so
 * `<Label htmlFor>` and `<FormControl>` work as with `<Input>`.
 */
const sameDay = (a: Date | undefined, b: Date | undefined) =>
  (!a && !b) || isSameDay(a, b);

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  (props, ref) => {
    const isControlled = "value" in props;
    const {
      value,
      defaultValue,
      onValueChange,
      min,
      max,
      isDateDisabled,
      size = "md",
      clearable = false,
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
    const t = useMessages(datePickerMessages, labels);
    const common = useCommonMessages();

    const [internal, setInternal] = React.useState<Date | undefined>(defaultValue);
    const current = isControlled ? value : internal;

    const [text, setText] = React.useState(current ? formatDateInput(current) : "");
    const [invalid, setInvalid] = React.useState(false);
    const lastCommitted = React.useRef<Date | undefined>(current);

    // Re-sync the text when the value changes from outside.
    const currentTime = current?.getTime();
    React.useEffect(() => {
      if (sameDay(lastCommitted.current, current)) return;
      lastCommitted.current = current;
      setText(current ? formatDateInput(current) : "");
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
      !(min && isBefore(d, min)) && !(max && isAfter(d, max)) && !isDateDisabled?.(d);

    const commit = (next: Date | undefined) => {
      setInvalid(false);
      setText(next ? formatDateInput(next) : "");
      const changed = !sameDay(next, lastCommitted.current);
      lastCommitted.current = next;
      if (!isControlled) setInternal(next);
      if (changed) onValueChange?.(next);
    };

    const commitText = () => {
      const raw = text.trim();
      if (!raw) {
        commit(undefined);
        return;
      }
      const parsed = parseDateInput(raw);
      if (!parsed || !allowed(parsed)) {
        setInvalid(true);
        return;
      }
      commit(parsed);
    };

    const typed = parseDateInput(text);
    const calendarMonth = (typed && allowed(typed) ? typed : undefined) ?? current ?? today;

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <InputGroup
            size={size}
            disabled={disabled}
            data-slot="date-picker"
            className={className}
          >
            <InputGroupInput
              ref={ref}
              data-slot="date-picker-input"
              inputMode="decimal"
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
                data-slot="date-picker-clear"
                aria-label={common.clear}
                onClick={() => commit(undefined)}
                className={iconBtn}
              >
                <X aria-hidden />
              </button>
            ) : null}
            <PopoverTrigger asChild>
              <button
                type="button"
                data-slot="date-picker-trigger"
                aria-label={t.openCalendar}
                disabled={disabled || readOnly}
                className={cn(iconBtn, "border-l border-hairline")}
              >
                <CalendarDays aria-hidden />
              </button>
            </PopoverTrigger>
          </InputGroup>
        </PopoverAnchor>
        <PopoverContent
          align="end"
          aria-label={t.dialogLabel}
          className="w-auto p-3"
          data-slot="date-picker-content"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Calendar
            mode="single"
            autoFocus
            selected={current}
            defaultMonth={calendarMonth}
            onSelect={(d) => {
              commit(d);
              setOpen(false);
            }}
            min={min}
            max={max}
            disabled={isDateDisabled}
            today={today}
            labels={calendarLabels}
          />
        </PopoverContent>
      </Popover>
    );
  },
);
DatePicker.displayName = "DatePicker";
