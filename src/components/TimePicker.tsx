import { Clock, X } from "lucide-react";
import * as React from "react";

import { defineMessages } from "../i18n/messages";
import type { ControlSize } from "../lib/control";
import { cn } from "../lib/cn";
import { formatTimeOfDay, parseTimeInput, timeSlots, timeToSeconds } from "../lib/time";
import { InputGroup, InputGroupInput } from "./InputGroup";
import { Popover, PopoverAnchor, PopoverContent } from "./Popover";
import { useCommonMessages, useMessages } from "./TajUIProvider";

export const timePickerMessages = defineMessages("timePicker", {
  ru: { placeholder: "чч:мм", listLabel: "Время" },
  tg: { placeholder: "сс:дд", listLabel: "Вақт" },
  en: { placeholder: "hh:mm", listLabel: "Time" },
});

export type TimePickerLabels = (typeof timePickerMessages.locales)["ru"];

export type TimePickerProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "size" | "min" | "max" | "type" | "step"
> & {
  /** `HH:mm` or `HH:mm:ss`; empty string / undefined = no time. */
  value?: string;
  defaultValue?: string;
  /** Fires with `HH:mm` (`HH:mm:ss` with `withSeconds`), or `""` when cleared. */
  onValueChange?: (value: string) => void;
  /** Minutes between the suggested slots. Defaults to 15. */
  step?: number;
  /** Earliest allowed time (inclusive), `HH:mm`. */
  min?: string;
  /** Latest allowed time (inclusive), `HH:mm`. */
  max?: string;
  /** Emit `HH:mm:ss` (Frappe `Time` fields). */
  withSeconds?: boolean;
  /** Show a clear (×) button when a time is set. */
  clearable?: boolean;
  size?: ControlSize;
  className?: string;
  labels?: Partial<TimePickerLabels>;
};

const iconBtn =
  "inline-flex h-full aspect-square shrink-0 items-center justify-center text-ink-3 transition-colors cursor-pointer outline-none hover:bg-mist hover:text-brand-ink focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus disabled:pointer-events-none [&_svg]:size-4";

/**
 * Time-of-day field. Type `930`, `9:30` or `09.30` (parsed on blur/Enter) or
 * pick a slot from the list (WAI-ARIA combobox: ↓/↑ move, Enter picks,
 * Escape closes). `id`, `name` and `aria-*` go to the input.
 */
