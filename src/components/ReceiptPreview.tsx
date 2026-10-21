import * as React from "react";

import { roundTo } from "../i18n/format";
import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import { useFormat, useMessages } from "./TajUIProvider";

export const receiptPreviewMessages = defineMessages("receiptPreview", {
  ru: {
    receipt: "Кассовый чек",
    receiptNo: (no: string) => `Чек № ${no}`,
    number: "Чек №",
    date: "Дата",
    cashier: "Кассир",
    shift: "Смена",
    inn: "ИНН",
    phone: "Тел.",
    subtotal: "Подытог",
    discount: "Скидка",
    lineDiscount: "скидка",
    tax: (rate: string) => (rate ? `НДС ${rate}%` : "НДС"),
    taxIncluded: (rate: string) => (rate ? `в т. ч. НДС ${rate}%` : "в т. ч. НДС"),
    total: "ИТОГО",
    change: "Сдача",
    footer: "Спасибо за покупку!",
  },
  tg: {
    receipt: "Чеки хазинавӣ",
    receiptNo: (no: string) => `Чек № ${no}`,
    number: "Чек №",
    date: "Сана",
    cashier: "Кассир",
    shift: "Баст",
    inn: "РМА",
    phone: "Тел.",
    subtotal: "Ҷамъи фаръӣ",
    discount: "Тахфиф",
    lineDiscount: "тахфиф",
    tax: (rate: string) => (rate ? `ААИ ${rate}%` : "ААИ"),
    taxIncluded: (rate: string) => (rate ? `аз ҷумла ААИ ${rate}%` : "аз ҷумла ААИ"),
    total: "ҲАМАГӢ",
    change: "Бақия",
    footer: "Ташаккур барои харид!",
  },
  en: {
    receipt: "Sales receipt",
    receiptNo: (no: string) => `Receipt No. ${no}`,
    number: "Receipt No.",
    date: "Date",
    cashier: "Cashier",
    shift: "Shift",
    inn: "TIN",
    phone: "Tel.",
    subtotal: "Subtotal",
    discount: "Discount",
    lineDiscount: "discount",
    tax: (rate: string) => (rate ? `VAT ${rate}%` : "VAT"),
    taxIncluded: (rate: string) => (rate ? `incl. VAT ${rate}%` : "incl. VAT"),
    total: "TOTAL",
    change: "Change",
    footer: "Thank you for your purchase!",
  },
});

export type ReceiptPreviewLabels = (typeof receiptPreviewMessages.locales)["ru"];

export interface ReceiptStore {
  name: string;
  address?: string;
  /** Taxpayer ID (ИНН / РМА). */
  inn?: string;
  phone?: string;
  /** Monochrome logo rendered above the name. */
  logo?: React.ReactNode;
}

export interface ReceiptMeta {
  number?: string;
  date?: Date | number | string;
  cashier?: string;
  shift?: string;
}

export interface ReceiptLine {
  name: string;
  quantity: number;
  price: number;
  unit?: string;
  /** Discount amount taken off this line. */
  discount?: number;
  /** Line total; defaults to quantity × price − discount. */
  total?: number;
}

export interface ReceiptPayment {
  /** Printed method name ("Наличные", "Alif Pay"). */
  label: string;
  amount: number;
}

export interface ReceiptTotals {
  /** Defaults to the sum of quantity × price. */
  subtotal?: number;
  /** Defaults to the sum of line discounts. */
  discount?: number;
  tax?: number;
  taxRate?: number;
  /** Prices include VAT ("в т. ч. НДС"). Defaults to true. */
  taxIncluded?: boolean;
  /** Defaults to subtotal − discount (+ tax when not included). */
  total?: number;
}

export type ReceiptWidth = "58mm" | "80mm";

export type ReceiptPreviewProps = Omit<React.HTMLAttributes<HTMLElement>, "children"> & {
  /** Paper roll width. Defaults to "80mm". */
  width?: ReceiptWidth;
  store: ReceiptStore;
  meta?: ReceiptMeta;
  lines: ReceiptLine[];
  totals?: ReceiptTotals;
  payments?: ReceiptPayment[];
  /** Change handed back; hidden when 0. */
  change?: number;
  /** Footer text. Defaults to "Спасибо за покупку!". */
  footer?: React.ReactNode;
  /** QR code slot (fiscal / Alif Pay link) — pass an <img> or <svg>. */
  qr?: React.ReactNode;
  /** Barcode slot (receipt number) — pass an <img> or <svg>. */
  barcode?: React.ReactNode;
  labels?: Partial<ReceiptPreviewLabels>;
};

