import * as React from "react";

import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import type { ControlSize } from "../lib/control";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./InputGroup";
import { useMessages } from "./TajUIProvider";

/** Tajikistan country calling code. */
export const TJ_COUNTRY_CODE = "+992";
/** Digits in a Tajik national number (operator code + subscriber). */
export const TJ_NATIONAL_LENGTH = 9;

export const phoneInputMessages = defineMessages("phoneInput", {
  ru: { placeholder: "93 123 45 67" },
  tg: { placeholder: "93 123 45 67" },
  en: { placeholder: "93 123 45 67" },
});

export type PhoneInputLabels = (typeof phoneInputMessages.locales)["ru"];

/**
 * The national digits (at most 9) of a Tajik phone number written in any
 * common form: "+992 93 123 45 67", "00992931234567", "992931234567",
 * "0931234567", "93-123-45-67" or "931234567".
 */
export function tjNationalDigits(input: string): string {
  const trimmed = input.trim();
  let digits = trimmed.replace(/\D/g, "");
  const international = trimmed.startsWith("+") || digits.startsWith("00");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (international) {
    if (digits.startsWith("992")) digits = digits.slice(3);
  } else if (digits.length >= TJ_NATIONAL_LENGTH + 3 && digits.startsWith("992")) {
    digits = digits.slice(3);
  } else if (digits.length === TJ_NATIONAL_LENGTH + 1 && digits.startsWith("0")) {
    // Trunk prefix: 0 93 123 45 67.
    digits = digits.slice(1);
  }
  return digits.slice(0, TJ_NATIONAL_LENGTH);
}

/**
 * Normalise a Tajik number to E.164: "+992931234567". Returns "" when the
 * input has no digits; an incomplete number keeps the digits typed so far
 * ("+99293").
 */
export function normalizeTjPhone(input: string): string {
  const digits = tjNationalDigits(input);
  return digits ? `${TJ_COUNTRY_CODE}${digits}` : "";
}

/**
 * Group national digits as "93 123 45 67" (accepts E.164 or national input).
 * Pass `{ international: true }` for "+992 93 123 45 67".
 */
export function formatTjPhone(
  input: string,
  { international = false }: { international?: boolean } = {},
): string {
  const d = tjNationalDigits(input);
  const groups = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
  const national = groups.join(" ");
  return international && national ? `${TJ_COUNTRY_CODE} ${national}` : national;
}

/** True when `input` holds a complete 9-digit Tajik number. */
export function isValidTjPhone(input: string): boolean {
  return tjNationalDigits(input).length === TJ_NATIONAL_LENGTH;
}

/** Caret index right after the `count`-th digit of `text`. */
function caretAfterDigits(text: string, count: number): number {
  if (count <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < text.length; i++) {
    if (/\d/.test(text[i])) seen++;
    if (seen === count) return i + 1;
  }
  return text.length;
}

const countDigits = (text: string) => text.replace(/\D/g, "").length;

export type PhoneInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "type" | "size"
> & {
  /** Controlled number, E.164 ("+992931234567") or national digits. */
  value?: string;
  /** Initial number when uncontrolled, E.164 or national digits. */
  defaultValue?: string;
  /** Fires with the E.164 number ("+992931234567"), or "" when empty. */
  onValueChange?: (value: string) => void;
  /**
   * Mark the field `aria-invalid` when it loses focus holding an incomplete
   * number. Defaults to true.
   */
  validateOnBlur?: boolean;
  size?: ControlSize;
  /** Classes for the inner `<input>`; `className` styles the frame. */
  inputClassName?: string;
  labels?: Partial<PhoneInputLabels>;
};

/**
 * Tajik phone number field: a fixed "+992" prefix and the national number
 * grouped as "93 123 45 67" while typing. Pasted numbers in any common form
 * ("+992 93 123 45 67", "0931234567") are normalised. Reports E.164.
 */
