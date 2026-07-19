import { Minus, Plus } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

export type NumberFieldProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "type" | "min" | "max" | "step"
> & {
  value?: number;
  defaultValue?: number;
  /** Fires with the parsed numeric value (clamped on blur and via steppers). */
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Static adornment before the number, e.g. a currency symbol. */
  prefix?: React.ReactNode;
  /** Static adornment after the number, e.g. a unit. */
  suffix?: React.ReactNode;
};

const clamp = (n: number, min?: number, max?: number) =>
  Math.min(
    max ?? Number.POSITIVE_INFINITY,
    Math.max(min ?? Number.NEGATIVE_INFINITY, n),
  );

/** Numeric input with −/+ steppers, min/max clamping and optional adornments. */
export const NumberField = React.forwardRef<HTMLInputElement, NumberFieldProps>(
  (
    {
      className,
      value,
      defaultValue,
      onValueChange,
      min,
      max,
      step = 1,
      prefix,
      suffix,
      disabled,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState<number | undefined>(
      defaultValue,
    );
    const current = isControlled ? value : internal;
    const hasValue = current !== undefined && !Number.isNaN(current);

    const [display, setDisplay] = React.useState(
      hasValue ? String(current) : "",
    );

    React.useEffect(() => {
      if (isControlled) {
        setDisplay(
          value !== undefined && !Number.isNaN(value) ? String(value) : "",
        );
      }
    }, [isControlled, value]);

    const commit = (n: number) => {
      const next = clamp(n, min, max);
      if (!isControlled) setInternal(next);
      setDisplay(String(next));
      onValueChange?.(next);
    };

    const stepBy = (dir: 1 | -1) => {
      const base = hasValue ? (current as number) : (min ?? 0);
      commit(base + dir * step);
    };

    const atMin = hasValue && min !== undefined && (current as number) <= min;
    const atMax = hasValue && max !== undefined && (current as number) >= max;

    const stepBtn =
      "inline-flex h-full w-10 shrink-0 items-center justify-center text-ink-2 outline-none transition-colors hover:bg-mist hover:text-brand-ink focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/30 cursor-pointer disabled:pointer-events-none disabled:opacity-40";

    return (
      <div
        data-slot="number-field"
        className={cn(
          "relative flex items-center bg-ui-surface-2 border border-hairline !rounded-lg w-full h-9 overflow-hidden text-ink-1 transition-colors duration-150",
          "focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/30",
          disabled && "cursor-not-allowed opacity-60",
          className,
        )}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Decrement"
          onClick={() => stepBy(-1)}
          disabled={disabled || atMin}
          className={cn(stepBtn, "border-r border-hairline")}
        >
          <Minus className="size-4" />
        </button>

        <div className="flex flex-1 justify-center items-center gap-1 px-2 min-w-0">
          {prefix ? (
            <span className="text-[14px] text-ink-3 shrink-0">{prefix}</span>
          ) : null}
          <input
            ref={ref}
            type="number"
            inputMode="decimal"
            value={display}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const raw = e.target.value;
              setDisplay(raw);
              const parsed = Number.parseFloat(raw);
              if (!Number.isNaN(parsed)) {
                if (!isControlled) setInternal(parsed);
                onValueChange?.(parsed);
              } else if (raw === "" && !isControlled) {
                setInternal(undefined);
              }
            }}
            onBlur={(e) => {
              const parsed = Number.parseFloat(display);
              if (!Number.isNaN(parsed)) commit(parsed);
              onBlur?.(e);
            }}
            className={cn(
              "bg-transparent outline-none w-full min-w-0 font-medium text-[14px] text-ink-1 text-center",
              "placeholder:font-normal placeholder:text-ink-3",
              "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            )}
            {...props}
          />
          {suffix ? (
            <span className="text-[14px] text-ink-3 shrink-0">{suffix}</span>
          ) : null}
        </div>

        <button
          type="button"
          tabIndex={-1}
          aria-label="Increment"
          onClick={() => stepBy(1)}
          disabled={disabled || atMax}
          className={cn(stepBtn, "border-l border-hairline")}
        >
          <Plus className="size-4" />
        </button>
      </div>
    );
  },
);
NumberField.displayName = "NumberField";