// Paper is white and print is black in every theme, so the receipt uses the
// fixed palette tokens (not the theme-switching --ui-* ones).
const paperVars = {
  "--tj-receipt-bg": "var(--tj-white)",
  "--tj-receipt-ink": "var(--tj-ink)",
} as React.CSSProperties;

const lineTotalOf = (l: ReceiptLine) =>
  l.total ?? roundTo(l.quantity * l.price - (l.discount ?? 0), 2);

function Row({
  label,
  value,
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline justify-between gap-2", className)}>
      <dt className="min-w-0">{label}</dt>
      <dd className="shrink-0 text-right tabular-nums whitespace-nowrap">{value}</dd>
    </div>
  );
}

const rule = "my-1.5 border-t border-dashed border-(--tj-receipt-ink)";

/**
 * Thermal receipt preview (58 / 80 mm). Always black on white, monospace,
 * sized in millimetres; print it on its own with `printReceipt()`.
 */
export const ReceiptPreview = React.forwardRef<HTMLElement, ReceiptPreviewProps>(
  (
    {
      className,
      style,
      width = "80mm",
      store,
      meta,
      lines,
      totals,
      payments,
      change,
      footer,
      qr,
      barcode,
      labels,
      ...props
    },
    ref,
  ) => {
    const t = useMessages(receiptPreviewMessages, labels);
    const fmt = useFormat();
    const money = (n: number) => fmt.money(n);

    const subtotal =
      totals?.subtotal ?? roundTo(lines.reduce((s, l) => s + l.quantity * l.price, 0), 2);
    const discount =
      totals?.discount ?? roundTo(lines.reduce((s, l) => s + (l.discount ?? 0), 0), 2);
    const taxIncluded = totals?.taxIncluded ?? true;
    const tax = totals?.tax;
    const total =
      totals?.total ??
      roundTo(subtotal - discount + (tax !== undefined && !taxIncluded ? tax : 0), 2);
    const rate = totals?.taxRate !== undefined ? fmt.number(totals.taxRate) : "";

    const dateText =
      meta?.date !== undefined
        ? fmt.date(meta.date, {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : undefined;

    const narrow = width === "58mm";

    return (
      <article
        ref={ref}
        data-slot="receipt-preview"
        data-width={width}
        aria-label={meta?.number ? t.receiptNo(meta.number) : t.receipt}
        style={{ ...paperVars, width, ...style }}
        className={cn(
          "box-border max-w-full bg-(--tj-receipt-bg) text-(--tj-receipt-ink) font-mono leading-snug shadow-tj-md",
          "[print-color-adjust:exact]",
          narrow ? "px-[3mm] py-[4mm] text-ui-micro" : "px-[4mm] py-[5mm] text-ui-caption",
          className,
        )}
        {...props}
      >
        <header data-slot="receipt-preview-header" className="flex flex-col items-center gap-0.5 text-center">
          {store.logo ? <div className="mb-1">{store.logo}</div> : null}
          <div className="font-bold uppercase text-ui-label">{store.name}</div>
          {store.address ? <div>{store.address}</div> : null}
          {store.inn ? (
            <div>
              {t.inn}: {store.inn}
            </div>
          ) : null}
          {store.phone ? (
            <div>
              {t.phone} {store.phone}
            </div>
          ) : null}
        </header>

        {meta ? (
          <>
            <hr className={rule} />
            <dl data-slot="receipt-preview-meta">
              {meta.number ? <Row label={t.number} value={meta.number} /> : null}
              {dateText ? <Row label={t.date} value={dateText} /> : null}
              {meta.cashier ? <Row label={t.cashier} value={meta.cashier} /> : null}
              {meta.shift ? <Row label={t.shift} value={meta.shift} /> : null}
            </dl>
          </>
        ) : null}

        <hr className={rule} />
        <ul data-slot="receipt-preview-lines" className="flex flex-col gap-1">
          {lines.map((l, i) => (
            <li key={i}>
              <div className="break-words">{l.name}</div>
              <div className="flex items-baseline justify-between gap-2 tabular-nums">
                <span>
                  {fmt.number(l.quantity)}
                  {l.unit ? ` ${l.unit}` : ""} × {money(l.price)}
                </span>
                <span className="whitespace-nowrap">{money(lineTotalOf(l))}</span>
              </div>
              {l.discount ? (
                <div className="flex justify-between gap-2 tabular-nums">
                  <span>{t.lineDiscount}</span>
                  <span className="whitespace-nowrap">−{money(l.discount)}</span>
                </div>
              ) : null}
            </li>
          ))}
        </ul>

        <hr className={rule} />
        <dl data-slot="receipt-preview-totals">
          <Row label={t.subtotal} value={money(subtotal)} />
          {discount ? <Row label={t.discount} value={`−${money(discount)}`} /> : null}
          {tax !== undefined ? (
            <Row label={taxIncluded ? t.taxIncluded(rate) : t.tax(rate)} value={money(tax)} />
          ) : null}
          <Row
            label={t.total}
            value={money(total)}
            className={cn("mt-1 font-bold", narrow ? "text-ui-label" : "text-ui-title")}
          />
        </dl>

        {payments && payments.length > 0 ? (
          <>
            <hr className={rule} />
            <dl data-slot="receipt-preview-payments">
              {payments.map((p, i) => (
                <Row key={i} label={p.label} value={money(p.amount)} />
              ))}
              {change ? <Row label={t.change} value={money(change)} className="font-bold" /> : null}
            </dl>
          </>
        ) : null}

        {qr || barcode ? (
          <div data-slot="receipt-preview-codes" className="mt-2 flex flex-col items-center gap-2">
            {qr ? <div className="[&_img]:size-[28mm] [&_svg]:size-[28mm]">{qr}</div> : null}
            {barcode ? <div className="max-w-full [&_img]:max-w-full [&_svg]:max-w-full">{barcode}</div> : null}
          </div>
        ) : null}

        <hr className={rule} />
        <footer data-slot="receipt-preview-footer" className="text-center font-bold">
          {footer ?? t.footer}
        </footer>
      </article>
    );
  },
);
ReceiptPreview.displayName = "ReceiptPreview";

// ─── Printing ───────────────────────────────────────────────────────

const PRINT_CLASS = "tj-printing-receipt";
const PRINT_STYLE_ID = "tj-receipt-print-style";

const PRINT_CSS = `
@media print {
  @page { margin: 0; }
  html.${PRINT_CLASS}, html.${PRINT_CLASS} body { background: var(--tj-white) !important; }
  html.${PRINT_CLASS} body * { visibility: hidden !important; }
  html.${PRINT_CLASS} [data-slot="receipt-preview"][data-print-target],
  html.${PRINT_CLASS} [data-slot="receipt-preview"][data-print-target] * { visibility: visible !important; }
  html.${PRINT_CLASS} [data-slot="receipt-preview"][data-print-target] {
    position: absolute !important; left: 0 !important; top: 0 !important;
    margin: 0 !important; box-shadow: none !important;
  }
}`;

/**
 * Print a receipt on its own: every other element is hidden by a print-only
 * rule while `<html>` carries the `tj-printing-receipt` class. Pass the
 * receipt element (e.g. a ReceiptPreview ref); defaults to the first
 * `[data-slot=receipt-preview]` on the page. Returns false when there is
 * nothing to print.
 */
export function printReceipt(target?: HTMLElement | null): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  const el =
    target ?? document.querySelector<HTMLElement>('[data-slot="receipt-preview"]');
  if (!el) return false;

  let style = document.getElementById(PRINT_STYLE_ID);
  if (!style) {
    style = document.createElement("style");
    style.id = PRINT_STYLE_ID;
    style.textContent = PRINT_CSS;
    document.head.appendChild(style);
  }

  const root = document.documentElement;
  root.classList.add(PRINT_CLASS);
  el.setAttribute("data-print-target", "");

  let done = false;
  const cleanup = () => {
    if (done) return;
    done = true;
    root.classList.remove(PRINT_CLASS);
    el.removeAttribute("data-print-target");
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);

  try {
    window.print();
  } catch {
    cleanup();
  }
  return true;
}