export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      className,
      inputClassName,
      value,
      defaultValue,
      onValueChange,
      validateOnBlur = true,
      size = "md",
      disabled,
      placeholder,
      labels,
      onBlur,
      onKeyDown,
      onPaste,
      "aria-invalid": ariaInvalid,
      ...props
    },
    ref,
  ) => {
    const t = useMessages(phoneInputMessages, labels);
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState(() => tjNationalDigits(defaultValue ?? ""));
    const digits = isControlled ? tjNationalDigits(value) : internal;
    const display = formatTjPhone(digits);

    const [incomplete, setIncomplete] = React.useState(false);

    const innerRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    // Caret to restore after re-formatting: the number of digits before it.
    const pendingCaret = React.useRef<number | null>(null);
    React.useLayoutEffect(() => {
      const el = innerRef.current;
      if (pendingCaret.current === null || !el) return;
      const pos = caretAfterDigits(el.value, pendingCaret.current);
      pendingCaret.current = null;
      if (document.activeElement === el) el.setSelectionRange(pos, pos);
    });

    const update = (next: string, caretDigits?: number) => {
      const clean = next.replace(/\D/g, "").slice(0, TJ_NATIONAL_LENGTH);
      if (caretDigits !== undefined) {
        pendingCaret.current = Math.min(caretDigits, clean.length);
      }
      if (clean.length === TJ_NATIONAL_LENGTH || clean.length === 0) setIncomplete(false);
      if (clean === digits) return;
      if (!isControlled) setInternal(clean);
      onValueChange?.(clean ? `${TJ_COUNTRY_CODE}${clean}` : "");
    };

    const invalid =
      ariaInvalid === true || ariaInvalid === "true" || (validateOnBlur && incomplete);

    return (
      <InputGroup data-slot="phone-input" size={size} disabled={disabled} className={className}>
        <InputGroupAddon data-slot="phone-input-code" className="pr-0 font-medium text-ink-2">
          {TJ_COUNTRY_CODE}
        </InputGroupAddon>
        <InputGroupInput
          ref={innerRef}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          disabled={disabled}
          placeholder={placeholder ?? t.placeholder}
          value={display}
          aria-invalid={invalid || undefined}
          onChange={(e) => {
            const el = e.target;
            const caret = el.selectionStart ?? el.value.length;
            const before = countDigits(el.value.slice(0, caret));
            // A whole number typed or autofilled with its country code.
            const raw = el.value;
            const next =
              countDigits(raw) > TJ_NATIONAL_LENGTH || raw.trim().startsWith("+")
                ? tjNationalDigits(raw)
                : raw;
            update(next, next === raw ? before : TJ_NATIONAL_LENGTH);
          }}
          onPaste={(e) => {
            onPaste?.(e);
            if (e.defaultPrevented) return;
            const text = e.clipboardData.getData("text");
            if (!text) return;
            e.preventDefault();
            const el = e.currentTarget;
            const start = el.selectionStart ?? display.length;
            const end = el.selectionEnd ?? display.length;
            const pastedDigits = countDigits(text);
            const replacesAll = (start === 0 && end === display.length) || digits.length === 0;
            if (replacesAll || pastedDigits > TJ_NATIONAL_LENGTH || text.trim().startsWith("+")) {
              const next = tjNationalDigits(text);
              update(next, next.length);
              return;
            }
            const head = countDigits(display.slice(0, start));
            const tail = countDigits(display.slice(0, end));
            const inserted = text.replace(/\D/g, "");
            update(digits.slice(0, head) + inserted + digits.slice(tail), head + inserted.length);
          }}
          onKeyDown={(e) => {
            const el = e.currentTarget;
            const start = el.selectionStart ?? 0;
            const end = el.selectionEnd ?? 0;
            // Backspace / Delete next to a group space removes the digit beyond it.
            if (start === end && (e.key === "Backspace" || e.key === "Delete")) {
              const back = e.key === "Backspace";
              const neighbour = back ? display[start - 1] : display[start];
              if (neighbour === " ") {
                e.preventDefault();
                const idx = countDigits(display.slice(0, start)); // digits before caret
                const removeAt = back ? idx - 1 : idx;
                if (removeAt >= 0 && removeAt < digits.length) {
                  update(
                    digits.slice(0, removeAt) + digits.slice(removeAt + 1),
                    back ? removeAt : idx,
                  );
                }
              }
            }
            onKeyDown?.(e);
          }}
          onBlur={(e) => {
            setIncomplete(digits.length > 0 && digits.length < TJ_NATIONAL_LENGTH);
            onBlur?.(e);
          }}
          className={cn("tabular-nums", inputClassName)}
          {...props}
        />
      </InputGroup>
    );
  },
);
PhoneInput.displayName = "PhoneInput";
