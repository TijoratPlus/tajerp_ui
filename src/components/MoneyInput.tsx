import * as React from "react";

import { roundTo } from "../i18n/format";
import { cn } from "../lib/cn";
import type { ControlSize } from "../lib/control";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./InputGroup";
import { currencySymbol } from "./Money";
import { useFormat } from "./TajUIProvider";

export type MoneyInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "type" | "size" | "min" | "max" | "step"
> & {
  /** Controlled amount. `null` means controlled and empty. */
  value?: number | null;
  /** Initial amount when uncontrolled. */
  defaultValue?: number;
  /**
   * Fires with the parsed amount while typing, and with the clamped, rounded
   * amount on blur. `undefined` when the field is empty.
   */
  onValueChange?: (value: number | undefined) => void;
  /** ISO 4217 code for the suffix symbol. Defaults to TJS ("с"). */
  currency?: string;
  /** Override the suffix symbol. */
  symbol?: string;
  /** Hide the currency suffix. */
  hideSymbol?: boolean;
  /** Smallest allowed amount; applied on blur. */
  min?: number;
  /** Largest allowed amount; applied on blur. */
  max?: number;
  /** Decimals accepted and printed. Defaults to 2. */
  fractionDigits?: number;
  /** Accept a leading minus (refunds, corrections). Defaults to false. */
  allowNegative?: boolean;
  size?: ControlSize;
  /** Classes for the inner `<input>`; `className` styles the frame. */
  inputClassName?: string;
};

const clamp = (n: number, min?: number, max?: number) =>
  Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min ?? Number.NEGATIVE_INFINITY, n));

/**
 * Keep only what an amount can contain: digits, one decimal separator ("," or
 * "."), at most `fractionDigits` decimals and an optional leading minus.
 * Spaces typed as thousand separators are dropped.
 */
function sanitize(raw: string, fractionDigits: number, allowNegative: boolean): string {
  const negative = allowNegative && /^\s*[-−–]/.test(raw);
  let out = "";
  let sepSeen = false;
  let decimals = 0;
  for (const ch of raw) {
    if (ch >= "0" && ch <= "9") {
      if (sepSeen) {
        if (decimals >= fractionDigits) continue;
        decimals++;
      }
      out += ch;
    } else if ((ch === "," || ch === ".") && !sepSeen && fractionDigits > 0) {
      sepSeen = true;
      out += out === "" ? `0${ch}` : ch;
    }
  }
  return negative ? `-${out}` : out;
}

/**
 * Amount field with the currency sign as a suffix. Accepts "," or "." as the
 * decimal separator, shows the raw digits while focused and the grouped amount
 * (`1 234,50`) once the field loses focus, where `min` / `max` are applied too.
 *
 *   <MoneyInput aria-label="Сумма" value={sum} onValueChange={setSum} />
 *
 * `name` is forwarded to the visible input, whose text is formatted; read the
 * number from `onValueChange` (or `parseNumber`) rather than the raw form field.
 */
export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  (
    {
      className,
      inputClassName,
      value,
      defaultValue,
      onValueChange,
      currency = "TJS",
      symbol,
      hideSymbol = false,
      min,
      max,
      fractionDigits = 2,
      allowNegative = false,
      size = "md",
      disabled,
      onFocus,
      onBlur,
      onKeyDown,
      placeholder,
      ...props
    },
    ref,
  ) => {
    const fmt = useFormat();
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState<number | undefined>(defaultValue);
    const current = isControlled ? (value ?? undefined) : internal;

    const [focused, setFocused] = React.useState(false);
    const [raw, setRaw] = React.useState("");

    const toRaw = React.useCallback(
      (n: number | undefined) =>
        n === undefined || !Number.isFinite(n)
          ? ""
          : String(roundTo(n, fractionDigits)).replace(".", fmt.decimalSeparator),
      [fmt.decimalSeparator, fractionDigits],
    );

    const parseRaw = (text: string): number | undefined => {
      const n = fmt.parseNumber(text);
      return Number.isNaN(n) ? undefined : n;
    };

    // While focused, follow external changes that do not come from typing.
    React.useEffect(() => {
      if (!focused) return;
      setRaw((prev) => (parseRaw(prev) === current ? prev : toRaw(current)));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current]);

    const emit = (next: number | undefined) => {
      if (!isControlled) setInternal(next);
      if (next !== current) onValueChange?.(next);
    };

    const formatted =
      current === undefined || !Number.isFinite(current)
        ? ""
        : fmt.number(current, {
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits,
          });

    const suffix = hideSymbol ? null : (symbol ?? currencySymbol(currency, fmt.locale));

    return (
      <InputGroup
        data-slot="money-input"
        size={size}
        disabled={disabled}
        className={className}
      >
        <InputGroupInput
          ref={ref}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          disabled={disabled}
          placeholder={placeholder ?? fmt.number(0, { minimumFractionDigits: fractionDigits })}
          value={focused ? raw : formatted}
          onFocus={(e) => {
            setRaw(toRaw(current));
            setFocused(true);
            onFocus?.(e);
          }}
          onChange={(e) => {
            const next = sanitize(e.target.value, fractionDigits, allowNegative);
            setRaw(next);
            emit(parseRaw(next));
          }}
          onBlur={(e) => {
            setFocused(false);
            const parsed = parseRaw(raw);
            emit(
              parsed === undefined ? undefined : roundTo(clamp(parsed, min, max), fractionDigits),
            );
            onBlur?.(e);
          }}
          onKeyDown={(e) => {
            // Commit (clamp + format) on Enter without leaving the field.
            if (e.key === "Enter" && focused) {
              const parsed = parseRaw(raw);
              if (parsed !== undefined) {
                const next = roundTo(clamp(parsed, min, max), fractionDigits);
                setRaw(toRaw(next));
                emit(next);
              }
            }
            onKeyDown?.(e);
          }}
          className={cn("text-right tabular-nums", suffix && "pr-2", inputClassName)}
          {...props}
        />
        {suffix ? (
          <InputGroupAddon data-slot="money-input-symbol" className="pl-0 font-medium">
            {suffix}
          </InputGroupAddon>
        ) : null}
      </InputGroup>
    );
  },
);
MoneyInput.displayName = "MoneyInput";
