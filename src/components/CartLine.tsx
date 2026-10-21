import { Trash2 } from "lucide-react";
import * as React from "react";

import { roundTo } from "../i18n/format";
import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import { focusRing } from "../lib/control";
import { Badge } from "./Badge";
import { NumberField } from "./NumberField";
import { useFormat, useMessages } from "./TajUIProvider";

export const cartLineMessages = defineMessages("cartLine", {
  ru: {
    quantity: (name: string) => `Количество: ${name}`,
    remove: (name: string) => `Удалить ${name}`,
    unitPrice: "Цена",
    lineTotal: "Сумма",
    oldPrice: "Без скидки",
    discount: "Скидка",
    note: "Примечание",
  },
  tg: {
    quantity: (name: string) => `Миқдор: ${name}`,
    remove: (name: string) => `Нест кардани ${name}`,
    unitPrice: "Нарх",
    lineTotal: "Маблағ",
    oldPrice: "Бе тахфиф",
    discount: "Тахфиф",
    note: "Эзоҳ",
  },
  en: {
    quantity: (name: string) => `Quantity: ${name}`,
    remove: (name: string) => `Remove ${name}`,
    unitPrice: "Price",
    lineTotal: "Total",
    oldPrice: "Before discount",
    discount: "Discount",
    note: "Note",
  },
});

export type CartLineLabels = (typeof cartLineMessages.locales)["ru"];

/** A line discount: a fixed amount off the line total, or a percentage. */
export type CartLineDiscount =
  | { type: "percent"; value: number }
  | { type: "amount"; value: number };

/** Line total after discount, rounded to 2 decimals. */
export function cartLineTotal(
  price: number,
  quantity: number,
  discount?: CartLineDiscount,
): number {
  const gross = price * quantity;
  if (!discount || !discount.value) return roundTo(gross, 2);
  const off =
    discount.type === "percent"
      ? (gross * Math.min(100, Math.max(0, discount.value))) / 100
      : Math.min(gross, Math.max(0, discount.value));
  return roundTo(gross - off, 2);
}

export type CartLineProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  name: string;
  /** Unit price before discount. */
  price: number;
  quantity: number;
  /** Unit of measure shown after the quantity ("шт", "кг"). */
  unit?: string;
  /** Quantity step — 1 for pieces, 0.1 / 0.001 for weighed goods. */
  step?: number;
  /** Upper quantity bound (e.g. stock on hand). */
  max?: number;
  discount?: CartLineDiscount;
  /** Free-text note under the name (modifiers, serial number, …). */
  note?: React.ReactNode;
  /** Optional leading media (thumbnail). */
  media?: React.ReactNode;
  onQuantityChange?: (quantity: number) => void;
  onRemove?: () => void;
  /**
   * Allow the stepper to go down to 0, which calls `onRemove`. By default the
   * minimum quantity is 1 and lines are removed with the trash button.
   */
  removeAtZero?: boolean;
  /** Receipt mode: no stepper and no remove button. */
  readOnly?: boolean;
  labels?: Partial<CartLineLabels>;
};

