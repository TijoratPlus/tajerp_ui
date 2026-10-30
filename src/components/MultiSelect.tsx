import { Check, ChevronDown, Minus, Plus, X } from "lucide-react";
import * as React from "react";

import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import {
  controlFocusWithin,
  controlFrame,
  controlInvalidWithin,
  focusRing,
  type ControlSize,
} from "../lib/control";
import { normalizeSearchText } from "./Command";
import { Popover, PopoverAnchor, PopoverContent } from "./Popover";
import type { SelectOption } from "./Select";
import { Spinner } from "./Spinner";
import { useCommonMessages, useMessages } from "./TajUIProvider";

export const multiSelectMessages = defineMessages("multiSelect", {
  ru: {
    placeholder: "Выберите…",
    listLabel: "Варианты",
    selectAll: "Выбрать все",
    clearAll: "Очистить выбор",
    removeItem: (label: string) => `Удалить «${label}»`,
    moreCount: (count: number) => `ещё ${count}`,
    selectedCount: (count: number) => (count ? `Выбрано: ${count}` : "Ничего не выбрано"),
    create: (text: string) => `Создать «${text}»`,
  },
  tg: {
    placeholder: "Интихоб кунед…",
    listLabel: "Имконҳо",
    selectAll: "Ҳамаро интихоб кардан",
    clearAll: "Тоза кардани интихоб",
    removeItem: (label: string) => `«${label}»-ро нест кардан`,
    moreCount: (count: number) => `боз ${count}`,
    selectedCount: (count: number) => (count ? `Интихобшуда: ${count}` : "Ҳеҷ чиз интихоб нашудааст"),
    create: (text: string) => `Сохтани «${text}»`,
  },
  en: {
    placeholder: "Select…",
    listLabel: "Options",
    selectAll: "Select all",
    clearAll: "Clear selection",
    removeItem: (label: string) => `Remove “${label}”`,
    moreCount: (count: number) => `${count} more`,
    selectedCount: (count: number) => (count ? `${count} selected` : "Nothing selected"),
    create: (text: string) => `Create “${text}”`,
  },
});

export type MultiSelectLabels = (typeof multiSelectMessages.locales)["ru"];

export interface MultiSelectOption extends SelectOption {
  /** Group heading this option is listed under. */
  group?: string;
}

export interface MultiSelectGroup {
  label: string;
  options: SelectOption[];
}

