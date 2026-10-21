import { Search } from "lucide-react";
import * as React from "react";

import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import { formatHotkey, toAriaKeyshortcuts, useHotkey } from "../lib/useHotkey";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./Dialog";
import { Spinner } from "./Spinner";
import { useCommonMessages, useMessages } from "./TajUIProvider";

export const commandMessages = defineMessages("command", {
  ru: {
    placeholder: "Введите команду или найдите…",
    inputLabel: "Поиск команд",
    listLabel: "Команды",
    dialogTitle: "Командная панель",
    dialogDescription: "Найдите команду или раздел и нажмите Enter",
  },
  tg: {
    placeholder: "Фармонро ворид кунед ё ҷустуҷӯ кунед…",
    inputLabel: "Ҷустуҷӯи фармонҳо",
    listLabel: "Фармонҳо",
    dialogTitle: "Лавҳаи фармонҳо",
    dialogDescription: "Фармон ё бахшро ёбед ва Enter-ро пахш кунед",
  },
  en: {
    placeholder: "Type a command or search…",
    inputLabel: "Search commands",
    listLabel: "Commands",
    dialogTitle: "Command palette",
    dialogDescription: "Find a command or section and press Enter",
  },
});

export type CommandLabels = (typeof commandMessages.locales)["ru"];

/* ------------------------------------------------------------------------ */
/* Matching                                                                  */
/* ------------------------------------------------------------------------ */

// Users on a Russian keyboard type Tajik words without the extra letters
// (х for ҳ, к for қ, …), and ё is routinely written as е.
const FOLD: Record<string, string> = {
  ё: "е",
  ҳ: "х",
  қ: "к",
  ғ: "г",
  ҷ: "ч",
  ӣ: "и",
  ӯ: "у",
};

/**
 * Lower-case, trim, collapse whitespace and fold ё→е plus the Tajik letters
 * ҳ қ ғ ҷ ӣ ӯ onto their Russian look-alikes, so the query and the text
 * compare loosely.
 */
export function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ёҳқғҷӣӯ]/g, (c) => FOLD[c] ?? c)
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Default matcher: the query is a substring of the value or of a keyword, or
 * every query word is the start of some word (`"нов прод"` → «Новая продажа»).
 * Case-insensitive; ignores ё/е and Tajik/Russian letter differences.
 */
