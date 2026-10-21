import * as React from "react";

import { cn } from "../lib/cn";
import {
  LOCALES,
  LOCALE_NAMES,
  LOCALE_SHORT,
  type Locale,
} from "../i18n/locale";
import { defineMessages } from "../i18n/messages";
import { SegmentedControl } from "./SegmentedControl";
import { Select } from "./Select";
import { useLocale, useMessages } from "./TajUIProvider";

export const languageSwitcherMessages = defineMessages("languageSwitcher", {
  ru: { label: "Язык интерфейса" },
  tg: { label: "Забони интерфейс" },
  en: { label: "Interface language" },
});

export type LanguageSwitcherLabels =
  (typeof languageSwitcherMessages.locales)["ru"];

export interface LanguageSwitcherProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange"
> {
  /** Selected locale. Defaults to the TajUIProvider locale when uncontrolled. */
  value?: Locale;
  defaultValue?: Locale;
  onValueChange?: (locale: Locale) => void;
  /** "segmented": RU / TJ / EN pills. "select": native select with full names. */
  variant?: "segmented" | "select";
  size?: "sm" | "md";
  /** Languages to offer. Defaults to ru, tg, en. */
  locales?: readonly Locale[];
  /** Show the group label visibly (select variant). Defaults to false. */
  showLabel?: boolean;
  disabled?: boolean;
  labels?: Partial<LanguageSwitcherLabels>;
}

/**
 * RU / TJ / EN interface-language switcher. The switcher only reports the
 * choice; pass it to `<TajUIProvider locale>` (and persist it) in the app.
 */
export const LanguageSwitcher = React.forwardRef<
  HTMLDivElement,
  LanguageSwitcherProps
>(
  (
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      variant = "segmented",
      size = "md",
      locales = LOCALES,
      showLabel = false,
      disabled = false,
      labels: labelsProp,
      className,
      ...props
    },
    ref,
  ) => {
    const t = useMessages(languageSwitcherMessages, labelsProp);
    const providerLocale = useLocale();
    const selectId = React.useId();

    const isControlled = valueProp !== undefined;
    const [internal, setInternal] = React.useState<Locale>(
      defaultValue ?? providerLocale,
    );
    const value = isControlled ? valueProp : internal;

    const change = (next: Locale) => {
      if (next === value) return;
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    };

    return (
      <div
        ref={ref}
        data-slot="language-switcher"
        data-variant={variant}
        className={cn("inline-flex items-center gap-2", className)}
        {...props}
      >
        {variant === "segmented" ? (
          <SegmentedControl<Locale>
            aria-label={t.label}
            size={size}
            value={value}
            onChange={change}
            options={locales.map((l) => ({
              value: l,
              disabled,
              // Visible code plus the native name for screen readers; the
              // accessible name starts with the visible text (WCAG 2.5.3).
              label: (
                <span lang={l} data-locale={l}>
                  {LOCALE_SHORT[l]}
                  <span className="sr-only"> {LOCALE_NAMES[l]}</span>
                </span>
              ),
            }))}
          />
        ) : (
          <>
            {showLabel ? (
              <label
                htmlFor={selectId}
                className="shrink-0 text-ui-label font-medium text-ink-2"
              >
                {t.label}
              </label>
            ) : null}
            <Select
              id={selectId}
              aria-label={showLabel ? undefined : t.label}
              value={value}
              disabled={disabled}
              onChange={(e) => change(e.target.value as Locale)}
              className={
                size === "sm" ? "h-control-sm text-ui-label" : undefined
              }
            >
              {locales.map((l) => (
                <option key={l} value={l} lang={l}>
                  {LOCALE_NAMES[l]}
                </option>
              ))}
            </Select>
          </>
        )}
      </div>
    );
  },
);
LanguageSwitcher.displayName = "LanguageSwitcher";
