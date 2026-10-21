import * as React from "react";

import {
  decimalSeparator,
  formatDate,
  formatMoney,
  formatNumber,
  formatRelative,
  parseNumber,
  type DateFormatOptions,
  type MoneyFormatOptions,
  type NumberFormatOptions,
} from "../i18n/format";
import { DEFAULT_LOCALE, type Locale } from "../i18n/locale";
import {
  commonMessages,
  type MessageDict,
  type MessageNamespace,
} from "../i18n/messages";

/** Per-namespace string overrides, e.g. `{ dataTable: { noData: "…" } }`. */
export type MessageOverrides = Record<string, Partial<MessageDict>>;

interface TajUIContextValue {
  locale: Locale;
  messages?: MessageOverrides;
  portalContainer?: HTMLElement | null;
  /** Default currency for money formatting (ISO 4217). */
  currency: string;
}

const TajUIContext = React.createContext<TajUIContextValue>({
  locale: DEFAULT_LOCALE,
  currency: "TJS",
});

export interface TajUIProviderProps {
  children?: React.ReactNode;
  /** Interface language. Defaults to "ru". */
  locale?: Locale;
  /** Override any component string, per namespace. */
  messages?: MessageOverrides;
  /** Default currency for `useFormat().money`. Defaults to "TJS". */
  currency?: string;
  /**
   * Element that Dialog, Sheet, Popover, Tooltip, DropdownMenu, … portal
   * into. Defaults to `document.body`.
   */
  portalContainer?: HTMLElement | null;
  /**
   * Portal overlays into a body-level `<div class="tj-react-root">` instead
   * of bare `<body>`. Needed in the Frappe desk, where the compiled
   * stylesheet (`tajerp_ui/styles/compiled.css`) only styles elements inside
   * `.tj-react-root`. Ignored when `portalContainer` is set.
   */
  scopedPortal?: boolean;
}

/**
 * Optional app-level configuration: language, string overrides, currency and
 * the portal container. Every component works without it (Russian, TJS,
 * portals into `<body>`).
 */
export function TajUIProvider({
  children,
  locale,
  messages,
  currency,
  portalContainer,
  scopedPortal = false,
}: TajUIProviderProps) {
  const parent = React.useContext(TajUIContext);
  const [scopedHost, setScopedHost] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!scopedPortal || portalContainer !== undefined) return;
    const host = document.createElement("div");
    host.className = "tj-react-root";
    host.setAttribute("data-slot", "portal-root");
    document.body.appendChild(host);
    setScopedHost(host);
    return () => {
      host.remove();
      setScopedHost(null);
    };
  }, [scopedPortal, portalContainer]);

  const value = React.useMemo<TajUIContextValue>(
    () => ({
      locale: locale ?? parent.locale,
      currency: currency ?? parent.currency,
      messages: messages
        ? mergeOverrides(parent.messages, messages)
        : parent.messages,
      portalContainer:
        portalContainer !== undefined
          ? portalContainer
          : scopedPortal
            ? scopedHost
            : parent.portalContainer,
    }),
    [locale, currency, messages, portalContainer, scopedPortal, scopedHost, parent],
  );

  return <TajUIContext.Provider value={value}>{children}</TajUIContext.Provider>;
}

function mergeOverrides(
  a: MessageOverrides | undefined,
  b: MessageOverrides,
): MessageOverrides {
  if (!a) return b;
  const out: MessageOverrides = { ...a };
  for (const ns of Object.keys(b)) out[ns] = { ...a[ns], ...b[ns] };
  return out;
}

/** Current interface language. */
export function useLocale(): Locale {
  return React.useContext(TajUIContext).locale;
}

/** Container for Radix portals (undefined → document.body). */
export function usePortalContainer(): HTMLElement | undefined {
  return React.useContext(TajUIContext).portalContainer ?? undefined;
}

/**
 * Resolve a component's strings: its defaults for the active locale, then
 * provider overrides for its namespace, then per-instance `overrides`
 * (usually a `labels` prop). `undefined` overrides are ignored.
 */
export function useMessages<T extends MessageDict>(
  defs: MessageNamespace<T>,
  overrides?: Partial<T>,
): T {
  const { locale, messages } = React.useContext(TajUIContext);
  return React.useMemo(() => {
    const out = { ...(defs.locales[locale] ?? defs.locales.ru) } as T;
    const fromProvider = messages?.[defs.namespace];
    if (fromProvider) assignDefined(out, fromProvider);
    if (overrides) assignDefined(out, overrides);
    return out;
  }, [defs, locale, messages, overrides]);
}

function assignDefined(target: MessageDict, source: Partial<MessageDict>) {
  for (const key of Object.keys(source)) {
    const v = source[key];
    if (v !== undefined) target[key] = v;
  }
}

/** Shared strings (close, cancel, loading, …) in the active locale. */
export function useCommonMessages() {
  return useMessages(commonMessages);
}

/** Formatting helpers bound to the provider's locale and currency. */
export function useFormat() {
  const { locale, currency } = React.useContext(TajUIContext);
  return React.useMemo(
    () => ({
      locale,
      /** Default currency (ISO 4217) used by `money`. */
      currency,
      number: (value: number, opts?: Omit<NumberFormatOptions, "locale">) =>
        formatNumber(value, { locale, ...opts }),
      money: (value: number, opts?: Omit<MoneyFormatOptions, "locale">) =>
        formatMoney(value, { locale, currency, ...opts }),
      date: (value: Date | number | string, opts?: Omit<DateFormatOptions, "locale">) =>
        formatDate(value, { locale, ...opts }),
      relative: (value: Date | number | string, now?: number) =>
        formatRelative(value, { locale, now }),
      parseNumber,
      decimalSeparator: decimalSeparator(locale),
    }),
    [locale, currency],
  );
}