export type MultiSelectProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "size" | "type" | "children" | "onSelect"
> & {
  /** Flat options; set `group` on an option to list it under a heading. */
  options?: MultiSelectOption[];
  /** Grouped options (alternative to `options`). */
  groups?: MultiSelectGroup[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Controlled search text. */
  searchValue?: string;
  onSearchChange?: (search: string) => void;
  /**
   * Match an option against the query. Defaults to a case-insensitive
   * substring match that ignores ё/е. Pass `() => true` for server search.
   */
  filter?: (option: MultiSelectOption, query: string) => boolean;
  /** Show at most this many chips, then a "+N" counter. */
  maxVisibleChips?: number;
  /** Add a "Select all" row that toggles every matching option. */
  selectAll?: boolean;
  /** Show the clear (×) button while something is selected. Defaults to true. */
  clearable?: boolean;
  /** Offer to create an option from unmatched text (Enter or the "Create" row). */
  creatable?: boolean;
  /**
   * Called with the typed text when the user creates an option. Return the
   * new option's value to also select it.
   */
  onCreate?: (text: string) => string | void;
  /** Clear the search text after each toggle. Defaults to false. */
  clearSearchOnSelect?: boolean;
  loading?: boolean;
  /** Shown when nothing matches. Defaults to the common "No results". */
  emptyMessage?: React.ReactNode;
  /** Control height (density-aware). Defaults to "md". */
  size?: ControlSize;
  /** Classes for the inner text input (`className` goes on the field). */
  inputClassName?: string;
  labels?: Partial<MultiSelectLabels>;
};

const defaultFilter = (option: MultiSelectOption, query: string) =>
  normalizeSearchText(option.label).includes(normalizeSearchText(query));

const fieldSize: Record<ControlSize, string> = {
  sm: "min-h-control-sm text-ui-label",
  md: "min-h-control-md text-ui-control",
  lg: "min-h-control-lg text-ui-title",
};

type Entry =
  | { kind: "all"; disabled: boolean }
  | { kind: "option"; option: MultiSelectOption; disabled: boolean }
  | { kind: "create"; text: string; disabled: false };

const touchTarget =
  "relative after:absolute after:-inset-1 after:content-[''] [[data-density=touch]_&]:after:-inset-2.5";

/**
 * Multi-value combobox: type to filter, toggle options with Enter or a click,
 * selected values show as removable chips (Backspace removes the last one).
 */
export const MultiSelect = React.forwardRef<HTMLInputElement, MultiSelectProps>(
  (
    {
      options,
      groups,
      value,
      defaultValue,
      onValueChange,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      searchValue,
      onSearchChange,
      filter = defaultFilter,
      maxVisibleChips,
      selectAll = false,
      clearable = true,
      creatable = false,
      onCreate,
      clearSearchOnSelect = false,
      loading = false,
      emptyMessage,
      size = "md",
      disabled = false,
      placeholder,
      className,
      inputClassName,
      labels: labelOverrides,
      id,
      name,
      onKeyDown,
      "aria-describedby": ariaDescribedBy,
      ...inputProps
    },
    ref,
  ) => {
    const t = useMessages(multiSelectMessages, labelOverrides);
    const common = useCommonMessages();
    const baseId = React.useId();
    const inputId = id ?? `${baseId}-input`;
    const listId = `${baseId}-listbox`;
    const summaryId = `${baseId}-summary`;

    /* ---- state ---- */
    const isValueControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState<string[]>(defaultValue ?? []);
    const selected = isValueControlled ? value : internalValue;
    const setSelected = (next: string[]) => {
      if (!isValueControlled) setInternalValue(next);
      onValueChange?.(next);
    };

    const isOpenControlled = openProp !== undefined;
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
    const open = (isOpenControlled ? openProp : internalOpen) && !disabled;
    const setOpen = (next: boolean) => {
      if (next === open) return;
      if (!isOpenControlled) setInternalOpen(next);
      onOpenChange?.(next);
    };

    const isSearchControlled = searchValue !== undefined;
    const [internalSearch, setInternalSearch] = React.useState("");
    const query = isSearchControlled ? searchValue : internalSearch;
    const setQuery = (next: string) => {
      if (!isSearchControlled) setInternalSearch(next);
      onSearchChange?.(next);
    };

    const [active, setActive] = React.useState(0);

    const innerRef = React.useRef<HTMLInputElement>(null);
    const anchorRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    /* ---- options ---- */
    const allOptions = React.useMemo<MultiSelectOption[]>(
      () =>
        groups
          ? groups.flatMap((g) => g.options.map((o) => ({ ...o, group: g.label })))
          : (options ?? []),
      [groups, options],
    );
    const byValue = React.useMemo(
      () => new Map(allOptions.map((o) => [o.value, o])),
      [allOptions],
    );
    const labelFor = (v: string) => byValue.get(v)?.label ?? v;
    const isLocked = (v: string) => !!byValue.get(v)?.disabled;

    const trimmed = query.trim();
    const filtered = React.useMemo(
      () => (trimmed ? allOptions.filter((o) => filter(o, trimmed)) : allOptions),
      [allOptions, trimmed, filter],
    );

    // Sections in first-appearance order of their group.
    const sections = React.useMemo(() => {
      const out: Array<{ group?: string; options: MultiSelectOption[] }> = [];
      const index = new Map<string, number>();
      for (const o of filtered) {
        const key = o.group ?? "";
        let i = index.get(key);
        if (i === undefined) {
          i = out.push({ group: o.group, options: [] }) - 1;
          index.set(key, i);
        }
        out[i].options.push(o);
      }
      return out;
    }, [filtered]);

    const selectable = filtered.filter((o) => !o.disabled);
    const allChecked = selectable.length > 0 && selectable.every((o) => selected.includes(o.value));
    const someChecked = selectable.some((o) => selected.includes(o.value));

    const canCreate =
      creatable &&
      trimmed !== "" &&
      !allOptions.some((o) => normalizeSearchText(o.label) === normalizeSearchText(trimmed)) &&
      !selected.some((v) => normalizeSearchText(v) === normalizeSearchText(trimmed));

    const entries: Entry[] = [];
    if (selectAll && selectable.length > 0) entries.push({ kind: "all", disabled: false });
    for (const s of sections)
      for (const o of s.options) entries.push({ kind: "option", option: o, disabled: !!o.disabled });
    if (canCreate) entries.push({ kind: "create", text: trimmed, disabled: false });

    const entryIndex = new Map<Entry, number>(entries.map((e, i) => [e, i]));
    const optionEntryIndex = new Map<string, number>();
    entries.forEach((e, i) => {
      if (e.kind === "option") optionEntryIndex.set(e.option.value, i);
    });

    const firstEnabled = (from = 0, step = 1): number => {
      const n = entries.length;
      for (let k = 0; k < n; k++) {
        const i = (((from + k * step) % n) + n) % n;
        if (!entries[i].disabled) return i;
      }
      return -1;
    };

    // Keep the highlight on an enabled row as the list changes.
    const entriesKey = entries
      .map((e) => (e.kind === "option" ? `o:${e.option.value}:${e.disabled}` : e.kind))
      .join("|");
    React.useEffect(() => {
      setActive((i) => {
        if (entries[i] && !entries[i].disabled) return i;
        return Math.max(0, firstEnabled(0, 1));
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entriesKey]);

    React.useEffect(() => {
      if (!open) return;
      document.getElementById(`${baseId}-opt-${active}`)?.scrollIntoView?.({ block: "nearest" });
    }, [open, active, baseId]);

    /* ---- actions ---- */
    const toggleValue = (v: string) => {
      setSelected(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
      if (clearSearchOnSelect && query) {
        setQuery("");
        setActive(0);
      }
    };

    const toggleAll = () => {
      const values = selectable.map((o) => o.value);
      if (allChecked) setSelected(selected.filter((v) => !values.includes(v)));
      else setSelected([...selected, ...values.filter((v) => !selected.includes(v))]);
    };

    const create = (text: string) => {
      const created = onCreate?.(text);
      if (typeof created === "string" && !selected.includes(created)) {
        setSelected([...selected, created]);
      }
      setQuery("");
      setActive(0);
    };

    const activate = (entry: Entry | undefined) => {
      if (!entry || entry.disabled) return;
      if (entry.kind === "all") toggleAll();
      else if (entry.kind === "create") create(entry.text);
      else toggleValue(entry.option.value);
    };

    const remove = (v: string) => {
      setSelected(selected.filter((x) => x !== v));
    };

    const removable = selected.filter((v) => !isLocked(v));
    const clearAll = () => {
      setSelected(selected.filter((v) => isLocked(v)));
      setQuery("");
      innerRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented || disabled || e.nativeEvent.isComposing) return;
      switch (e.key) {
        case "ArrowDown":
        case "ArrowUp": {
          e.preventDefault();
          if (!open) {
            setOpen(true);
            break;
          }
          const step = e.key === "ArrowDown" ? 1 : -1;
          const next = firstEnabled(active + step, step);
          if (next >= 0) setActive(next);
          break;
        }
        case "Enter":
          if (open && entries[active]) {
            e.preventDefault();
            activate(entries[active]);
          } else if (creatable && trimmed) {
            e.preventDefault();
            create(trimmed);
          } else if (!open) {
            e.preventDefault();
            setOpen(true);
          }
          break;
        case "Backspace":
          if (query === "" && removable.length > 0) {
            e.preventDefault();
            remove(removable[removable.length - 1]);
          }
          break;
        case "Escape":
          if (open) {
            e.preventDefault();
            setOpen(false);
          }
          break;
        case "Tab":
          setOpen(false);
          break;
      }
    };

    const keepOpenOnAnchorInteraction = (e: Event) => {
      const target = e.target as Node | null;
      if (target && anchorRef.current?.contains(target)) e.preventDefault();
    };

    /* ---- render ---- */
    const visibleChips =
      maxVisibleChips !== undefined ? selected.slice(0, Math.max(0, maxVisibleChips)) : selected;
    const hiddenChips = selected.slice(visibleChips.length);
    const activeEntry = open ? entries[active] : undefined;
    const optionId = (i: number) => `${baseId}-opt-${i}`;
    const listName =
      inputProps["aria-labelledby"] !== undefined
        ? { "aria-labelledby": inputProps["aria-labelledby"] }
        : { "aria-label": inputProps["aria-label"] ?? t.listLabel };

    const renderOption = (entry: Entry) => {
      const i = entryIndex.get(entry) ?? -1;
      const isActive = i === active;
      let checked: boolean | "mixed" = false;
      let content: React.ReactNode;
      if (entry.kind === "all") {
        checked = allChecked ? true : someChecked ? "mixed" : false;
        content = t.selectAll;
      } else if (entry.kind === "create") {
        content = t.create(entry.text);
      } else {
        checked = selected.includes(entry.option.value);
        content = entry.option.label;
      }
      return (
        <div
          key={entry.kind === "option" ? `o-${entry.option.value}` : entry.kind}
          id={optionId(i)}
          role="option"
          aria-selected={checked === true}
          aria-checked={entry.kind === "all" ? checked : undefined}
          aria-disabled={entry.disabled || undefined}
          data-slot="multi-select-option"
          data-highlighted={isActive || undefined}
          data-disabled={entry.disabled || undefined}
          data-state={checked === true ? "checked" : checked === "mixed" ? "indeterminate" : "unchecked"}
          onPointerDown={(e) => e.preventDefault()}
          onPointerMove={() => {
            if (!entry.disabled && !isActive) setActive(i);
          }}
          onClick={() => activate(entry)}
          className={cn(
            "flex min-h-control-sm cursor-pointer select-none items-center gap-2 !rounded-md px-2 py-1.5 text-ui-body font-medium text-ink-1",
            "data-[highlighted]:bg-mist data-[highlighted]:text-mist-ink",
            "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
            entry.kind === "all" && "font-semibold",
          )}
        >
          {entry.kind === "create" ? (
            <Plus aria-hidden className="size-4 shrink-0 text-ink-3" />
          ) : (
            <span
              aria-hidden
              className={cn(
                "flex size-4 shrink-0 items-center justify-center !rounded-xs border transition-colors",
                checked ? "border-transparent bg-brand-solid text-on-brand" : "border-ink-4 bg-ui-surface",
              )}
            >
              {checked === "mixed" ? (
                <Minus className="size-3" strokeWidth={3} />
              ) : checked ? (
                <Check className="size-3" strokeWidth={3} />
              ) : null}
            </span>
          )}
          <span className="min-w-0 flex-1 truncate">{content}</span>
        </div>
      );
    };

    const hasEntries = entries.length > 0;
    const allEntry = entries[0]?.kind === "all" ? entries[0] : undefined;
    const createEntry = entries[entries.length - 1]?.kind === "create" ? entries[entries.length - 1] : undefined;
    const optionEntries = (group: MultiSelectOption[]) =>
      group.map((o) => entries[optionEntryIndex.get(o.value) ?? -1]).filter(Boolean);

    return (
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverAnchor asChild>
          <div
            ref={anchorRef}
            data-slot="multi-select"
            data-disabled={disabled || undefined}
            className={cn(
              "relative flex w-full cursor-text items-center gap-1 pr-1.5",
              controlFrame,
              controlFocusWithin,
              controlInvalidWithin,
              fieldSize[size],
              disabled && "cursor-not-allowed opacity-60",
              className,
            )}
            onMouseDown={(e) => {
              if (disabled) return;
              const target = e.target as HTMLElement;
              if (target.closest("button")) return;
              if (target !== innerRef.current) {
                e.preventDefault();
                innerRef.current?.focus();
              }
              setOpen(!open || target === innerRef.current);
            }}
          >
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1 py-1 pl-1.5">
              {visibleChips.map((v) => {
                const label = labelFor(v);
                const locked = isLocked(v);
                return (
                  <span
                    key={v}
                    data-slot="multi-select-chip"
                    className={cn(
                      "inline-flex h-6 max-w-full items-center gap-1 !rounded-md bg-mist pl-2 text-ui-label font-semibold text-mist-ink [[data-density=touch]_&]:h-8",
                      locked || disabled ? "pr-2" : "pr-0.5",
                    )}
                  >
                    <span className="truncate">{label}</span>
                    {locked || disabled ? null : (
                      <button
                        type="button"
                        aria-label={t.removeItem(label)}
                        data-slot="multi-select-chip-remove"
                        onClick={() => {
                          remove(v);
                          innerRef.current?.focus();
                        }}
                        className={cn(
                          "inline-flex size-5 shrink-0 cursor-pointer items-center justify-center !rounded-xs text-mist-ink/80 hover:bg-brand/15 hover:text-mist-ink",
                          focusRing,
                          touchTarget,
                        )}
                      >
                        <X aria-hidden className="size-3.5" />
                      </button>
                    )}
                  </span>
                );
              })}
              {hiddenChips.length > 0 ? (
                <span
                  data-slot="multi-select-overflow"
                  title={hiddenChips.map(labelFor).join(", ")}
                  className="inline-flex h-6 items-center !rounded-md border border-hairline bg-ui-surface px-2 text-ui-label font-semibold text-ink-2 [[data-density=touch]_&]:h-8"
                >
                  <span aria-hidden>+{hiddenChips.length}</span>
                  <span className="sr-only">{t.moreCount(hiddenChips.length)}</span>
                </span>
              ) : null}
              <input
                ref={innerRef}
                id={inputId}
                type="text"
                role="combobox"
                aria-expanded={open}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-haspopup="listbox"
                aria-activedescendant={activeEntry && !activeEntry.disabled ? optionId(active) : undefined}
                aria-describedby={[summaryId, ariaDescribedBy].filter(Boolean).join(" ")}
                aria-busy={loading || undefined}
                autoComplete="off"
                disabled={disabled}
                placeholder={selected.length === 0 ? (placeholder ?? t.placeholder) : undefined}
                value={query}
                data-slot="multi-select-input"
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                  setOpen(true);
                }}
                onKeyDown={handleKeyDown}
                className={cn(
                  "h-6 min-w-16 flex-1 bg-transparent px-1 font-medium text-ink-1 outline-none",
                  "placeholder:font-normal placeholder:text-ink-4 disabled:cursor-not-allowed",
                  inputClassName,
                )}
                {...inputProps}
              />
              <span id={summaryId} className="sr-only">
                {t.selectedCount(selected.length)}
                {selected.length ? `: ${selected.map(labelFor).join(", ")}` : ""}
              </span>
              {name
                ? selected.map((v) => <input key={v} type="hidden" name={name} value={v} />)
                : null}
            </div>
            <div className="flex shrink-0 items-center gap-0.5 self-stretch">
              {clearable && !disabled && removable.length > 0 ? (
                <button
                  type="button"
                  aria-label={t.clearAll}
                  data-slot="multi-select-clear"
                  onClick={clearAll}
                  className={cn(
                    "inline-flex size-6 cursor-pointer items-center justify-center !rounded-md text-ink-3 hover:bg-ui-surface-inset hover:text-ink-1",
                    focusRing,
                    touchTarget,
                  )}
                >
                  <X aria-hidden className="size-4" />
                </button>
              ) : null}
              <span aria-hidden className="inline-flex size-6 items-center justify-center text-ink-3">
                {loading ? (
                  <Spinner className="size-4 text-ink-3" />
                ) : (
                  <ChevronDown
                    className={cn("size-4 transition-transform motion-safe:duration-150", open && "rotate-180")}
                  />
                )}
              </span>
            </div>
          </div>
        </PopoverAnchor>

        <PopoverContent
          align="start"
          sideOffset={6}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={keepOpenOnAnchorInteraction}
          onPointerDownOutside={keepOpenOnAnchorInteraction}
          data-slot="multi-select-content"
          className="max-h-72 w-[var(--radix-popover-trigger-width)] min-w-48 overflow-y-auto overscroll-contain p-1"
        >
          <div
            id={listId}
            // An empty listbox is invalid ARIA; a busy one may be empty.
            role={hasEntries || loading ? "listbox" : undefined}
            aria-multiselectable={hasEntries || loading ? true : undefined}
            aria-busy={loading || undefined}
            {...(hasEntries || loading ? listName : {})}
            data-slot="multi-select-listbox"
            className="flex flex-col gap-0.5"
          >
            {allEntry ? (
              <>
                {renderOption(allEntry)}
                <div role="presentation" className="-mx-1 my-0.5 h-px bg-hairline" />
              </>
            ) : null}
            {sections.map((section, si) => {
              const rows = optionEntries(section.options).map(renderOption);
              if (!section.group) return <React.Fragment key={`s-${si}`}>{rows}</React.Fragment>;
              const headingId = `${baseId}-group-${si}`;
              return (
                <div key={`g-${section.group}`} role="presentation" data-slot="multi-select-group" className="pt-1">
                  <div
                    id={headingId}
                    aria-hidden
                    className="px-2 pt-1 pb-1 text-ui-caption font-bold tracking-[0.06em] text-ink-3 uppercase"
                  >
                    {section.group}
                  </div>
                  <div role="group" aria-labelledby={headingId} className="flex flex-col gap-0.5">
                    {rows}
                  </div>
                </div>
              );
            })}
            {createEntry ? renderOption(createEntry) : null}
            {!hasEntries ? (
              <div
                role={loading ? "presentation" : undefined}
                data-slot="multi-select-empty"
                className="flex items-center justify-center gap-2 px-2 py-4 text-ui-body text-ink-3"
              >
                {loading ? <Spinner className="size-4" /> : null}
                <span role="status">{loading ? common.loading : (emptyMessage ?? common.noResults)}</span>
              </div>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);
MultiSelect.displayName = "MultiSelect";
