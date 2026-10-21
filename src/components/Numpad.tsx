import { Delete } from "lucide-react";
import * as React from "react";

import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import { useFormat, useMessages } from "./TajUIProvider";

export const numpadMessages = defineMessages("numpad", {
  ru: {
    keypad: "Цифровая клавиатура",
    hint: "Вводите цифры с клавиатуры: Backspace — удалить, Delete — очистить, Enter — подтвердить.",
    backspace: "Удалить последнюю цифру",
    clear: "Очистить",
    clearShort: "C",
    decimal: "Десятичный разделитель",
    doubleZero: "Два нуля",
    enter: "OK",
    quickAmounts: "Быстрые суммы",
    quickAmount: (amount: string) => `Ввести ${amount}`,
    display: "Введённое значение",
  },
  tg: {
    keypad: "Клавиатураи рақамӣ",
    hint: "Рақамҳоро бо клавиатура ворид кунед: Backspace — нест кардан, Delete — тоза кардан, Enter — тасдиқ.",
    backspace: "Нест кардани рақами охирин",
    clear: "Тоза кардан",
    clearShort: "C",
    decimal: "Ҷудокунандаи даҳӣ",
    doubleZero: "Ду сифр",
    enter: "OK",
    quickAmounts: "Маблағҳои зуд",
    quickAmount: (amount: string) => `Ворид кардани ${amount}`,
    display: "Қимати воридшуда",
  },
  en: {
    keypad: "Numeric keypad",
    hint: "Type digits on the keyboard: Backspace deletes, Delete clears, Enter confirms.",
    backspace: "Delete last digit",
    clear: "Clear",
    clearShort: "C",
    decimal: "Decimal separator",
    doubleZero: "Double zero",
    enter: "OK",
    quickAmounts: "Quick amounts",
    quickAmount: (amount: string) => `Enter ${amount}`,
    display: "Entered value",
  },
});

export type NumpadLabels = (typeof numpadMessages.locales)["ru"];

export type NumpadKey =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "00"
  | "decimal"
  | "backspace"
  | "clear"
  | "enter";

export type NumpadProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange"
> & {
  /**
   * Controlled value as a plain numeric string with "." as the decimal point
   * ("1250.5"), so `Number(value)` / `parseNumber(value)` work directly. It is
   * shown with the locale separator ("1 250,5").
   */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Show the decimal-separator key. Defaults to true (off when `maxDecimals` is 0). */
  decimalKey?: boolean;
  /** Show the "00" key. Defaults to true. */
  doubleZeroKey?: boolean;
  /** Most characters in the value. Defaults to 12. */
  maxLength?: number;
  /** Most digits after the decimal point. Defaults to 2. */
  maxDecimals?: number;
  /** Adds an "OK" key (and the Enter shortcut) that fires with the value. */
  onEnter?: (value: string) => void;
  /** Disable the OK key, e.g. while the received amount is too small. */
  enterDisabled?: boolean;
  /** Amount shortcuts shown above the keys; pressing one sets the value. */
  quickAmounts?: number[];
  /** Render the value display above the keys. Defaults to true. */
  showDisplay?: boolean;
  /** Content after the displayed value, e.g. the currency sign "с". */
  displaySuffix?: React.ReactNode;
  disabled?: boolean;
  labels?: Partial<NumpadLabels>;
};

const DIGIT_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
] as const;

/** Apply one key press to a value string. Exported for tests and custom pads. */
export function applyNumpadKey(
  value: string,
  key: NumpadKey,
  { maxLength = 12, maxDecimals = 2 }: { maxLength?: number; maxDecimals?: number } = {},
): string {
  if (key === "clear") return "";
  if (key === "backspace") return value.slice(0, -1);
  if (key === "enter") return value;
  const dot = value.indexOf(".");
  if (key === "decimal") {
    if (maxDecimals <= 0 || dot !== -1) return value;
    const next = value === "" ? "0." : `${value}.`;
    return next.length > maxLength ? value : next;
  }
  let next = value;
  for (const ch of key) {
    if (next === "0") {
      next = ch; // no leading zeros: "0" + "5" → "5", "0" + "00" → "0"
      continue;
    }
    if (dot !== -1 && next.length - dot - 1 >= maxDecimals) break;
    if (next.length >= maxLength) break;
    next += ch;
  }
  return next;
}

