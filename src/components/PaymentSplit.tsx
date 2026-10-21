import {
  Banknote,
  CreditCard,
  Landmark,
  Plus,
  Smartphone,
  X,
  type LucideIcon,
} from "lucide-react";
import * as React from "react";

import { parseNumber, roundTo } from "../i18n/format";
import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import { focusRing } from "../lib/control";
import { Button } from "./Button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./InputGroup";
import { useFormat, useMessages } from "./TajUIProvider";

export const paymentSplitMessages = defineMessages("paymentSplit", {
  ru: {
    cash: "Наличные",
    card: "Карта",
    alif: "Alif Pay",
    eskhata: "Eskhata",
    payments: "Оплата",
    total: "К оплате",
    paid: "Оплачено",
    remaining: "Осталось",
    change: "Сдача",
    addMethod: "Добавить способ оплаты",
    fillRemaining: "Остаток",
    fillRemainingFor: (method: string) => `Остаток — ${method}`,
    removeMethod: (method: string) => `Удалить ${method}`,
    complete: "Завершить оплату",
    noPayments: "Выберите способ оплаты",
    fullyPaid: "Оплачено полностью",
    overpaidNonCash: "Безналичная оплата не может превышать сумму чека",
    statusRemaining: (amount: string) => `Осталось ${amount}`,
    statusChange: (amount: string) => `Сдача ${amount}`,
  },
  tg: {
    cash: "Нақд",
    card: "Корт",
    alif: "Alif Pay",
    eskhata: "Eskhata",
    payments: "Пардохт",
    total: "Барои пардохт",
    paid: "Пардохт шуд",
    remaining: "Боқимонда",
    change: "Бақия",
    addMethod: "Илова кардани усули пардохт",
    fillRemaining: "Боқимонда",
    fillRemainingFor: (method: string) => `Боқимонда — ${method}`,
    removeMethod: (method: string) => `Нест кардани ${method}`,
    complete: "Анҷоми пардохт",
    noPayments: "Усули пардохтро интихоб кунед",
    fullyPaid: "Пурра пардохт шуд",
    overpaidNonCash: "Пардохти ғайринақдӣ аз маблағи чек зиёд буда наметавонад",
    statusRemaining: (amount: string) => `Боқимонда ${amount}`,
    statusChange: (amount: string) => `Бақия ${amount}`,
  },
  en: {
    cash: "Cash",
    card: "Card",
    alif: "Alif Pay",
    eskhata: "Eskhata",
    payments: "Payment",
    total: "Amount due",
    paid: "Paid",
    remaining: "Remaining",
    change: "Change",
    addMethod: "Add payment method",
    fillRemaining: "Remainder",
    fillRemainingFor: (method: string) => `Remainder — ${method}`,
    removeMethod: (method: string) => `Remove ${method}`,
    complete: "Complete payment",
    noPayments: "Choose a payment method",
    fullyPaid: "Paid in full",
    overpaidNonCash: "Non-cash payments cannot exceed the receipt total",
    statusRemaining: (amount: string) => `Remaining ${amount}`,
    statusChange: (amount: string) => `Change ${amount}`,
  },
});

export type PaymentSplitLabels = (typeof paymentSplitMessages.locales)["ru"];

export interface PaymentMethod {
  id: string;
  label: string;
  icon?: React.ReactNode;
  /**
   * The method may take more than is due and give change (cash). Defaults to
   * `true` for `id === "cash"` and `false` otherwise.
   */
  allowChange?: boolean;
}

export interface PaymentEntry {
  method: string;
  amount: number;
}

export interface PaymentSplitResult {
  payments: PaymentEntry[];
  paid: number;
  change: number;
}

export interface PaymentTotals {
  paid: number;
  remaining: number;
  change: number;
  /** Non-cash methods together exceed the total. */
  nonCashOverpaid: boolean;
  /** Paid in full and valid — checkout may complete. */
  complete: boolean;
}

const allowsChange = (m: PaymentMethod | undefined, id: string) =>
  m?.allowChange ?? id === "cash";

