import * as React from "react";

import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import { focusRing } from "../lib/control";
import { Badge } from "./Badge";
import { useFormat, useMessages } from "./TajUIProvider";

export const productTileMessages = defineMessages("productTile", {
  ru: {
    pcs: "шт",
    lowStock: "Мало",
    outOfStock: "Нет в наличии",
    stock: (qty: string, unit: string) => `${qty} ${unit}`,
    inStock: (qty: string, unit: string) => `В наличии: ${qty} ${unit}`,
    inCart: (qty: string) => `В корзине: ${qty}`,
    sku: "Арт.",
  },
  tg: {
    pcs: "дона",
    lowStock: "Кам",
    outOfStock: "Дар анбор нест",
    stock: (qty: string, unit: string) => `${qty} ${unit}`,
    inStock: (qty: string, unit: string) => `Дар анбор: ${qty} ${unit}`,
    inCart: (qty: string) => `Дар сабад: ${qty}`,
    sku: "Арт.",
  },
  en: {
    pcs: "pcs",
    lowStock: "Low",
    outOfStock: "Out of stock",
    stock: (qty: string, unit: string) => `${qty} ${unit}`,
    inStock: (qty: string, unit: string) => `In stock: ${qty} ${unit}`,
    inCart: (qty: string) => `In cart: ${qty}`,
    sku: "SKU",
  },
});

export type ProductTileLabels = (typeof productTileMessages.locales)["ru"];

export type ProductTileProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "onClick"
> & {
  /** Product name; clamped to two lines. */
  name: string;
  /** Unit price, formatted with `useFormat().money`. */
  price: number;
  /** Product photo URL. A lettered placeholder is shown when missing. */
  image?: string;
  /** Article / SKU shown under the name. */
  sku?: string;
  /** Unit of measure ("шт", "кг"). Defaults to the localized "pcs". */
  unit?: string;
  /** Stock on hand. Omit to hide stock information. */
  stock?: number;
  /** At or below this quantity the tile shows a "Мало" badge. Defaults to 5. */
  lowStockThreshold?: number;
  /** Quantity already in the cart; shows a counter badge when > 0. */
  inCart?: number;
  /** Fires when the tile is pressed. */
  onAdd?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** `sm` for dense grids on phones; `md` (default) for tablets. */
  size?: "sm" | "md";
  labels?: Partial<ProductTileLabels>;
};

function initials(name: string): string {
  const words = name
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  const letters = words.slice(0, 2).map((w) => w[0]);
  return (letters.join("") || "?").toUpperCase();
}

/**
 * Product card for the POS grid. The whole tile is one button that adds the
 * product to the cart; out-of-stock products are disabled.
 */