/** One row of the POS cart: name, unit price, quantity stepper and line total. */
export const CartLine = React.forwardRef<HTMLDivElement, CartLineProps>(
  (
    {
      className,
      name,
      price,
      quantity,
      unit,
      step = 1,
      max,
      discount,
      note,
      media,
      onQuantityChange,
      onRemove,
      removeAtZero = false,
      readOnly = false,
      labels,
      ...props
    },
    ref,
  ) => {
    const t = useMessages(cartLineMessages, labels);
    const fmt = useFormat();

    const gross = roundTo(price * quantity, 2);
    const total = cartLineTotal(price, quantity, discount);
    const discounted = !!discount?.value && total < gross;
    const discountText = discounted
      ? discount!.type === "percent"
        ? `−${fmt.number(discount!.value)}%`
        : `−${fmt.money(roundTo(gross - total, 2))}`
      : null;

    const qtyText = `${fmt.number(quantity)}${unit ? ` ${unit}` : ""}`;

    const inputRef = React.useRef<HTMLInputElement>(null);
    // A "0" typed on the way to "0,5" must not drop the line: typed zeros
    // are only acted on when the field loses focus. Stepper presses act now.
    const pendingZero = React.useRef(false);

    const handleQty = (q: number) => {
      if (Number.isNaN(q)) return;
      if (q <= 0) {
        if (!removeAtZero) return;
        if (inputRef.current && document.activeElement === inputRef.current) {
          pendingZero.current = true;
          return;
        }
        pendingZero.current = false;
        onRemove?.();
        return;
      }
      pendingZero.current = false;
      onQuantityChange?.(q);
    };

    return (
      <div
        ref={ref}
        data-slot="cart-line"
        data-readonly={readOnly || undefined}
        className={cn("flex items-start gap-3 py-2", className)}
        {...props}
      >
        {media ? (
          <div data-slot="cart-line-media" className="shrink-0">
            {media}
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-start gap-2">
            <span
              data-slot="cart-line-name"
              className="min-w-0 flex-1 font-semibold text-ink-1 text-ui-body leading-snug line-clamp-2"
            >
              {name}
            </span>
            {discountText ? (
              <Badge tone="success" size="sm" className="shrink-0 normal-case tracking-normal">
                <span className="sr-only">{t.discount} </span>
                {discountText}
              </Badge>
            ) : null}
          </div>

          <div className="text-ink-3 text-ui-helper tabular-nums">
            <span className="sr-only">{t.unitPrice}: </span>
            {readOnly ? `${qtyText} × ` : null}
            {fmt.money(price)}
            {unit && !readOnly ? ` / ${unit}` : null}
          </div>

          {note ? (
            <div data-slot="cart-line-note" className="text-ink-3 text-ui-helper italic">
              <span className="sr-only">{t.note}: </span>
              {note}
            </div>
          ) : null}

          {!readOnly ? (
            <div className="mt-1.5 flex items-center gap-2">
              <NumberField
                value={quantity}
                min={removeAtZero ? 0 : step < 1 ? step : 1}
                max={max}
                step={step}
                suffix={unit}
                ref={inputRef}
                aria-label={t.quantity(name)}
                onValueChange={handleQty}
                onBlur={() => {
                  if (pendingZero.current) {
                    pendingZero.current = false;
                    onRemove?.();
                  }
                }}
                className="w-36"
              />
              {onRemove ? (
                <button
                  type="button"
                  data-slot="cart-line-remove"
                  aria-label={t.remove(name)}
                  onClick={onRemove}
                  className={cn(
                    "inline-flex size-control-md shrink-0 items-center justify-center !rounded-lg text-ink-3 cursor-pointer",
                    "transition-colors hover:bg-tj-error-bg hover:text-tj-error-ink",
                    focusRing,
                  )}
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        <div data-slot="cart-line-total" className="flex shrink-0 flex-col items-end text-right">
          <span className="font-bold text-ink-1 text-ui-control tabular-nums whitespace-nowrap">
            <span className="sr-only">{t.lineTotal}: </span>
            {fmt.money(total)}
          </span>
          {discounted ? (
            <s className="text-ink-3 text-ui-helper tabular-nums whitespace-nowrap">
              <span className="sr-only">{t.oldPrice}: </span>
              {fmt.money(gross)}
            </s>
          ) : null}
        </div>
      </div>
    );
  },
);
CartLine.displayName = "CartLine";

// ─── CartSummary ────────────────────────────────────────────────────

export const cartSummaryMessages = defineMessages("cartSummary", {
  ru: {
    subtotal: "Подытог",
    discount: "Скидка",
    tax: (rate: string) => (rate ? `НДС ${rate}%` : "НДС"),
    taxIncluded: (rate: string) => (rate ? `в т. ч. НДС ${rate}%` : "в т. ч. НДС"),
    total: "Итого",
    items: "Позиций",
  },
  tg: {
    subtotal: "Ҷамъи фаръӣ",
    discount: "Тахфиф",
    tax: (rate: string) => (rate ? `ААИ ${rate}%` : "ААИ"),
    taxIncluded: (rate: string) => (rate ? `аз ҷумла ААИ ${rate}%` : "аз ҷумла ААИ"),
    total: "Ҳамагӣ",
    items: "Мавқеъҳо",
  },
  en: {
    subtotal: "Subtotal",
    discount: "Discount",
    tax: (rate: string) => (rate ? `VAT ${rate}%` : "VAT"),
    taxIncluded: (rate: string) => (rate ? `incl. VAT ${rate}%` : "incl. VAT"),
    total: "Total",
    items: "Items",
  },
});

export type CartSummaryLabels = (typeof cartSummaryMessages.locales)["ru"];

export type CartSummaryProps = Omit<React.HTMLAttributes<HTMLDListElement>, "children"> & {
  subtotal: number;
  /** Total discount amount (positive number); hidden when 0 or omitted. */
  discount?: number;
  /** VAT amount; hidden when omitted. */
  tax?: number;
  /** VAT rate in percent, shown in the label ("НДС 15%"). */
  taxRate?: number;
  /** VAT is already included in prices (shown as "в т. ч. НДС"). */
  taxIncluded?: boolean;
  total: number;
  /** Number of items, shown above the totals. */
  itemCount?: number;
  labels?: Partial<CartSummaryLabels>;
};

/** Cart totals: subtotal, discount, VAT and a large grand total. */
export const CartSummary = React.forwardRef<HTMLDListElement, CartSummaryProps>(
  (
    {
      className,
      subtotal,
      discount,
      tax,
      taxRate,
      taxIncluded = false,
      total,
      itemCount,
      labels,
      ...props
    },
    ref,
  ) => {
    const t = useMessages(cartSummaryMessages, labels);
    const fmt = useFormat();
    const rate = taxRate !== undefined ? fmt.number(taxRate) : "";
    const row = "flex items-baseline justify-between gap-3 text-ink-2 text-ui-body";
    const value = "tabular-nums whitespace-nowrap";

    return (
      <dl
        ref={ref}
        data-slot="cart-summary"
        className={cn("flex flex-col gap-1.5", className)}
        {...props}
      >
        {itemCount !== undefined ? (
          <div className={cn(row, "text-ink-3 text-ui-helper")}>
            <dt>{t.items}</dt>
            <dd className="tabular-nums">{fmt.number(itemCount)}</dd>
          </div>
        ) : null}
        <div className={row}>
          <dt>{t.subtotal}</dt>
          <dd className={value}>{fmt.money(subtotal)}</dd>
        </div>
        {discount ? (
          <div className={cn(row, "text-tj-success-ink")}>
            <dt>{t.discount}</dt>
            <dd className={value}>−{fmt.money(Math.abs(discount))}</dd>
          </div>
        ) : null}
        {tax !== undefined ? (
          <div className={row}>
            <dt>{taxIncluded ? t.taxIncluded(rate) : t.tax(rate)}</dt>
            <dd className={value}>{fmt.money(tax)}</dd>
          </div>
        ) : null}
        <div
          data-slot="cart-summary-total"
          className="mt-1.5 flex items-baseline justify-between gap-3 border-t border-hairline pt-2.5"
        >
          <dt className="font-semibold text-ink-2 text-ui-control">{t.total}</dt>
          <dd
            className={cn(
              value,
              "font-bold text-ink-1 text-(length:--tj-fs-xl) leading-tight",
            )}
          >
            {fmt.money(total)}
          </dd>
        </div>
      </dl>
    );
  },
);
CartSummary.displayName = "CartSummary";
