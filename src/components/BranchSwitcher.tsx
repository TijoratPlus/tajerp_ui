import {
  Check,
  ChevronsUpDown,
  Layers,
  Search,
  Store,
  Warehouse,
} from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";
import { controlSize, focusRing, type ControlSize } from "../lib/control";
import { defineMessages } from "../i18n/messages";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { useMessages } from "./TajUIProvider";

export const branchSwitcherMessages = defineMessages("branchSwitcher", {
  ru: {
    label: "Филиал",
    placeholder: "Выберите филиал",
    allBranches: "Все филиалы",
    allBranchesHint: "Сводно по всем точкам",
    listLabel: "Филиалы",
    search: "Найти филиал…",
    noResults: "Филиал не найден",
    store: "Магазин",
    warehouse: "Склад",
  },
  tg: {
    label: "Филиал",
    placeholder: "Филиалро интихоб кунед",
    allBranches: "Ҳамаи филиалҳо",
    allBranchesHint: "Ҷамъбаст аз рӯи ҳамаи нуқтаҳо",
    listLabel: "Филиалҳо",
    search: "Ҷустуҷӯи филиал…",
    noResults: "Филиал ёфт нашуд",
    store: "Мағоза",
    warehouse: "Анбор",
  },
  en: {
    label: "Branch",
    placeholder: "Choose a branch",
    allBranches: "All branches",
    allBranchesHint: "Consolidated across all locations",
    listLabel: "Branches",
    search: "Find a branch…",
    noResults: "No branch found",
    store: "Store",
    warehouse: "Warehouse",
  },
});

export type BranchSwitcherLabels =
  (typeof branchSwitcherMessages.locales)["ru"];

export interface Branch {
  id: string;
  name: string;
  address?: string;
  kind?: "store" | "warehouse";
  disabled?: boolean;
}

/** The consolidated "all branches" value. */
export const ALL_BRANCHES = "all" as const;

export type BranchValue = string;

export interface BranchSwitcherProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "value" | "defaultValue" | "onChange"
> {
  branches: Branch[];
  /** Selected branch id, or "all" for the consolidated view. */
  value?: BranchValue;
  defaultValue?: BranchValue;
  onValueChange?: (value: BranchValue) => void;
  /** Offer the consolidated "All branches" option. Defaults to false. */
  allowAll?: boolean;
  /** Show a search field when there are more branches than this. Defaults to 6. */
  searchThreshold?: number;
  /**
   * "default": two-line trigger with a "Branch" caption.
   * "compact": single-line trigger for topbars; the name hides on phones.
   */
  variant?: "default" | "compact";
  size?: ControlSize;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: "start" | "center" | "end";
  labels?: Partial<BranchSwitcherLabels>;
}

interface Option {
  value: BranchValue;
  name: string;
  hint?: string;
  kind: "store" | "warehouse" | "all";
  disabled?: boolean;
}

function KindIcon({
  kind,
  className,
}: {
  kind: Option["kind"];
  className?: string;
}) {
  const Icon =
    kind === "all" ? Layers : kind === "warehouse" ? Warehouse : Store;
  return <Icon className={className} aria-hidden />;
}

const TYPEAHEAD_MS = 500;

/**
 * Picks the active branch (store or warehouse), or the consolidated view
 * across all branches. Popover listbox with arrow-key navigation, typeahead
 * and a search field for long lists.
 */
export const BranchSwitcher = React.forwardRef<
  HTMLButtonElement,
  BranchSwitcherProps