/** Paid / remaining / change for a set of payments. Pure, for reuse in apps. */
export function computePaymentTotals(
  total: number,
  payments: PaymentEntry[],
  methods: PaymentMethod[] = [],
): PaymentTotals {
  const byId = new Map(methods.map((m) => [m.id, m]));
  let paid = 0;
  let nonCash = 0;
  for (const p of payments) {
    const amount = Number.isFinite(p.amount) ? Math.max(0, p.amount) : 0;
    paid += amount;
    if (!allowsChange(byId.get(p.method), p.method)) nonCash += amount;
  }
  paid = roundTo(paid, 2);
  nonCash = roundTo(nonCash, 2);
  const due = roundTo(Math.max(0, total), 2);
  const nonCashOverpaid = nonCash > due;
  const remaining = roundTo(Math.max(0, due - paid), 2);
  const change = nonCashOverpaid ? 0 : roundTo(Math.max(0, paid - due), 2);
  return {
    paid,
    remaining,
    change,
    nonCashOverpaid,
    complete: !nonCashOverpaid && paid >= due && payments.length > 0,
  };
}

const DEFAULT_ICONS: Record<string, LucideIcon> = {
  cash: Banknote,
  card: CreditCard,
  alif: Smartphone,
  eskhata: Landmark,
};

export type PaymentSplitProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange"
> & {
  /** Amount due. */
  total: number;
  /** Payment methods offered. Defaults to cash, card, Alif Pay, Eskhata. */
  methods?: PaymentMethod[];
  value?: PaymentEntry[];
  defaultValue?: PaymentEntry[];
  onValueChange?: (value: PaymentEntry[]) => void;
  /**
   * Pre-fill a newly added method with the remaining amount. Defaults to
   * `true`, so a single-method sale is one tap.
   */
  fillOnAdd?: boolean;
  /** Renders a "Завершить оплату" button, enabled once paid ≥ total. */
  onComplete?: (result: PaymentSplitResult) => void;
  /** Busy state for the complete button (e.g. waiting for the terminal). */
  completing?: boolean;
  disabled?: boolean;
  labels?: Partial<PaymentSplitLabels>;
};

function toInputText(amount: number, decimal: string): string {
  if (!amount) return "";
  return String(roundTo(amount, 2)).replace(".", decimal);
}

function currencySymbol(sample: string): string {
  return sample.replace(/[\d\s.,\u00a0\u202f\u2212-]+/g, "").trim();
}

/**
 * Split-payment editor for the POS: one row per payment method with an
 * amount, "Остаток" quick-fill, live paid / remaining / change totals and a
 * complete button. Only methods that allow change (cash) may exceed the total.
 */