export const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(
  (props, ref) => {
    const isControlled = "value" in props;
    const {
      value,
      defaultValue,
      onValueChange,
      step = 15,
      min,
      max,
      withSeconds = false,
      clearable = false,
      size = "md",
      disabled,
      readOnly,
      placeholder,
      className,
      labels,
      onBlur,
      onKeyDown,
      onFocus,
      "aria-invalid": ariaInvalid,
      ...inputProps
    } = props;
    const t = useMessages(timePickerMessages, labels);
    const common = useCommonMessages();
    const listId = React.useId();

    const normalize = React.useCallback(
      (v: string | undefined) => {
        const secs = timeToSeconds(v);
        return secs === null ? "" : formatTimeOfDay(secs, withSeconds);
      },
      [withSeconds],
    );

    const [internal, setInternal] = React.useState(() => normalize(defaultValue));
    const current = isControlled ? normalize(value) : internal;
    const [text, setText] = React.useState(current);
    const [invalid, setInvalid] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const [active, setActive] = React.useState(-1);
    const lastCommitted = React.useRef(current);
    // True once ↑/↓ moved the highlight, so Enter picks it over the typed text.
    const navigated = React.useRef(false);
    const anchorRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (lastCommitted.current === current) return;
      lastCommitted.current = current;
      setText(current);
      setInvalid(false);
    }, [current]);

    const minS = timeToSeconds(min);
    const maxS = timeToSeconds(max);
    const allowed = React.useCallback(
      (s: number) => !(minS !== null && s < minS) && !(maxS !== null && s > maxS),
      [minS, maxS],
    );
    const slots = React.useMemo(
      () => timeSlots(step).filter((slot) => allowed(timeToSeconds(slot) ?? 0)),
      [step, allowed],
    );

    // The slot closest to (at or after) the typed or committed time.
    const nearestSlot = React.useCallback(
      (source: string) => {
        const secs = parseTimeInput(source);
        if (secs === null) return slots.length ? 0 : -1;
        const i = slots.findIndex((s) => (timeToSeconds(s) ?? 0) >= secs);
        return i === -1 ? slots.length - 1 : i;
      },
      [slots],
    );

    React.useEffect(() => {
      if (!open || active < 0) return;
      document
        .getElementById(`${listId}-opt-${active}`)
        ?.scrollIntoView({ block: "nearest" });
    }, [open, active, listId]);

    const commit = (next: string) => {
      setInvalid(false);
      setText(next);
      const changed = next !== lastCommitted.current;
      lastCommitted.current = next;
      if (!isControlled) setInternal(next);
      if (changed) onValueChange?.(next);
    };

    const commitText = () => {
      const raw = text.trim();
      if (!raw) {
        commit("");
        return;
      }
      const secs = parseTimeInput(raw);
      if (secs === null || !allowed(secs)) {
        setInvalid(true);
        return;
      }
      commit(formatTimeOfDay(secs, withSeconds));
    };

    const openList = () => {
      if (disabled || readOnly) return;
      navigated.current = false;
      setOpen(true);
      setActive(nearestSlot(text || current));
    };

    const pick = (slot: string) => {
      const secs = timeToSeconds(slot) ?? 0;
      commit(formatTimeOfDay(secs, withSeconds));
      setOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(e);
      if (disabled || readOnly || e.defaultPrevented) return;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          navigated.current = open;
          if (!open) openList();
          else setActive((i) => Math.min(slots.length - 1, i + 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          if (open) {
            navigated.current = true;
            setActive((i) => Math.max(0, i - 1));
          }
          break;
        case "Enter":
          if (open && active >= 0 && slots[active] && navigated.current) {
            e.preventDefault();
            pick(slots[active]);
          } else {
            commitText();
            setOpen(false);
          }
          break;
        case "Escape":
          if (open) {
            e.preventDefault();
            setOpen(false);
          }
          break;
        case "Tab":
          setOpen(false);
          break;
      }
    };

    const keepOpen = (e: Event) => {
      const target = e.target as Node | null;
      if (target && anchorRef.current?.contains(target)) e.preventDefault();
    };

    return (
      <Popover open={open && !disabled} onOpenChange={setOpen} modal={false}>
        <PopoverAnchor asChild>
          <InputGroup
            ref={anchorRef}
            size={size}
            disabled={disabled}
            data-slot="time-picker"
            className={className}
          >
            <InputGroupInput
              ref={ref}
              role="combobox"
              aria-expanded={open}
              aria-controls={`${listId}-listbox`}
              aria-autocomplete="list"
              aria-activedescendant={
                open && active >= 0 ? `${listId}-opt-${active}` : undefined
              }
              data-slot="time-picker-input"
              inputMode="numeric"
              autoComplete="off"
              placeholder={placeholder ?? t.placeholder}
              disabled={disabled}
              readOnly={readOnly}
              value={text}
              aria-invalid={invalid || ariaInvalid === true || ariaInvalid === "true" || undefined}
              onChange={(e) => {
                setText(e.target.value);
                navigated.current = false;
                if (invalid) setInvalid(false);
                if (!open) setOpen(true);
                setActive(nearestSlot(e.target.value));
              }}
              onFocus={(e) => {
                onFocus?.(e);
                openList();
              }}
              onMouseDown={() => {
                if (!open) openList();
              }}
              onBlur={(e) => {
                if (!readOnly) commitText();
                onBlur?.(e);
              }}
              onKeyDown={handleKeyDown}
              {...inputProps}
            />
            {clearable && current && !disabled && !readOnly ? (
              <button
                type="button"
                data-slot="time-picker-clear"
                aria-label={common.clear}
                onClick={() => commit("")}
                className={iconBtn}
              >
                <X aria-hidden />
              </button>
            ) : (
              <span aria-hidden className="inline-flex shrink-0 px-3 text-ink-3 [&_svg]:size-4">
                <Clock />
              </span>
            )}
          </InputGroup>
        </PopoverAnchor>
        <PopoverContent
          align="start"
          data-slot="time-picker-content"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={keepOpen}
          onPointerDownOutside={keepOpen}
          className="p-1 w-[max(var(--radix-popover-trigger-width),8rem)] max-h-64 overflow-y-auto"
        >
          <ul
            role="listbox"
            id={`${listId}-listbox`}
            aria-label={t.listLabel}
            className="flex flex-col gap-0.5"
          >
            {slots.map((slot, i) => {
              const selected = current.slice(0, 5) === slot;
              return (
                <li
                  key={slot}
                  id={`${listId}-opt-${i}`}
                  role="option"
                  aria-selected={selected}
                  data-slot="time-picker-option"
                  onPointerDown={(e) => e.preventDefault()}
                  onPointerEnter={() => {
                    navigated.current = true;
                    setActive(i);
                  }}
                  onClick={() => pick(slot)}
                  className={cn(
                    "flex items-center px-2.5 py-1.5 min-h-8 !rounded-lg font-medium tabular-nums text-ui-body text-ink-1 cursor-pointer",
                    i === active && "bg-mist text-mist-ink",
                    selected && "font-bold text-brand-ink",
                  )}
                >
                  {slot}
                </li>
              );
            })}
          </ul>
        </PopoverContent>
      </Popover>
    );
  },
);
TimePicker.displayName = "TimePicker";