export const ProductTile = React.forwardRef<HTMLButtonElement, ProductTileProps>(
  (
    {
      className,
      name,
      price,
      image,
      sku,
      unit,
      stock,
      lowStockThreshold = 5,
      inCart = 0,
      onAdd,
      size = "md",
      disabled,
      labels,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const t = useMessages(productTileMessages, labels);
    const fmt = useFormat();
    const [imageFailed, setImageFailed] = React.useState(false);
    React.useEffect(() => setImageFailed(false), [image]);

    const unitLabel = unit ?? t.pcs;
    const hasStock = stock !== undefined && Number.isFinite(stock);
    const outOfStock = hasStock && (stock as number) <= 0;
    const lowStock = hasStock && !outOfStock && (stock as number) <= lowStockThreshold;
    const stockQty = hasStock ? fmt.number(stock as number) : "";
    const isDisabled = disabled || outOfStock;
    const showImage = image && !imageFailed;
    const sm = size === "sm";

    return (
      <button
        ref={ref}
        type={type}
        data-slot="product-tile"
        data-size={size}
        data-stock={outOfStock ? "out" : lowStock ? "low" : hasStock ? "in" : undefined}
        disabled={isDisabled}
        onClick={onAdd}
        className={cn(
          "group relative flex w-full flex-col items-stretch overflow-hidden text-left",
          "border border-hairline bg-ui-surface !rounded-xl text-ink-1 shadow-tj-card",
          "cursor-pointer select-none touch-manipulation",
          "transition-[translate,scale,border-color,box-shadow] duration-150 ease-tj-out",
          "hover:border-brand/40 hover:shadow-tj-md motion-safe:active:scale-[0.98]",
          "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-hairline disabled:hover:shadow-tj-card",
          focusRing,
          "focus-visible:ring-offset-1 focus-visible:ring-offset-ui-surface",
          sm ? "min-h-24 p-2 gap-1.5" : "min-h-32 p-2.5 gap-2",
          className,
        )}
        {...props}
      >
        <span
          data-slot="product-tile-media"
          aria-hidden
          className={cn(
            "relative block w-full overflow-hidden !rounded-lg bg-mist",
            sm ? "aspect-[4/3]" : "aspect-square",
          )}
        >
          {showImage ? (
            <img
              src={image}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
              onError={() => setImageFailed(true)}
              className={cn(
                "size-full object-cover transition-transform duration-200",
                !isDisabled && "motion-safe:group-hover:scale-[1.03]",
              )}
            />
          ) : (
            <span
              data-slot="product-tile-placeholder"
              className={cn(
                "grid size-full place-items-center font-bold text-mist-ink",
                sm ? "text-ui-title" : "text-(length:--tj-fs-lg)",
              )}
            >
              {initials(name)}
            </span>
          )}
        </span>

        <span data-slot="product-tile-body" className="flex flex-1 flex-col gap-0.5 min-w-0">
          <span
            data-slot="product-tile-name"
            className={cn(
              "line-clamp-2 font-semibold leading-snug text-ink-1",
              sm ? "text-ui-label" : "text-ui-body",
            )}
          >
            {name}
          </span>
          {sku ? (
            <span className="truncate text-ui-caption text-ink-3">
              {t.sku} {sku}
            </span>
          ) : null}

          <span className="mt-auto flex flex-wrap items-end justify-between gap-x-2 gap-y-1 pt-1">
            <span
              data-slot="product-tile-price"
              className={cn(
                "font-bold text-brand-ink tabular-nums whitespace-nowrap",
                sm ? "text-ui-label" : "text-ui-title",
              )}
            >
              {fmt.money(price)}
              {unit ? (
                <span className="font-medium text-ink-3 text-ui-caption">
                  {" / "}
                  {unit}
                </span>
              ) : null}
            </span>

            {outOfStock ? (
              <Badge tone="error" size="sm" data-slot="product-tile-stock">
                {t.outOfStock}
              </Badge>
            ) : lowStock ? (
              <span className="inline-flex items-center gap-1" data-slot="product-tile-stock">
                <Badge tone="warning" size="sm">
                  {t.lowStock}
                </Badge>
                <span className="text-ui-caption text-tj-warning-ink tabular-nums">
                  {t.stock(stockQty, unitLabel)}
                </span>
              </span>
            ) : hasStock ? (
              <span
                data-slot="product-tile-stock"
                className="text-ui-caption text-ink-3 tabular-nums"
              >
                <span className="sr-only">{t.inStock(stockQty, unitLabel)}</span>
                <span aria-hidden>{t.stock(stockQty, unitLabel)}</span>
              </span>
            ) : null}
          </span>
        </span>

        {inCart > 0 ? (
          <span
            data-slot="product-tile-in-cart"
            className={cn(
              "absolute top-1.5 right-1.5 inline-flex min-w-6 h-6 items-center justify-center px-1.5",
              "!rounded-pill bg-brand-solid text-on-brand text-ui-label font-bold tabular-nums shadow-tj-sm",
            )}
          >
            <span className="sr-only">{t.inCart(fmt.number(inCart))}</span>
            <span aria-hidden>{fmt.number(inCart)}</span>
          </span>
        ) : null}
      </button>
    );
  },
);
ProductTile.displayName = "ProductTile";