export const PaymentSplit = React.forwardRef<HTMLDivElement, PaymentSplitProps>(
  (
    {
      className,
      total,
      methods: methodsProp,
      value,
      defaultValue,
      onValueChange,
      fillOnAdd = true,
      onComplete,
      completing = false,
      disabled = false,
      labels,
      ...props
    },
    ref,
  ) => {
    const t = useMessages(paymentSplitMessages, labels);
    const fmt = useFormat();
    const baseId = React.useId();

    const methods = React.useMemo<PaymentMethod[]>(
      () =>
        methodsProp ?? [
          { id: "cash", label: t.cash, allowChange: true },
          { id: "card", label: t.card },
          { id: "alif", label: t.alif },
          { id: "eskhata", label: t.eskhata },
        ],
      [methodsProp, t],
    );
    const byId = React.useMemo(
      () => new Map(methods.map((m) => [m.id, m])),
      [methods],
    );

    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState<PaymentEntry[]>(
      defaultValue ?? [],
    );
    const payments = isControlled ? value : internal;

    const setPayments = (next: PaymentEntry[]) => {
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    };

    const totals = computePaymentTotals(total, payments, methods);
    const symbol = currencySymbol(fmt.money(0));

    const used = new Set(payments.map((p) => p.method));
    const available = methods.filter((m) => !used.has(m.id));

    const add = (id: string) => {
      const amount = fillOnAdd ? totals.remaining : 0;
      setPayments([...payments, { method: id, amount }]);
      // Focus the new amount field once rendered, for typing the tendered sum.
      requestAnimationFrame(() => {
        const el = document.getElementById(`${baseId}-${id}`);
        if (el instanceof HTMLInputElement) {
          el.focus();
          el.select();
        }
      });
    };
    const update = (id: string, amount: number) =>
      setPayments(payments.map((p) => (p.method === id ? { ...p, amount } : p)));
    const remove = (id: string) =>
      setPayments(payments.filter((p) => p.method !== id));
    const fill = (id: string) => {
      const current = payments.find((p) => p.method === id)?.amount ?? 0;
      update(id, roundTo(Math.max(0, current) + totals.remaining, 2));
    };

    const status =
      payments.length === 0
        ? t.noPayments
        : totals.nonCashOverpaid
          ? t.overpaidNonCash
          : totals.remaining > 0
            ? t.statusRemaining(fmt.money(totals.remaining))
            : totals.change > 0
              ? `${t.fullyPaid}. ${t.statusChange(fmt.money(totals.change))}`
              : t.fullyPaid;

    const errorId = `${baseId}-error`;

    return (
      <div
        ref={ref}
        data-slot="payment-split"
        data-complete={totals.complete || undefined}
        className={cn("flex flex-col gap-4", className)}
        {...props}
      >
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-semibold text-ink-2 text-ui-control">{t.total}</span>
          <span className="font-bold text-ink-1 tabular-nums text-(length:--tj-fs-xl) leading-tight">
            {fmt.money(total)}
          </span>
        </div>

        {payments.length > 0 ? (
          <ul data-slot="payment-split-list" className="flex flex-col gap-2" aria-label={t.payments}>
            {payments.map((p) => {
              const method = byId.get(p.method);
              const label = method?.label ?? p.method;
              const Icon = DEFAULT_ICONS[p.method];
              const icon = method?.icon ?? (Icon ? <Icon aria-hidden /> : null);
              const invalid =
                totals.nonCashOverpaid && !allowsChange(method, p.method) && p.amount > 0;
              return (
                <li
                  key={p.method}
                  data-slot="payment-split-row"
                  data-method={p.method}
                  className="flex flex-wrap items-center gap-2 border border-hairline bg-ui-surface !rounded-xl p-2"
                >
                  <label
                    htmlFor={`${baseId}-${p.method}`}
                    className="flex min-w-28 flex-1 items-center gap-2 font-semibold text-ink-1 text-ui-body"
                  >
                    {icon ? (
                      <span
                        aria-hidden
                        className="inline-flex size-8 shrink-0 items-center justify-center !rounded-lg bg-mist text-mist-ink [&_svg]:size-4"
                      >
                        {icon}
                      </span>
                    ) : null}
                    {label}
                  </label>
                  <AmountInput
                    id={`${baseId}-${p.method}`}
                    amount={p.amount}
                    symbol={symbol}
                    disabled={disabled}
                    invalid={invalid}
                    describedBy={invalid ? errorId : undefined}
                    onAmountChange={(n) => update(p.method, n)}
                  />
                  {totals.remaining > 0 ? (
                    <Button
                      variant="outline"
                      size="md"
                      disabled={disabled}
                      aria-label={t.fillRemainingFor(label)}
                      onClick={() => fill(p.method)}
                    >
                      {t.fillRemaining}
                    </Button>
                  ) : null}
                  <button
                    type="button"
                    disabled={disabled}
                    aria-label={t.removeMethod(label)}
                    onClick={() => remove(p.method)}
                    className={cn(
                      "inline-flex size-control-md shrink-0 items-center justify-center !rounded-lg text-ink-3 cursor-pointer",
                      "transition-colors hover:bg-tj-error-bg hover:text-tj-error-ink disabled:pointer-events-none disabled:opacity-60",
                      focusRing,
                    )}
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}

        {available.length > 0 ? (
          <div role="group" aria-label={t.addMethod} className="flex flex-col gap-2">
            <span aria-hidden className="text-ink-3 text-ui-helper">
              {t.addMethod}
            </span>
            <div className="flex flex-wrap gap-2">
              {available.map((m) => {
                const Icon = DEFAULT_ICONS[m.id];
                return (
                  <Button
                    key={m.id}
                    variant="subtle"
                    size="lg"
                    disabled={disabled}
                    data-method={m.id}
                    iconLeft={
                      m.icon ? (
                        <span aria-hidden className="inline-flex [&_svg]:size-4">
                          {m.icon}
                        </span>
                      ) : Icon ? (
                        <Icon className="size-4" aria-hidden />
                      ) : (
                        <Plus className="size-4" aria-hidden />
                      )
                    }
                    onClick={() => add(m.id)}
                  >
                    {m.label}
                  </Button>
                );
              })}
            </div>
          </div>
        ) : null}

        <dl
          data-slot="payment-split-summary"
          className="flex flex-col gap-1.5 border-t border-hairline pt-3 text-ui-body"
        >
          <div className="flex items-baseline justify-between gap-3 text-ink-2">
            <dt>{t.paid}</dt>
            <dd className="tabular-nums">{fmt.money(totals.paid)}</dd>
          </div>
          <div
            data-slot="payment-split-remaining"
            className={cn(
              "flex items-baseline justify-between gap-3",
              totals.remaining > 0 ? "font-semibold text-tj-warning-ink" : "text-ink-3",
            )}
          >
            <dt>{t.remaining}</dt>
            <dd className="tabular-nums">{fmt.money(totals.remaining)}</dd>
          </div>
          {totals.change > 0 ? (
            <div
              data-slot="payment-split-change"
              className="flex items-baseline justify-between gap-3 font-bold text-tj-success-ink text-ui-title"
            >
              <dt>{t.change}</dt>
              <dd className="tabular-nums">{fmt.money(totals.change)}</dd>
            </div>
          ) : null}
        </dl>

        {totals.nonCashOverpaid ? (
          <p id={errorId} className="text-tj-error-ink text-ui-helper font-medium">
            {t.overpaidNonCash}
          </p>
        ) : null}

        <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {status}
        </p>

        {onComplete ? (
          <Button
            size="xl"
            className="w-full"
            disabled={disabled || !totals.complete}
            loading={completing}
            onClick={() =>
              onComplete({
                payments: payments.filter((p) => p.amount > 0),
                paid: totals.paid,
                change: totals.change,
              })
            }
          >
            {t.complete}
          </Button>
        ) : null}
      </div>
    );
  },
);
PaymentSplit.displayName = "PaymentSplit";

interface AmountInputProps {
  id: string;
  amount: number;
  symbol: string;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  onAmountChange: (amount: number) => void;
}

/** Decimal text input that accepts "," or "." and keeps the typed text. */
function AmountInput({
  id,
  amount,
  symbol,
  disabled,
  invalid,
  describedBy,
  onAmountChange,
}: AmountInputProps) {
  const fmt = useFormat();
  const [draft, setDraft] = React.useState(() =>
    toInputText(amount, fmt.decimalSeparator),
  );

  // Follow external changes (quick-fill, reset) without clobbering typing.
  React.useEffect(() => {
    setDraft((d) => {
      const parsed = parseNumber(d);
      const current = Number.isNaN(parsed) ? 0 : parsed;
      return roundTo(current, 2) === roundTo(amount, 2)
        ? d
        : toInputText(amount, fmt.decimalSeparator);
    });
  }, [amount, fmt.decimalSeparator]);

  return (
    <InputGroup size="lg" disabled={disabled} className="w-40 shrink-0">
      <InputGroupInput
        id={id}
        inputMode="decimal"
        autoComplete="off"
        placeholder="0"
        value={draft}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className="text-right tabular-nums font-semibold"
        onChange={(e) => {
          const raw = e.target.value;
          setDraft(raw);
          const parsed = parseNumber(raw);
          if (raw.trim() === "") onAmountChange(0);
          else if (!Number.isNaN(parsed)) onAmountChange(Math.max(0, roundTo(parsed, 2)));
        }}
        onBlur={() => {
          const parsed = parseNumber(draft);
          setDraft(toInputText(Number.isNaN(parsed) ? amount : parsed, fmt.decimalSeparator));
        }}
        onFocus={(e) => e.currentTarget.select()}
      />
      {symbol ? <InputGroupAddon aria-hidden>{symbol}</InputGroupAddon> : null}
    </InputGroup>
  );
}
