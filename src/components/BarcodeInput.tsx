import { Check, ScanBarcode } from "lucide-react";
import * as React from "react";

import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import type { ControlSize } from "../lib/control";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./InputGroup";
import { useMessages } from "./TajUIProvider";

export const barcodeInputMessages = defineMessages("barcodeInput", {
  ru: {
    label: "Штрихкод",
    placeholder: "Отсканируйте или введите штрихкод",
    scanned: (code: string) => `Отсканировано: ${code}`,
  },
  tg: {
    label: "Штрихкод",
    placeholder: "Штрихкодро скан кунед ё ворид намоед",
    scanned: (code: string) => `Скан шуд: ${code}`,
  },
  en: {
    label: "Barcode",
    placeholder: "Scan or type a barcode",
    scanned: (code: string) => `Scanned: ${code}`,
  },
});

export type BarcodeInputLabels = (typeof barcodeInputMessages.locales)["ru"];

export type BarcodeInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "type" | "size"
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Fires with the trimmed code when Enter is pressed (scanner or person). */
  onScan?: (code: string) => void;
  /** Empty the field after each scan. Defaults to true. */
  clearOnScan?: boolean;
  /** Shortest code that is submitted. Defaults to 1. */
  minLength?: number;
  /**
   * POS mode: take focus back after a scan and whenever focus falls to the
   * page itself (a click on empty space, a closed dialog), so the next scan
   * lands here. Focus moved to another control is left alone.
   */
  refocus?: boolean;
  /** Show and announce "Отсканировано: …" after each scan. Defaults to true. */
  showStatus?: boolean;
  /** How long the status stays visible, in ms. Defaults to 2500. */
  statusDuration?: number;
  size?: ControlSize;
  /** Classes for the inner `<input>`; `className` styles the wrapper. */
  inputClassName?: string;
  labels?: Partial<BarcodeInputLabels>;
};

/**
 * Field for keyboard-wedge barcode scanners (and typed codes): a scan icon,
 * submit on Enter via `onScan`, then the field clears itself. With `refocus`
 * it keeps focus between scans on a POS screen. Each scan is confirmed with a
 * short status line that screen readers announce.
 *
 * For scans that should work wherever focus is, use `useBarcodeScanner`.
 */
export const BarcodeInput = React.forwardRef<HTMLInputElement, BarcodeInputProps>(
  (
    {
      className,
      inputClassName,
      value,
      defaultValue,
      onValueChange,
      onScan,
      clearOnScan = true,
      minLength = 1,
      refocus = false,
      showStatus = true,
      statusDuration = 2500,
      size = "md",
      disabled,
      placeholder,
      labels,
      onKeyDown,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const t = useMessages(barcodeInputMessages, labels);
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState(defaultValue ?? "");
    const current = isControlled ? value : internal;

    const innerRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    const [status, setStatus] = React.useState<{ code: string; n: number } | null>(null);
    const statusTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
    React.useEffect(() => () => clearTimeout(statusTimer.current), []);

    const setValue = (next: string) => {
      if (!isControlled) setInternal(next);
      if (next !== current) onValueChange?.(next);
    };

    // POS refocus: when focus falls back to <body>, take it again.
    React.useEffect(() => {
      if (!refocus) return;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const check = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          const el = innerRef.current;
          if (!el || el.disabled) return;
          const active = document.activeElement;
          if (!active || active === document.body || active === document.documentElement) {
            el.focus();
          }
        }, 50);
      };
      document.addEventListener("focusout", check);
      document.addEventListener("pointerup", check);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("focusout", check);
        document.removeEventListener("pointerup", check);
      };
    }, [refocus]);

    const submit = () => {
      const code = current.trim();
      if (code.length < minLength) return;
      onScan?.(code);
      if (clearOnScan) setValue("");
      if (showStatus) {
        setStatus((prev) => ({ code, n: (prev?.n ?? 0) + 1 }));
        clearTimeout(statusTimer.current);
        statusTimer.current = setTimeout(() => setStatus(null), statusDuration);
      }
      if (refocus) innerRef.current?.focus();
    };

    const hasName = ariaLabel || props["aria-labelledby"] || props.id;

    return (
      <div data-slot="barcode-input" className={cn("flex w-full flex-col gap-1", className)}>
        <InputGroup size={size} disabled={disabled}>
          <InputGroupAddon data-slot="barcode-input-icon">
            <ScanBarcode aria-hidden />
          </InputGroupAddon>
          <InputGroupInput
            ref={innerRef}
            type="text"
            inputMode="text"
            enterKeyHint="enter"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            disabled={disabled}
            aria-label={hasName ? ariaLabel : t.label}
            placeholder={placeholder ?? t.placeholder}
            value={current}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              onKeyDown?.(e);
              if (e.defaultPrevented) return;
              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            className={cn("tabular-nums", inputClassName)}
            {...props}
          />
        </InputGroup>
        {showStatus ? (
          <div
            role="status"
            aria-live="polite"
            data-slot="barcode-input-status"
            className="min-h-5 text-ui-helper text-tj-success-ink"
          >
            {status ? (
              <span
                key={status.n}
                className="inline-flex items-center gap-1 font-medium motion-safe:animate-in motion-safe:fade-in-0"
              >
                <Check className="size-3.5 shrink-0" aria-hidden />
                <span className="tabular-nums">{t.scanned(status.code)}</span>
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  },
);
BarcodeInput.displayName = "BarcodeInput";
