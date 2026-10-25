import * as React from "react";

import { defineMessages } from "../i18n/messages";
import {
  controlFocusWithin,
  controlFrame,
  controlSize,
  type ControlSize,
} from "../lib/control";
import { cn } from "../lib/cn";
import { splitDuration } from "../lib/time";
import { useMessages } from "./TajUIProvider";

export const durationInputMessages = defineMessages("durationInput", {
  ru: {
    days: "Дни",
    hours: "Часы",
    minutes: "Минуты",
    seconds: "Секунды",
    daysShort: "д",
    hoursShort: "ч",
    minutesShort: "мин",
    secondsShort: "с",
  },
  tg: {
    days: "Рӯзҳо",
    hours: "Соатҳо",
    minutes: "Дақиқаҳо",
    seconds: "Сонияҳо",
    daysShort: "р",
    hoursShort: "с",
    minutesShort: "дақ",
    secondsShort: "сон",
  },
  en: {
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    daysShort: "d",
    hoursShort: "h",
    minutesShort: "min",
    secondsShort: "s",
  },
});

export type DurationInputLabels = (typeof durationInputMessages.locales)["ru"];

export interface DurationInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  /** Total duration in seconds (Frappe `Duration` fields). */
  value?: number;
  defaultValue?: number;
  onValueChange?: (seconds: number) => void;
  /** Add a days part (otherwise hours grow past 24). */
  showDays?: boolean;
  /** Add a seconds part. */
  showSeconds?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  size?: ControlSize;
  labels?: Partial<DurationInputLabels>;
}

type Unit = "days" | "hours" | "minutes" | "seconds";
const UNIT_SECONDS: Record<Unit, number> = { days: 86400, hours: 3600, minutes: 60, seconds: 1 };

/**
 * Duration field split into days / hours / minutes / seconds parts, each a
 * small numeric input (↑/↓ step by one). Emits the total in seconds, so
 * typing 90 minutes reads back as 1 h 30 min.
 */
export const DurationInput = React.forwardRef<HTMLDivElement, DurationInputProps>(
  (props, ref) => {
    const isControlled = "value" in props;
    const {
      value,
      defaultValue = 0,
      onValueChange,
      showDays = false,
      showSeconds = false,
      disabled,
      readOnly,
      size = "md",
      labels,
      className,
      ...rest
    } = props;
    const t = useMessages(durationInputMessages, labels);
    const [internal, setInternal] = React.useState(defaultValue);
    const total = Math.max(0, Math.floor((isControlled ? value : internal) ?? 0));
    const parts = splitDuration(total, showDays);

    const units: Unit[] = [
      ...(showDays ? (["days"] as const) : []),
      "hours",
      "minutes",
      ...(showSeconds ? (["seconds"] as const) : []),
    ];
    // Without a seconds part, any seconds already in the value are kept.
    const hiddenSeconds = showSeconds ? 0 : parts.seconds;

    const emit = (next: Record<Unit, number>) => {
      const sum =
        units.reduce((acc, u) => acc + Math.max(0, next[u]) * UNIT_SECONDS[u], 0) +
        hiddenSeconds;
      if (!isControlled) setInternal(sum);
      if (sum !== total) onValueChange?.(sum);
    };

    const short: Record<Unit, string> = {
      days: t.daysShort,
      hours: t.hoursShort,
      minutes: t.minutesShort,
      seconds: t.secondsShort,
    };

    return (
      <div
        ref={ref}
        role="group"
        data-slot="duration-input"
        data-disabled={disabled || undefined}
        className={cn(
          "inline-flex items-center gap-1 px-1.5",
          controlFrame,
          controlSize[size],
          controlFocusWithin,
          disabled && "cursor-not-allowed opacity-60",
          className,
        )}
        {...rest}
      >
        {units.map((unit) => (
          <label
            key={unit}
            data-slot="duration-input-part"
            className="inline-flex items-center gap-0.5"
          >
            <input
              type="text"
              inputMode="numeric"
              aria-label={t[unit]}
              data-slot="duration-input-field"
              disabled={disabled}
              readOnly={readOnly}
              value={String(parts[unit])}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 5);
                emit({ ...parts, [unit]: digits ? Number(digits) : 0 });
              }}
              onKeyDown={(e) => {
                if (readOnly || disabled) return;
                if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                  e.preventDefault();
                  const delta = e.key === "ArrowUp" ? 1 : -1;
                  emit({ ...parts, [unit]: Math.max(0, parts[unit] + delta) });
                }
              }}
              className="w-[3ch] min-w-0 bg-transparent text-right font-medium tabular-nums text-ink-1 outline-none disabled:cursor-not-allowed"
              style={{ width: `${Math.max(2, String(parts[unit]).length) + 0.5}ch` }}
            />
            <span aria-hidden className="pr-1 text-ui-label text-ink-3">
              {short[unit]}
            </span>
          </label>
        ))}
      </div>
    );
  },
);
DurationInput.displayName = "DurationInput";
