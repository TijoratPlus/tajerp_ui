import { Check, Copy } from "lucide-react";
import * as React from "react";

import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import { focusRing } from "../lib/control";
import { useMessages } from "./TajUIProvider";

export const descriptionListMessages = defineMessages("descriptionList", {
  ru: {
    copy: "Копировать",
    copyTerm: (term: string) => `Копировать: ${term}`,
    copied: "Скопировано",
    copyFailed: "Не удалось скопировать",
  },
  tg: {
    copy: "Нусха бардоштан",
    copyTerm: (term: string) => `Нусха бардоштан: ${term}`,
    copied: "Нусха бардошта шуд",
    copyFailed: "Нусха бардоштан муяссар нашуд",
  },
  en: {
    copy: "Copy",
    copyTerm: (term: string) => `Copy ${term}`,
    copied: "Copied",
    copyFailed: "Could not copy",
  },
});

export type DescriptionListMessages =
  (typeof descriptionListMessages.locales)["ru"];

export type DescriptionListLayout = "stacked" | "inline" | "grid";

interface DescriptionListContextValue {
  layout: DescriptionListLayout;
  dense: boolean;
  labels?: Partial<DescriptionListMessages>;
}

const DescriptionListContext = React.createContext<DescriptionListContextValue>(
  {
    layout: "inline",
    dense: false,
  },
);

const ItemContext = React.createContext<{ term?: string }>({});

export interface DescriptionListItemData {
  /** React key; defaults to the index. */
  id?: string;
  term: React.ReactNode;
  description: React.ReactNode;
  /**
   * Show a copy button. `true` copies the description's text; a string
   * copies that exact value (e.g. an unformatted ИНН or IBAN).
   */
  copyable?: boolean | string;
  /** Helper text under the value. */
  hint?: React.ReactNode;
}

export interface DescriptionListProps extends React.HTMLAttributes<HTMLDListElement> {
  /** Data form. Alternatively compose `DescriptionItem` children. */
  items?: DescriptionListItemData[];
  /**
   * `inline` — term and value side by side with row dividers (document
   * cards; stacks on phones). `stacked` — term above value. `grid` — stacked
   * items in 1–3 columns.
   */
  layout?: DescriptionListLayout;
  /** Columns for `layout="grid"` (collapses to 1 on phones). */
  columns?: 1 | 2 | 3;
  /** Tighter spacing for side panels and popovers. */
  dense?: boolean;
  labels?: Partial<DescriptionListMessages>;
}

const gridColumns: Record<1 | 2 | 3, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
};

/**
 * Key/value pairs for document, customer and supplier cards: ИНН, phone,
 * address, payment terms. Renders a semantic `<dl>`.
 */
export const DescriptionList = React.forwardRef<
  HTMLDListElement,
  DescriptionListProps
>(
  (
    {
      className,
      items,
      layout = "inline",
      columns = 2,
      dense = false,
      labels,
      children,
      ...props
    },
    ref,
  ) => {
    const ctx = React.useMemo(
      () => ({ layout, dense, labels }),
      [layout, dense, labels],
    );
    return (
      <DescriptionListContext.Provider value={ctx}>
        <dl
          ref={ref}
          data-slot="description-list"
          data-layout={layout}
          className={cn(
            "w-full text-ui-body",
            layout === "grid" &&
              cn(
                "grid",
                gridColumns[columns],
                dense ? "gap-x-4 gap-y-2" : "gap-x-6 gap-y-4",
              ),
            layout === "stacked" &&
              cn("flex flex-col", dense ? "gap-2" : "gap-3.5"),
            layout === "inline" && "flex flex-col",
            className,
          )}
          {...props}
        >
          {items
            ? items.map((item, i) => (
                <DescriptionItem key={item.id ?? i}>
                  <DescriptionTerm>{item.term}</DescriptionTerm>
                  <DescriptionDetails copyable={item.copyable} hint={item.hint}>
                    {item.description}
                  </DescriptionDetails>
                </DescriptionItem>
              ))
            : children}
        </dl>
      </DescriptionListContext.Provider>
    );
  },
);
DescriptionList.displayName = "DescriptionList";

export type DescriptionItemProps = React.HTMLAttributes<HTMLDivElement>;

/** One term + details pair (a `<div>` grouping inside the `<dl>`). */
export const DescriptionItem = React.forwardRef<
  HTMLDivElement,
  DescriptionItemProps
