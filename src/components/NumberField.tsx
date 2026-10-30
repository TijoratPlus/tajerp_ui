import { Minus, Plus } from "lucide-react";
import * as React from "react";

import { controlText, type ControlSize } from "../lib/control";
import { cn } from "../lib/cn";
import { decimalsOf, parseNumber, roundTo } from "../i18n/format";
import { InputGroup } from "./InputGroup";
import { useCommonMessages, useFormat } from "./TajUIProvider";

export type NumberFieldProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  | "value"
  | "defaultValue"
  | "onChange"
  | "type"
  | "min"
  | "max"
  | "step"
  | "prefix"
  | "size"
> & {
  value?: number;
  defaultValue?: number;
  /** Fires with the parsed numeric value (clamped on blur and via steppers). */
  onValueChange?: (value: number) => void;
  /** Fires when the person empties the field. */
  onClear?: () => void;
  min?: number;
  max?: number;
  step?: number;
  /** Static adornment before the number, e.g. a currency symbol. */
  prefix?: React.ReactNode;
  /** Static adornment after the number, e.g. a unit. */
  suffix?: React.ReactNode;
  /** Control height (density-aware). Defaults to "md". */
  size?: ControlSize;
  /** Accessible names of the stepper buttons. Default to the locale's. */
  decrementLabel?: string;
  incrementLabel?: string;
};

const clamp = (n: number, min?: number, max?: number) =>
  Math.min(
    max ?? Number.POSITIVE_INFINITY,
    Math.max(min ?? Number.NEGATIVE_INFINITY, n),
  );

/** Characters a person may type while composing a number. */
const PARTIAL_NUMBER = /^-?[\d\s\u00a0]*[.,]?\d*$/;

/**
 * Numeric input with −/+ steppers, min/max clamping and optional adornments.
 *
 * Accepts both "," and "." as the decimal separator (ru/tg keyboards type a
 * comma) and shows the locale's separator. Stepping is rounded to the step's
 * precision, so 0.1 + 0.2 shows 0,3. ArrowUp/ArrowDown step from the keyboard.
 */
export const NumberField = React.forwardRef<HTMLInputElement, NumberFieldProps>(
  (
    {
      className,
      value,
      defaultValue,
      onValueChange,
      onClear,
      min,
      max,
      step = 1,
      prefix,
      suffix,
      disabled,
      size = "md",
      decrementLabel,
      incrementLabel,
      onBlur,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const t = useCommonMessages();
    const { decimalSeparator } = useFormat();
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState<number | undefined>(
      defaultValue,
    );
    const current = isControlled ? value : internal;
    const hasValue = current !== undefined && !Number.isNaN(current);

    const show = React.useCallback(
      (n: number | undefined) =>
        n === undefined || Number.isNaN(n)
          ? ""
          : String(n).replace(".", decimalSeparator),
      [decimalSeparator],
    );

    const [display, setDisplay] = React.useState(() => show(current));

    React.useEffect(() => {
      if (isControlled) setDisplay(show(value));
    }, [isControlled, value, show]);

    const precision = Math.max(
      decimalsOf(step),
      decimalsOf(min ?? 0),
      decimalsOf(max ?? 0),
    );

    const commit = (n: number) => {
      const next = clamp(roundTo(n, Math.max(precision, decimalsOf(n))), min, max);
      if (!isControlled) setInternal(next);
      setDisplay(show(next));
      onValueChange?.(next);
    };

    const stepBy = (dir: 1 | -1) => {
      const base = hasValue ? (current as number) : (min ?? 0);
      commit(roundTo(base + dir * step, precision));
    };

    const atMin = hasValue && min !== undefined && (current as number) <= min;
    const atMax = hasValue && max !== undefined && (current as number) >= max;

    const stepBtn = cn(
      "inline-flex h-full shrink-0 items-center justify-center text-ink-2 outline-none transition-colors cursor-pointer",
      "hover:bg-mist hover:text-brand-ink focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus",
      "disabled:pointer-events-none disabled:opacity-40",
      // Square buttons that follow the control height (44px+ in touch density).
      size === "sm" ? "w-control-sm" : size === "lg" ? "w-control-lg" : "w-control-md",
    );

    return (
      <InputGroup
        data-slot="number-field"
        size={size}
        disabled={disabled}
        className={className}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label={decrementLabel ?? t.decrease}
          onClick={() => stepBy(-1)}
          disabled={disabled || atMin}
          className={cn(stepBtn, "border-r border-hairline")}
        >
          <Minus className="size-4" aria-hidden />
        </button>

        <div className="flex flex-1 justify-center items-center gap-1 px-2 min-w-0">
          {prefix ? (
            <span className="text-ink-3 shrink-0">{prefix}</span>
          ) : null}
          <input
            ref={ref}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            role="spinbutton"
            aria-valuenow={hasValue ? current : undefined}
            aria-valuemin={min}
            aria-valuemax={max}
            value={display}
            disabled={disabled}
            onChange={(e) => {
              const raw = e.target.value;
              if (!PARTIAL_NUMBER.test(raw)) return;
              setDisplay(raw);
              if (raw.trim() === "") {
                if (!isControlled) setInternal(undefined);
                onClear?.();
                return;
              }
              const parsed = parseNumber(raw);
              if (!Number.isNaN(parsed)) {
                if (!isControlled) setInternal(parsed);
                onValueChange?.(parsed);
              }
            }}
            onKeyDown={(e) => {
              onKeyDown?.(e);
              if (e.defaultPrevented) return;
              if (e.key === "ArrowUp") {
                e.preventDefault();
                stepBy(1);
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                stepBy(-1);
              }
            }}
            onBlur={(e) => {
              const parsed = parseNumber(display);
              if (!Number.isNaN(parsed)) commit(parsed);
              else setDisplay(show(current));
              onBlur?.(e);
            }}
            className={cn(
              "w-full min-w-0 bg-transparent text-center font-medium tabular-nums text-ink-1 outline-none",
              controlText[size],
              "placeholder:font-normal placeholder:text-ink-4",
            )}
            {...props}
          />
          {suffix ? (
            <span className="text-ink-3 shrink-0">{suffix}</span>
          ) : null}
        </div>

        <button
          type="button"
          tabIndex={-1}
          aria-label={incrementLabel ?? t.increase}
          onClick={() => stepBy(1)}
          disabled={disabled || atMax}
          className={cn(stepBtn, "border-l border-hairline")}
        >
          <Plus className="size-4" aria-hidden />
        </button>
      </InputGroup>
    );
  },
);
NumberField.displayName = "NumberField";