>(
  (
    {
      branches,
      value: valueProp,
      defaultValue,
      onValueChange,
      allowAll = false,
      searchThreshold = 6,
      variant = "default",
      size = "md",
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      align = "start",
      labels: labelsProp,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const t = useMessages(branchSwitcherMessages, labelsProp);
    const listId = React.useId();

    const isValueControlled = valueProp !== undefined;
    const [internalValue, setInternalValue] = React.useState<
      BranchValue | undefined
    >(defaultValue);
    const value = isValueControlled ? valueProp : internalValue;

    const isOpenControlled = openProp !== undefined;
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
    const open = isOpenControlled ? openProp : internalOpen;
    const setOpen = (next: boolean) => {
      if (!isOpenControlled) setInternalOpen(next);
      onOpenChange?.(next);
    };

    const [query, setQuery] = React.useState("");
    const [active, setActive] = React.useState(0);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const listRef = React.useRef<HTMLUListElement>(null);
    const typeahead = React.useRef({ buffer: "", time: 0 });

    const searchable = branches.length > searchThreshold;

    const options = React.useMemo<Option[]>(() => {
      const out: Option[] = [];
      if (allowAll) {
        out.push({
          value: ALL_BRANCHES,
          name: t.allBranches,
          hint: t.allBranchesHint,
          kind: "all",
        });
      }
      for (const b of branches) {
        out.push({
          value: b.id,
          name: b.name,
          hint: b.address,
          kind: b.kind ?? "store",
          disabled: b.disabled,
        });
      }
      return out;
    }, [allowAll, branches, t.allBranches, t.allBranchesHint]);

    const filtered = React.useMemo(() => {
      const q = query.trim().toLocaleLowerCase();
      if (!q) return options;
      return options.filter(
        (o) =>
          o.name.toLocaleLowerCase().includes(q) ||
          (o.hint?.toLocaleLowerCase().includes(q) ?? false),
      );
    }, [options, query]);

    const selected = options.find((o) => o.value === value);

    const firstEnabled = (list: Option[], from = 0, step = 1) => {
      for (let i = from; i >= 0 && i < list.length; i += step) {
        if (!list[i].disabled) return i;
      }
      return -1;
    };

    // Reset the query and highlight the selection each time the list opens.
    React.useEffect(() => {
      if (!open) return;
      setQuery("");
      const idx = options.findIndex((o) => o.value === value && !o.disabled);
      setActive(idx >= 0 ? idx : Math.max(0, firstEnabled(options)));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    React.useEffect(() => {
      if (!open) return;
      const el = document.getElementById(`${listId}-${active}`);
      el?.scrollIntoView?.({ block: "nearest" });
    }, [active, open, listId]);

    const commit = (opt: Option | undefined) => {
      if (!opt || opt.disabled) return;
      if (!isValueControlled) setInternalValue(opt.value);
      onValueChange?.(opt.value);
      setOpen(false);
    };

    const move = (delta: 1 | -1) => {
      if (filtered.length === 0) return;
      const n = filtered.length;
      for (let step = 1; step <= n; step++) {
        const i = (active + delta * step + n * n) % n;
        if (!filtered[i].disabled) {
          setActive(i);
          return;
        }
      }
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          move(1);
          return;
        case "ArrowUp":
          e.preventDefault();
          move(-1);
          return;
        case "Home":
          if (searchable) return; // keep caret movement in the search field
          e.preventDefault();
          setActive(Math.max(0, firstEnabled(filtered)));
          return;
        case "End":
          if (searchable) return;
          e.preventDefault();
          setActive(
            Math.max(0, firstEnabled(filtered, filtered.length - 1, -1)),
          );
          return;
        case "Enter":
          e.preventDefault();
          commit(filtered[active]);
          return;
        case " ":
          if (searchable) return;
          e.preventDefault();
          commit(filtered[active]);
          return;
        case "Tab":
          setOpen(false);
          return;
      }
      // Typeahead (when there is no search field to type into).
      if (
        !searchable &&
        e.key.length === 1 &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        const now = Date.now();
        const ta = typeahead.current;
        ta.buffer = now - ta.time > TYPEAHEAD_MS ? e.key : ta.buffer + e.key;
        ta.time = now;
        const prefix = ta.buffer.toLocaleLowerCase();
        const n = filtered.length;
        // A repeated single letter cycles through matches.
        const start = ta.buffer.length === 1 ? active + 1 : active;
        for (let k = 0; k < n; k++) {
          const i = (start + k) % n;
          const o = filtered[i];
          if (!o.disabled && o.name.toLocaleLowerCase().startsWith(prefix)) {
            setActive(i);
            break;
          }
        }
      }
    };

    const activeId = filtered[active] ? `${listId}-${active}` : undefined;
    const triggerName = selected?.name ?? t.placeholder;
    const triggerKind = selected?.kind ?? "store";
    const compact = variant === "compact";

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            data-slot="branch-switcher"
            data-variant={variant}
            disabled={disabled}
            className={cn(
              "inline-flex max-w-full min-w-0 cursor-pointer items-center gap-2 !rounded-lg border border-hairline bg-ui-surface-2 text-left text-ink-1 transition-colors duration-150 hover:border-brand/40 disabled:cursor-not-allowed disabled:opacity-60",
              focusRing,
              compact
                ? cn(controlSize[size === "lg" ? "md" : "sm"], "px-2.5")
                : cn(
                    "px-3 py-1.5",
                    size === "lg" ? "min-h-control-lg" : "min-h-control-md",
                  ),
              className,
            )}
            {...props}
          >
            <span
              aria-hidden
              className={cn(
                "grid shrink-0 place-items-center !rounded-md bg-mist text-mist-ink",
                compact ? "size-5" : "size-7",
              )}
            >
              <KindIcon
                kind={triggerKind}
                className={compact ? "size-3.5" : "size-4"}
              />
            </span>
            {compact ? (
              <span className="min-w-0 truncate font-bold">
                <span className="sr-only">{t.label}: </span>
                <span className="sr-only sm:not-sr-only">{triggerName}</span>
              </span>
            ) : (
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="text-ui-caption font-medium text-ink-3">
                  {t.label}
                </span>
                <span
                  className={cn(
                    "truncate text-ui-label font-bold",
                    !selected && "font-medium text-ink-3",
                  )}
                >
                  {triggerName}
                </span>
              </span>
            )}
            <ChevronsUpDown
              className="ml-auto size-4 shrink-0 text-ink-3"
              aria-hidden
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align={align}
          aria-label={t.listLabel}
          data-slot="branch-switcher-content"
          className="flex max-h-[min(24rem,var(--radix-popover-content-available-height))] w-[min(20rem,calc(100vw-2rem))] flex-col overflow-hidden p-1"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            (inputRef.current ?? listRef.current)?.focus();
          }}
        >
          {searchable ? (
            <div className="flex shrink-0 items-center gap-2 border-b border-hairline px-2 pb-1">
              <Search className="size-4 shrink-0 text-ink-3" aria-hidden />
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-label={t.search}
                aria-expanded
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={activeId}
                placeholder={t.search}
                value={query}
                autoComplete="off"
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onKeyDown}
                data-slot="branch-switcher-search"
                className="h-control-md w-full min-w-0 bg-transparent text-ui-control text-ink-1 outline-none placeholder:text-ink-3"
              />
            </div>
          ) : null}
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={t.listLabel}
            tabIndex={searchable ? -1 : 0}
            aria-activedescendant={searchable ? undefined : activeId}
            onKeyDown={searchable ? undefined : onKeyDown}
            data-slot="branch-switcher-list"
            className={cn(
              "min-h-0 flex-1 overflow-y-auto overscroll-contain py-1 outline-none",
              "focus-visible:ring-2 focus-visible:ring-focus !rounded-md",
            )}
          >
            {filtered.map((o, i) => {
              const isSelected = o.value === value;
              const isActive = i === active;
              return (
                <li
                  key={o.value}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={o.disabled || undefined}
                  data-active={isActive || undefined}
                  data-value={o.value}
                  data-slot="branch-switcher-option"
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseMove={() =>
                    !o.disabled && i !== active && setActive(i)
                  }
                  onClick={() => commit(o)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 !rounded-md px-2 py-1.5 text-ui-body select-none",
                    "min-h-control-md",
                    isActive && "bg-mist",
                    o.disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  <span
                    aria-hidden
                    className="grid size-7 shrink-0 place-items-center !rounded-md bg-ui-surface-2 text-ink-2"
                  >
                    <KindIcon kind={o.kind} className="size-4" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="truncate font-bold text-ink-1">
                      {o.name}
                    </span>
                    {o.hint ? (
                      <span className="truncate text-ui-helper text-ink-3">
                        {o.hint}
                      </span>
                    ) : null}
                  </span>
                  {o.kind === "warehouse" ? (
                    <span className="shrink-0 !rounded-pill bg-ui-surface-2 px-1.5 py-0.5 text-ui-caption font-bold text-ink-3">
                      {t.warehouse}
                    </span>
                  ) : null}
                  <Check
                    aria-hidden
                    className={cn(
                      "size-4 shrink-0 text-brand-ink",
                      !isSelected && "invisible",
                    )}
                  />
                </li>
              );
            })}
          </ul>
          {filtered.length === 0 ? (
            <p
              role="status"
              className="px-2 py-3 text-center text-ui-body text-ink-3"
              data-slot="branch-switcher-empty"
            >
              {t.noResults}
            </p>
          ) : null}
        </PopoverContent>
      </Popover>
    );
  },
);
BranchSwitcher.displayName = "BranchSwitcher";