export function commandFilter(value: string, search: string, keywords?: readonly string[]): boolean {
  const q = normalizeSearchText(search);
  if (!q) return true;
  const hay = normalizeSearchText([value, ...(keywords ?? [])].join(" "));
  if (hay.includes(q)) return true;
  const words = hay.split(/[\s\-_/.,:;()«»"']+/).filter(Boolean);
  return q.split(" ").every((part) => words.some((w) => w.startsWith(part)));
}

/* ------------------------------------------------------------------------ */
/* Context                                                                   */
/* ------------------------------------------------------------------------ */

interface ItemRecord {
  value: string;
  keywords?: readonly string[];
  groupId?: string;
}

interface CommandContextValue {
  search: string;
  setSearch: (next: string) => void;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  isItemVisible: (id: string) => boolean;
  isGroupVisible: (id: string) => boolean;
  visibleCount: number;
  loading: boolean;
  registerItem: (id: string, record: ItemRecord) => () => void;
  registerSelect: (id: string, fn: () => void) => () => void;
  registerLoading: () => () => void;
  listId: string;
  inputId: string;
  labels: CommandLabels;
}

const CommandContext = React.createContext<CommandContextValue | null>(null);
const GroupContext = React.createContext<string | undefined>(undefined);

function useCommandContext(part: string): CommandContextValue {
  const ctx = React.useContext(CommandContext);
  if (!ctx) throw new Error(`<${part}> must be used inside <Command>.`);
  return ctx;
}

const useIsoLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

const ITEM_SELECTOR = '[data-slot="command-item"]:not([data-disabled])';

/* ------------------------------------------------------------------------ */
/* Root                                                                      */
/* ------------------------------------------------------------------------ */

export interface CommandProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Controlled search text. */
  search?: string;
  defaultSearch?: string;
  onSearchChange?: (search: string) => void;
  /**
   * Custom matcher. Return true (or a number > 0) to show the item.
   * Defaults to {@link commandFilter}.
   */
  filter?: (value: string, search: string, keywords?: readonly string[]) => boolean | number;
  /** Set false when results come from the server already filtered. Defaults to true. */
  shouldFilter?: boolean;
  /** Wrap from last item to first with the arrow keys. Defaults to true. */
  loop?: boolean;
  /** Override built-in strings. */
  labels?: Partial<CommandLabels>;
}

/**
 * Command palette root. Items register themselves, are filtered by the text
 * in `CommandInput`, and are navigated with ↑ ↓ Home End and chosen with
 * Enter while focus stays in the input.
 */
export const Command = React.forwardRef<HTMLDivElement, CommandProps>(
  (
    {
      search: searchProp,
      defaultSearch = "",
      onSearchChange,
      filter = commandFilter,
      shouldFilter = true,
      loop = true,
      labels: labelOverrides,
      className,
      onKeyDown,
      children,
      ...props
    },
    ref,
  ) => {
    const labels = useMessages(commandMessages, labelOverrides);
    const baseId = React.useId();
    const listId = `${baseId}-list`;
    const inputId = `${baseId}-input`;

    const isSearchControlled = searchProp !== undefined;
    const [internalSearch, setInternalSearch] = React.useState(defaultSearch);
    const search = isSearchControlled ? searchProp : internalSearch;

    const [items, setItems] = React.useState<ReadonlyMap<string, ItemRecord>>(() => new Map());
    const [loadingCount, setLoadingCount] = React.useState(0);
    const [activeId, setActiveId] = React.useState<string | null>(null);
    const selectHandlers = React.useRef(new Map<string, () => void>());
    const rootRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

    const setSearch = React.useCallback(
      (next: string) => {
        if (!isSearchControlled) setInternalSearch(next);
        onSearchChange?.(next);
      },
      [isSearchControlled, onSearchChange],
    );

    const registerItem = React.useCallback((id: string, record: ItemRecord) => {
      setItems((prev) => {
        const next = new Map(prev);
        next.set(id, record);
        return next;
      });
      return () =>
        setItems((prev) => {
          if (!prev.has(id)) return prev;
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
    }, []);

    const registerSelect = React.useCallback((id: string, fn: () => void) => {
      selectHandlers.current.set(id, fn);
      return () => {
        if (selectHandlers.current.get(id) === fn) selectHandlers.current.delete(id);
      };
    }, []);

    const registerLoading = React.useCallback(() => {
      setLoadingCount((n) => n + 1);
      return () => setLoadingCount((n) => n - 1);
    }, []);

    const { visibleItems, visibleGroups } = React.useMemo(() => {
      const itemsOut = new Set<string>();
      const groupsOut = new Set<string>();
      const active = shouldFilter && search.trim() !== "";
      items.forEach((record, id) => {
        let match = true;
        if (active) {
          const result = filter(record.value, search, record.keywords);
          match = typeof result === "number" ? result > 0 : result;
        }
        if (match) {
          itemsOut.add(id);
          if (record.groupId) groupsOut.add(record.groupId);
        }
      });
      return { visibleItems: itemsOut, visibleGroups: groupsOut };
    }, [items, search, filter, shouldFilter]);

    const enabledItems = React.useCallback(
      () => Array.from(rootRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? []),
      [],
    );

    // Highlight the first enabled item whenever the query changes, and
    // recover when the highlighted item disappears or becomes disabled.
    const lastSearch = React.useRef(search);
    useIsoLayoutEffect(() => {
      const els = enabledItems();
      const searchChanged = lastSearch.current !== search;
      lastSearch.current = search;
      if (searchChanged || !activeId || !els.some((el) => el.id === activeId)) {
        const first = els[0]?.id ?? null;
        if (first !== activeId) setActiveId(first);
      }
    });

    React.useEffect(() => {
      if (activeId) document.getElementById(activeId)?.scrollIntoView?.({ block: "nearest" });
    }, [activeId]);

    const move = (to: "next" | "prev" | "first" | "last") => {
      const els = enabledItems();
      if (els.length === 0) return;
      const idx = els.findIndex((el) => el.id === activeId);
      let next: number;
      if (to === "first") next = 0;
      else if (to === "last") next = els.length - 1;
      else if (to === "next") next = idx < 0 ? 0 : idx + 1 >= els.length ? (loop ? 0 : idx) : idx + 1;
      else next = idx < 0 ? els.length - 1 : idx - 1 < 0 ? (loop ? els.length - 1 : idx) : idx - 1;
      setActiveId(els[next].id);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented || e.nativeEvent.isComposing) return;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          move("next");
          break;
        case "ArrowUp":
          e.preventDefault();
          move("prev");
          break;
        case "Home":
          e.preventDefault();
          move("first");
          break;
        case "End":
          e.preventDefault();
          move("last");
          break;
        case "Enter":
          if (activeId) {
            e.preventDefault();
            selectHandlers.current.get(activeId)?.();
          }
          break;
      }
    };

    const ctx = React.useMemo<CommandContextValue>(
      () => ({
        search,
        setSearch,
        activeId,
        setActiveId,
        isItemVisible: (id) => visibleItems.has(id),
        isGroupVisible: (id) => visibleGroups.has(id),
        visibleCount: visibleItems.size,
        loading: loadingCount > 0,
        registerItem,
        registerSelect,
        registerLoading,
        listId,
        inputId,
        labels,
      }),
      [
        search,
        setSearch,
        activeId,
        visibleItems,
        visibleGroups,
        loadingCount,
        registerItem,
        registerSelect,
        registerLoading,
        listId,
        inputId,
        labels,
      ],
    );

    return (
      <CommandContext.Provider value={ctx}>
        <div
          ref={rootRef}
          data-slot="command"
          className={cn(
            "flex h-full w-full flex-col overflow-hidden !rounded-lg bg-ui-surface text-ink-1",
            className,
          )}
          onKeyDown={handleKeyDown}
          {...props}
        >
          {children}
        </div>
      </CommandContext.Provider>
    );
  },
);
Command.displayName = "Command";

/* ------------------------------------------------------------------------ */
/* Input                                                                     */
/* ------------------------------------------------------------------------ */

export type CommandInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "type"
> & {
  /** Fires on every keystroke (the root's `onSearchChange` fires too). */
  onValueChange?: (value: string) => void;
  /** Spinner instead of the search icon, e.g. while a server search runs. */
  loading?: boolean;
  /** Classes for the wrapper around the icon and input. */
  wrapperClassName?: string;
};

/** Search field of the palette. Focus stays here while the list is navigated. */
export const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
  (
    { className, wrapperClassName, placeholder, onValueChange, loading, id, ...props },
    ref,
  ) => {
    const ctx = useCommandContext("CommandInput");
    const hasName = props["aria-label"] !== undefined || props["aria-labelledby"] !== undefined;
    return (
      <div
        data-slot="command-input-wrapper"
        className={cn(
          "flex min-h-control-lg items-center gap-2 border-b border-hairline px-3",
          wrapperClassName,
        )}
      >
        {loading ? (
          <Spinner className="size-4 text-ink-3" />
        ) : (
          <Search aria-hidden className="size-4 shrink-0 text-ink-3" />
        )}
        <input
          ref={ref}
          id={id ?? ctx.inputId}
          type="text"
          role="combobox"
          aria-expanded={ctx.visibleCount > 0 || ctx.loading}
          aria-controls={ctx.listId}
          aria-autocomplete="list"
          aria-activedescendant={ctx.activeId ?? undefined}
          aria-label={hasName ? undefined : ctx.labels.inputLabel}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          data-slot="command-input"
          placeholder={placeholder ?? ctx.labels.placeholder}
          value={ctx.search}
          onChange={(e) => {
            ctx.setSearch(e.target.value);
            onValueChange?.(e.target.value);
          }}
          className={cn(
            "h-control-lg w-full min-w-0 flex-1 bg-transparent text-ui-control font-medium text-ink-1 outline-none",
            "placeholder:font-normal placeholder:text-ink-3 disabled:cursor-not-allowed disabled:opacity-60",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
CommandInput.displayName = "CommandInput";

/* ------------------------------------------------------------------------ */
/* List, groups, items                                                       */
/* ------------------------------------------------------------------------ */

export type CommandListProps = React.HTMLAttributes<HTMLDivElement>;

/** Scrolling listbox that holds groups, items and the empty/loading states. */
export const CommandList = React.forwardRef<HTMLDivElement, CommandListProps>(
  ({ className, children, ...props }, ref) => {
    const ctx = useCommandContext("CommandList");
    const isListbox = ctx.visibleCount > 0 || ctx.loading;
    return (
      <div
        ref={ref}
        id={ctx.listId}
        // An empty listbox is invalid ARIA: drop the role while only the
        // empty state is shown (a busy listbox may be empty).
        role={isListbox ? "listbox" : undefined}
        aria-label={isListbox && !props["aria-labelledby"] ? ctx.labels.listLabel : undefined}
        aria-busy={ctx.loading || undefined}
        data-slot="command-list"
        className={cn("max-h-80 overflow-y-auto overscroll-contain p-1 scroll-py-1", className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
CommandList.displayName = "CommandList";

export interface CommandGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Visible group title, also its accessible name. */
  heading?: React.ReactNode;
}

/** Titled set of items. Hidden while none of its items match the query. */
export const CommandGroup = React.forwardRef<HTMLDivElement, CommandGroupProps>(
  ({ className, heading, children, ...props }, ref) => {
    const ctx = useCommandContext("CommandGroup");
    const groupId = React.useId();
    const headingId = `${groupId}-heading`;
    const visible = ctx.isGroupVisible(groupId);
    return (
      <div
        ref={ref}
        role="presentation"
        data-slot="command-group"
        hidden={!visible}
        className={cn("py-1 [&+&]:border-t [&+&]:border-hairline", className)}
        {...props}
      >
        {heading ? (
          <div
            id={headingId}
            aria-hidden
            data-slot="command-group-heading"
            className="px-2 pt-1 pb-1.5 text-ui-caption font-bold tracking-[0.06em] text-ink-3 uppercase"
          >
            {heading}
          </div>
        ) : null}
        <div role="group" aria-labelledby={heading ? headingId : undefined}>
          <GroupContext.Provider value={groupId}>{children}</GroupContext.Provider>
        </div>
      </div>
    );
  },
);
CommandGroup.displayName = "CommandGroup";

export interface CommandItemProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Text matched against the query and passed to `onSelect`. Defaults to string children. */
  value?: string;
  /** Extra search terms (synonyms, other languages, codes). */
  keywords?: string[];
  onSelect?: (value: string) => void;
  disabled?: boolean;
  /** Leading icon (decorative). */
  icon?: React.ReactNode;
  /**
   * Shortcut hint on the right. A combo string (`"mod+n"`) is printed for the
   * current platform (⌘N / Ctrl+N) and exposed as `aria-keyshortcuts`.
   */
  shortcut?: React.ReactNode;
}

/** Selectable row of the palette. */
export const CommandItem = React.forwardRef<HTMLDivElement, CommandItemProps>(
  (
    { value, keywords, onSelect, disabled = false, icon, shortcut, className, children, onClick, onPointerMove, ...props },
    ref,
  ) => {
    const ctx = useCommandContext("CommandItem");
    const groupId = React.useContext(GroupContext);
    const id = React.useId();
    const resolvedValue = value ?? (typeof children === "string" ? children : "");
    const keywordsKey = keywords?.join("\u0000") ?? "";

    const { registerItem, registerSelect } = ctx;
    useIsoLayoutEffect(
      () =>
        registerItem(id, {
          value: resolvedValue,
          keywords: keywordsKey ? keywordsKey.split("\u0000") : undefined,
          groupId,
        }),
      [registerItem, id, resolvedValue, keywordsKey, groupId],
    );

    const select = React.useCallback(() => {
      if (!disabled) onSelect?.(resolvedValue);
    }, [disabled, onSelect, resolvedValue]);
    useIsoLayoutEffect(() => registerSelect(id, select), [registerSelect, id, select]);

    if (!ctx.isItemVisible(id)) return null;
    const active = ctx.activeId === id;
    const comboShortcut = typeof shortcut === "string" ? shortcut : undefined;

    return (
      <div
        ref={ref}
        id={id}
        role="option"
        aria-selected={active}
        aria-disabled={disabled || undefined}
        aria-keyshortcuts={comboShortcut ? toAriaKeyshortcuts(comboShortcut) : undefined}
        data-slot="command-item"
        data-value={resolvedValue}
        data-selected={active || undefined}
        data-disabled={disabled || undefined}
        className={cn(
          "relative flex min-h-control-sm cursor-pointer select-none items-center gap-2 !rounded-md px-2 py-1.5 text-ui-body font-medium text-ink-1 outline-none",
          "data-[selected]:bg-mist data-[selected]:text-mist-ink",
          "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className,
        )}
        onPointerMove={(e) => {
          onPointerMove?.(e);
          if (!disabled && !active) ctx.setActiveId(id);
        }}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) select();
        }}
        {...props}
      >
        {icon ? (
          <span aria-hidden className="inline-flex text-ink-3 [[data-selected]>&]:text-mist-ink">
            {icon}
          </span>
        ) : null}
        <span className="min-w-0 flex-1 truncate">{children}</span>
        {shortcut ? <CommandShortcut>{comboShortcut ? formatHotkey(comboShortcut) : shortcut}</CommandShortcut> : null}
      </div>
    );
  },
);
CommandItem.displayName = "CommandItem";

export type CommandShortcutProps = React.HTMLAttributes<HTMLSpanElement>;

/** Keyboard-key hint (⌘K, Ctrl+N). Decorative: the item carries `aria-keyshortcuts`. */
export const CommandShortcut = React.forwardRef<HTMLSpanElement, CommandShortcutProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      aria-hidden
      data-slot="command-shortcut"
      className={cn(
        "ml-auto inline-flex min-w-5 shrink-0 items-center justify-center !rounded-xs border border-hairline bg-ui-surface-2 px-1.5 py-0.5 font-sans text-ui-caption font-semibold tracking-wide text-ink-3",
        className,
      )}
      {...props}
    />
  ),
);
CommandShortcut.displayName = "CommandShortcut";

export type CommandSeparatorProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Keep visible while searching. By default separators hide during a search. */
  alwaysRender?: boolean;
};

export const CommandSeparator = React.forwardRef<HTMLDivElement, CommandSeparatorProps>(
  ({ className, alwaysRender = false, ...props }, ref) => {
    const ctx = useCommandContext("CommandSeparator");
    if (!alwaysRender && ctx.search.trim()) return null;
    return (
      <div
        ref={ref}
        role="presentation"
        data-slot="command-separator"
        className={cn("-mx-1 my-1 h-px bg-hairline", className)}
        {...props}
      />
    );
  },
);
CommandSeparator.displayName = "CommandSeparator";

export type CommandEmptyProps = React.HTMLAttributes<HTMLDivElement>;

/** Shown when no item matches (and nothing is loading). Defaults to the common "No results". */
export const CommandEmpty = React.forwardRef<HTMLDivElement, CommandEmptyProps>(
  ({ className, children, ...props }, ref) => {
    const ctx = useCommandContext("CommandEmpty");
    const t = useCommonMessages();
    if (ctx.visibleCount > 0 || ctx.loading) return null;
    return (
      <div
        ref={ref}
        role="presentation"
        data-slot="command-empty"
        className={cn("px-2 py-6 text-center text-ui-body text-ink-3", className)}
        {...props}
      >
        <span role="status">{children ?? t.noResults}</span>
      </div>
    );
  },
);
CommandEmpty.displayName = "CommandEmpty";

export type CommandLoadingProps = React.HTMLAttributes<HTMLDivElement>;

/** Loading row; while mounted the list is `aria-busy` and CommandEmpty stays hidden. */
export const CommandLoading = React.forwardRef<HTMLDivElement, CommandLoadingProps>(
  ({ className, children, ...props }, ref) => {
    const ctx = useCommandContext("CommandLoading");
    const t = useCommonMessages();
    const { registerLoading } = ctx;
    useIsoLayoutEffect(() => registerLoading(), [registerLoading]);
    return (
      <div
        ref={ref}
        role="presentation"
        data-slot="command-loading"
        className={cn("flex items-center justify-center gap-2 px-2 py-6 text-ui-body text-ink-3", className)}
        {...props}
      >
        <Spinner className="size-4" />
        <span role="status">{children ?? t.loading}</span>
      </div>
    );
  },
);
CommandLoading.displayName = "CommandLoading";

/* ------------------------------------------------------------------------ */
/* Dialog                                                                    */
/* ------------------------------------------------------------------------ */

export interface CommandDialogProps extends CommandProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Global shortcut that toggles the dialog, e.g. `"mod+k"` (⌘K / Ctrl+K).
   * Works from inside text fields too. Off by default.
   */
  hotkey?: string;
  /** Accessible title (visually hidden). Defaults to the locale's "Command palette". */
  title?: string;
  /** Accessible description (visually hidden). */
  description?: string;
  /** Classes for the dialog panel. */
  contentClassName?: string;
}

/** Command palette in a modal dialog. Escape or a click outside closes it. */
export const CommandDialog = React.forwardRef<HTMLDivElement, CommandDialogProps>(
  (
    {
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      hotkey,
      title,
      description,
      contentClassName,
      className,
      children,
      labels: labelOverrides,
      ...commandProps
    },
    ref,
  ) => {
    const labels = useMessages(commandMessages, labelOverrides);
    const isControlled = openProp !== undefined;
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
    const open = isControlled ? openProp : internalOpen;

    const setOpen = React.useCallback(
      (next: boolean) => {
        if (!isControlled) setInternalOpen(next);
        onOpenChange?.(next);
      },
      [isControlled, onOpenChange],
    );

    useHotkey(hotkey ?? "", () => setOpen(!open), {
      enabled: !!hotkey,
      allowInInputs: true,
    });

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          size="lg"
          data-slot="command-dialog"
          className={cn(
            "top-[12vh] translate-y-0 gap-0 overflow-hidden p-0 sm:top-[15vh]",
            contentClassName,
          )}
        >
          <DialogTitle className="sr-only">{title ?? labels.dialogTitle}</DialogTitle>
          <DialogDescription className="sr-only">
            {description ?? labels.dialogDescription}
          </DialogDescription>
          <Command
            ref={ref}
            labels={labelOverrides}
            className={cn(
              "!rounded-none [&_[data-slot=command-input-wrapper]]:min-h-12 [&_[data-slot=command-input]]:h-12 [&_[data-slot=command-item]]:py-2",
              className,
            )}
            {...commandProps}
          >
            {children}
          </Command>
        </DialogContent>
      </Dialog>
    );
  },
);
CommandDialog.displayName = "CommandDialog";