>(({ className, children, ...props }, ref) => {
  const { layout, dense } = React.useContext(DescriptionListContext);
  // The term's plain text names the copy button ("Копировать: ИНН").
  const term = React.useMemo(() => {
    let text: string | undefined;
    React.Children.forEach(children, (child) => {
      if (
        text === undefined &&
        React.isValidElement<{ children?: React.ReactNode }>(child) &&
        child.type === DescriptionTerm
      ) {
        const c = child.props.children;
        if (typeof c === "string" || typeof c === "number") text = String(c);
      }
    });
    return text;
  }, [children]);

  return (
    <ItemContext.Provider value={{ term }}>
      <div
        ref={ref}
        data-slot="description-item"
        className={cn(
          "min-w-0",
          layout === "inline"
            ? cn(
                "flex flex-col gap-0.5 border-b border-hairline last:border-b-0 sm:grid sm:grid-cols-[minmax(7rem,2fr)_5fr] sm:gap-4",
                dense ? "py-1.5" : "py-2.5",
              )
            : "flex flex-col gap-0.5",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </ItemContext.Provider>
  );
});
DescriptionItem.displayName = "DescriptionItem";

export type DescriptionTermProps = React.HTMLAttributes<HTMLElement>;

export const DescriptionTerm = React.forwardRef<
  HTMLElement,
  DescriptionTermProps
>(({ className, ...props }, ref) => {
  const { dense } = React.useContext(DescriptionListContext);
  return (
    <dt
      ref={ref}
      data-slot="description-term"
      className={cn(
        "min-w-0 text-ink-3",
        dense ? "text-ui-helper" : "text-ui-label",
        className,
      )}
      {...props}
    />
  );
});
DescriptionTerm.displayName = "DescriptionTerm";

export interface DescriptionDetailsProps extends React.HTMLAttributes<HTMLElement> {
  /** `true` copies the text content; a string copies that value. */
  copyable?: boolean | string;
  /** Helper text under the value. */
  hint?: React.ReactNode;
  /** Called after a successful copy. */
  onCopy?: () => void;
}

export const DescriptionDetails = React.forwardRef<
  HTMLElement,
  DescriptionDetailsProps
>(({ className, copyable, hint, children, onCopy, ...props }, ref) => {
  const { dense, labels } = React.useContext(DescriptionListContext);
  const { term } = React.useContext(ItemContext);
  const valueRef = React.useRef<HTMLSpanElement>(null);

  return (
    <dd
      ref={ref}
      data-slot="description-details"
      className={cn(
        "m-0 min-w-0 text-ink-1 break-words",
        dense ? "text-ui-label" : "text-ui-body",
        className,
      )}
      {...props}
    >
      <span className="flex min-w-0 items-start gap-1.5">
        <span ref={valueRef} data-slot="description-value" className="min-w-0">
          {children}
        </span>
        {copyable ? (
          <CopyButton
            getValue={() =>
              typeof copyable === "string"
                ? copyable
                : (valueRef.current?.textContent ?? "").trim()
            }
            term={term}
            labels={labels}
            onCopied={onCopy}
          />
        ) : null}
      </span>
      {hint ? (
        <span
          data-slot="description-hint"
          className="mt-0.5 block text-ui-helper text-ink-3"
        >
          {hint}
        </span>
      ) : null}
    </dd>
  );
});
DescriptionDetails.displayName = "DescriptionDetails";

function CopyButton({
  getValue,
  term,
  labels,
  onCopied,
}: {
  getValue: () => string;
  term?: string;
  labels?: Partial<DescriptionListMessages>;
  onCopied?: () => void;
}) {
  const t = useMessages(descriptionListMessages, labels);
  const [state, setState] = React.useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  React.useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    clearTimeout(timer.current);
    try {
      if (!navigator.clipboard?.writeText)
        throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(getValue());
      setState("copied");
      onCopied?.();
    } catch {
      setState("failed");
    }
    timer.current = setTimeout(() => setState("idle"), 2000);
  };

  return (
    <span className="inline-flex shrink-0 items-center gap-1">
      <button
        type="button"
        data-slot="description-copy"
        aria-label={term ? t.copyTerm(term) : t.copy}
        onClick={copy}
        className={cn(
          "-my-0.5 inline-flex size-6 cursor-pointer items-center justify-center !rounded-md text-ink-3 transition-colors hover:bg-ui-surface-2 hover:text-ink-1 [[data-density=touch]_&]:size-11",
          focusRing,
        )}
      >
        {state === "copied" ? (
          <Check className="size-3.5 text-tj-success-ink" aria-hidden />
        ) : (
          <Copy className="size-3.5" aria-hidden />
        )}
      </button>
      <span
        role="status"
        data-slot="description-copy-status"
        className={cn(
          "text-ui-caption font-medium",
          state === "failed" ? "text-tj-error-ink" : "text-tj-success-ink",
        )}
      >
        {state === "copied" ? t.copied : state === "failed" ? t.copyFailed : ""}
      </span>
    </span>
  );
}