function normalise(value: string | undefined): string {
  return (value ?? "").replace(",", ".").replace(/[^\d.]/g, "");
}

/**
 * On-screen keypad for touch POS screens: cash received, quantities, PINs-free
 * numeric entry. Large keys (56 px, 64 px in touch density), optional "00",
 * decimal and OK keys and a row of quick amounts.
 *
 * Keyboard: the keypad is one tab stop. While it has focus, digits, "," / ".",
 * Backspace, Delete (clear) and Enter (OK) work like the on-screen keys, which
 * are pointer targets only (they never steal focus).
 */
export const Numpad = React.forwardRef<HTMLDivElement, NumpadProps>(
  (
    {
      className,
      value,
      defaultValue,
      onValueChange,
      decimalKey = true,
      doubleZeroKey = true,
      maxLength = 12,
      maxDecimals = 2,
      onEnter,
      enterDisabled = false,
      quickAmounts,
      showDisplay = true,
      displaySuffix,
      disabled = false,
      labels,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const t = useMessages(numpadMessages, labels);
    const fmt = useFormat();
    const hintId = React.useId();

    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState(() => normalise(defaultValue));
    const current = isControlled ? normalise(value) : internal;

    const [flash, setFlash] = React.useState<NumpadKey | null>(null);
    const flashTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
    React.useEffect(() => () => clearTimeout(flashTimer.current), []);

    const setValue = (next: string) => {
      if (next === current) return;
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    };

    const hasDecimal = decimalKey && maxDecimals > 0;
    const hasEnter = onEnter !== undefined;

    const press = (key: NumpadKey) => {
      if (disabled) return;
      if (key === "enter") {
        if (!enterDisabled) onEnter?.(current);
        return;
      }
      if (key === "decimal" && !hasDecimal) return;
      setValue(applyNumpadKey(current, key, { maxLength, maxDecimals }));
    };

    const pressFromKeyboard = (key: NumpadKey) => {
      press(key);
      setFlash(key);
      clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setFlash(null), 120);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented || disabled || e.ctrlKey || e.metaKey || e.altKey) return;
      let key: NumpadKey | null = null;
      if (/^[0-9]$/.test(e.key)) key = e.key as NumpadKey;
      else if (e.key === "," || e.key === "." || e.key === "Decimal") key = "decimal";
      else if (e.key === "Backspace") key = "backspace";
      else if (e.key === "Delete" || e.key === "Clear") key = "clear";
      else if (e.key === "Enter" && hasEnter) key = "enter";
      if (!key) return;
      e.preventDefault();
      pressFromKeyboard(key);
    };

    // Displayed value: grouped integer part + locale decimal separator.
    const [intPart, decPart] = current.split(".");
    const shown =
      current === ""
        ? ""
        : `${intPart === "" ? "0" : fmt.number(Number(intPart), { maximumFractionDigits: 0 })}${
            decPart !== undefined ? fmt.decimalSeparator + decPart : ""
          }`;

    const keyBase = cn(
      "inline-flex select-none items-center justify-center gap-1 !rounded-xl border border-hairline",
      "min-h-14 [[data-density=touch]_&]:min-h-16 px-2 font-semibold tabular-nums",
      "cursor-pointer touch-manipulation transition-[background,transform,color] duration-100",
      "motion-safe:active:scale-[0.97] motion-safe:data-[flash]:scale-[0.97]",
      "disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100",
      "outline-none focus-visible:ring-2 focus-visible:ring-focus",
    );
    const digitKey = cn(
      keyBase,
      "bg-ui-surface text-xl text-ink-1 hover:bg-mist active:bg-mist data-[flash]:bg-mist",
    );
    const actionKey = cn(
      keyBase,
      "bg-ui-surface-2 text-ui-title text-ink-2 hover:bg-mist hover:text-ink-1 active:bg-mist data-[flash]:bg-mist",
    );

    const renderKey = (
      key: NumpadKey,
      content: React.ReactNode,
      cls: string,
      extra?: { label?: string; className?: string; disabled?: boolean },
    ) => (
      <button
        key={key}
        type="button"
        tabIndex={-1}
        data-slot="numpad-key"
        data-key={key}
        data-flash={flash === key || undefined}
        aria-label={extra?.label}
        disabled={disabled || extra?.disabled}
        // Keep focus where it is (the keypad or a field) on pointer presses.
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => press(key)}
        className={cn(cls, extra?.className)}
      >
        {content}
      </button>
    );

    const zeroSpan = 3 - (hasDecimal ? 1 : 0) - (doubleZeroKey ? 1 : 0);

    return (
      <div
        ref={ref}
        role="group"
        tabIndex={disabled ? -1 : 0}
        aria-label={t.keypad}
        aria-describedby={hintId}
        aria-disabled={disabled || undefined}
        data-slot="numpad"
        onKeyDown={handleKeyDown}
        className={cn(
          "flex w-full flex-col gap-2 !rounded-2xl outline-none",
          "focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-ui-bg",
          className,
        )}
        {...props}
      >
        <span id={hintId} className="sr-only">
          {t.hint}
        </span>

        {showDisplay ? (
          <output
            data-slot="numpad-display"
            aria-label={t.display}
            aria-live="polite"
            className="flex min-h-14 items-baseline justify-end gap-1.5 !rounded-xl border border-hairline bg-ui-surface-2 px-4 py-2 text-3xl font-bold tabular-nums text-ink-1"
          >
            <span className={cn("truncate", !shown && "text-ink-4")}>{shown || "0"}</span>
            {displaySuffix ? (
              <span className="text-xl font-semibold text-ink-3">{displaySuffix}</span>
            ) : null}
          </output>
        ) : null}

        {quickAmounts && quickAmounts.length > 0 ? (
          <div
            role="group"
            aria-label={t.quickAmounts}
            data-slot="numpad-quick-amounts"
            className="grid auto-cols-fr grid-flow-col gap-2"
          >
            {quickAmounts.map((amount) => {
              const label = fmt.money(amount, {
                minimumFractionDigits: 0,
                maximumFractionDigits: maxDecimals,
              });
              return (
                <button
                  key={amount}
                  type="button"
                  tabIndex={-1}
                  data-slot="numpad-quick-amount"
                  aria-label={t.quickAmount(label)}
                  disabled={disabled}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    setValue(
                      String(amount).length > maxLength ? current : normalise(String(amount)),
                    )
                  }
                  className={cn(
                    keyBase,
                    "min-h-12 [[data-density=touch]_&]:min-h-14 border-border-brand bg-mist text-ui-title text-mist-ink hover:bg-mist/70",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ) : null}

        <div data-slot="numpad-keys" className="grid grid-cols-4 gap-2">
          {DIGIT_ROWS.map((row, r) =>
            row.map((d, c) =>
              renderKey(d, d, digitKey, {
                className: cn(
                  ["col-start-1", "col-start-2", "col-start-3"][c],
                  ["row-start-1", "row-start-2", "row-start-3"][r],
                ),
              }),
            ),
          )}

          {hasDecimal
            ? renderKey("decimal", fmt.decimalSeparator, digitKey, {
                label: t.decimal,
                className: "col-start-1 row-start-4",
              })
            : null}
          {renderKey("0", "0", digitKey, {
            className: cn(
              "row-start-4",
              hasDecimal ? "col-start-2" : "col-start-1",
              zeroSpan === 2 && "col-span-2",
              zeroSpan === 3 && "col-span-3",
            ),
          })}
          {doubleZeroKey
            ? renderKey("00", "00", digitKey, {
                label: t.doubleZero,
                className: "col-start-3 row-start-4",
              })
            : null}

          {renderKey("backspace", <Delete className="size-6" aria-hidden />, actionKey, {
            label: t.backspace,
            className: cn("col-start-4 row-start-1", !hasEnter && "row-span-2"),
          })}
          {renderKey("clear", t.clearShort, actionKey, {
            label: t.clear,
            className: cn(
              "col-start-4",
              hasEnter ? "row-start-2" : "row-start-3 row-span-2",
            ),
          })}
          {hasEnter
            ? renderKey(
                "enter",
                t.enter,
                cn(
                  keyBase,
                  "border-transparent bg-brand-solid text-ui-title font-bold text-on-brand shadow-tj-brand hover:bg-brand-solid-hover",
                  "data-[flash]:bg-brand-solid-hover disabled:bg-brand-disabled disabled:shadow-none",
                ),
                {
                  className: "col-start-4 row-start-3 row-span-2",
                  disabled: enterDisabled,
                },
              )
            : null}
        </div>
      </div>
    );
  },
);
Numpad.displayName = "Numpad";
