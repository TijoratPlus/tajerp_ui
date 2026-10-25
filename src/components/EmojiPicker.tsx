import { gemoji, type Gemoji } from "gemoji";
import { Smile, X } from "lucide-react";
import * as React from "react";

import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import { focusRing } from "../lib/control";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { SearchField } from "./SearchField";
import { useMessages } from "./TajUIProvider";

export const emojiPickerMessages = defineMessages("emojiPicker", {
  ru: {
    trigger: "Вставить эмодзи",
    dialog: "Выбор эмодзи",
    search: "Поиск эмодзи",
    searchPlaceholder: "Поиск…",
    categories: "Категории",
    noResults: "Ничего не найдено",
    smileys: "Смайлы и эмоции",
    people: "Люди",
    nature: "Животные и природа",
    food: "Еда и напитки",
    travel: "Путешествия и места",
    activities: "Занятия",
    objects: "Предметы",
    symbols: "Символы",
    flags: "Флаги",
    results: "Результаты поиска",
    iconTrigger: "Выбрать значок",
    iconCurrent: (emoji: string) => `Значок: ${emoji}`,
    clearIcon: "Убрать значок",
  },
  tg: {
    trigger: "Гузоштани эмодзи",
    dialog: "Интихоби эмодзи",
    search: "Ҷустуҷӯи эмодзи",
    searchPlaceholder: "Ҷустуҷӯ…",
    categories: "Категорияҳо",
    noResults: "Ҳеҷ чиз ёфт нашуд",
    smileys: "Табассум ва эҳсосот",
    people: "Одамон",
    nature: "Ҳайвонот ва табиат",
    food: "Хӯрок ва нӯшокӣ",
    travel: "Сафар ва ҷойҳо",
    activities: "Машғулиятҳо",
    objects: "Ашё",
    symbols: "Рамзҳо",
    flags: "Парчамҳо",
    results: "Натиҷаҳои ҷустуҷӯ",
    iconTrigger: "Интихоби нишона",
    iconCurrent: (emoji: string) => `Нишона: ${emoji}`,
    clearIcon: "Хориҷ кардани нишона",
  },
  en: {
    trigger: "Insert emoji",
    dialog: "Emoji picker",
    search: "Search emoji",
    searchPlaceholder: "Search…",
    categories: "Categories",
    noResults: "No results",
    smileys: "Smileys & emotion",
    people: "People & body",
    nature: "Animals & nature",
    food: "Food & drink",
    travel: "Travel & places",
    activities: "Activities",
    objects: "Objects",
    symbols: "Symbols",
    flags: "Flags",
    results: "Search results",
    iconTrigger: "Choose icon",
    iconCurrent: (emoji: string) => `Icon: ${emoji}`,
    clearIcon: "Remove icon",
  },
});

export type EmojiPickerLabels = (typeof emojiPickerMessages.locales)["ru"];

type CategoryKey =
  | "smileys"
  | "people"
  | "nature"
  | "food"
  | "travel"
  | "activities"
  | "objects"
  | "symbols"
  | "flags";

/** gemoji category name → message key + tab icon. */
const CATEGORIES: { key: CategoryKey; gemoji: string; icon: string }[] = [
  { key: "smileys", gemoji: "Smileys & Emotion", icon: "😀" },
  { key: "people", gemoji: "People & Body", icon: "👋" },
  { key: "nature", gemoji: "Animals & Nature", icon: "🐻" },
  { key: "food", gemoji: "Food & Drink", icon: "🍎" },
  { key: "travel", gemoji: "Travel & Places", icon: "🚗" },
  { key: "activities", gemoji: "Activities", icon: "⚽" },
  { key: "objects", gemoji: "Objects", icon: "💡" },
  { key: "symbols", gemoji: "Symbols", icon: "❤️" },
  { key: "flags", gemoji: "Flags", icon: "🏳️" },
];

const BY_CATEGORY: Record<string, Gemoji[]> = {};
for (const g of gemoji) (BY_CATEGORY[g.category] ??= []).push(g);

/** Emoji whose name, tag or description contains every word of `query`. */
export function searchEmoji(query: string, limit = 120): Gemoji[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const out: Gemoji[] = [];
  for (const g of gemoji) {
    const hay = `${g.names.join(" ")} ${g.tags.join(" ")} ${g.description}`.toLowerCase();
    if (words.every((w) => hay.includes(w) || g.emoji === w)) {
      out.push(g);
      if (out.length >= limit) break;
    }
  }
  return out;
}

const COLUMNS = 8;

export interface EmojiPickerPanelProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Called with the emoji character, e.g. "👍". */
  onSelect: (emoji: string) => void;
  /** Focus the search field on mount. Defaults to true. */
  autoFocusSearch?: boolean;
  labels?: Partial<EmojiPickerLabels>;
}

/**
 * Inline emoji grid with search and category tabs (no popover). Use it inside
 * a toolbar menu or your own overlay; `EmojiPicker` wraps it in a popover.
 */
export const EmojiPickerPanel = React.forwardRef<HTMLDivElement, EmojiPickerPanelProps>(
  ({ onSelect, autoFocusSearch = true, labels, className, ...props }, ref) => {
    const t = useMessages(emojiPickerMessages, labels);
    const [query, setQuery] = React.useState("");
    const [category, setCategory] = React.useState<CategoryKey>("smileys");
    const gridRef = React.useRef<HTMLDivElement>(null);
    const gridId = React.useId();

    const active = CATEGORIES.find((c) => c.key === category)!;
    const items = query.trim() ? searchEmoji(query) : (BY_CATEGORY[active.gemoji] ?? []);
    const gridLabel = query.trim() ? t.results : t[category];

    const focusCell = (index: number) => {
      const cells = gridRef.current?.querySelectorAll<HTMLButtonElement>(
        "[data-slot=emoji-picker-item]",
      );
      if (!cells || cells.length === 0) return;
      cells[Math.max(0, Math.min(cells.length - 1, index))]?.focus();
    };

    const onGridKeyDown = (e: React.KeyboardEvent, index: number) => {
      const map: Record<string, number> = {
        ArrowRight: 1,
        ArrowLeft: -1,
        ArrowDown: COLUMNS,
        ArrowUp: -COLUMNS,
      };
      if (e.key in map) {
        e.preventDefault();
        focusCell(index + map[e.key]!);
      } else if (e.key === "Home") {
        e.preventDefault();
        focusCell(0);
      } else if (e.key === "End") {
        e.preventDefault();
        focusCell(items.length - 1);
      }
    };

    return (
      <div
        ref={ref}
        data-slot="emoji-picker"
        className={cn("flex w-[300px] flex-col gap-2", className)}
        {...props}
      >
        <SearchField
          size="sm"
          aria-label={t.search}
          placeholder={t.searchPlaceholder}
          value={query}
          onValueChange={setQuery}
          autoFocus={autoFocusSearch}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              focusCell(0);
            }
          }}
        />
        {!query.trim() ? (
          <div
            role="toolbar"
            aria-label={t.categories}
            data-slot="emoji-picker-categories"
            className="flex items-center justify-between gap-0.5"
          >
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                aria-label={t[c.key]}
                title={t[c.key]}
                aria-pressed={category === c.key}
                aria-controls={gridId}
                onClick={() => setCategory(c.key)}
                className={cn(
                  "inline-flex size-7 shrink-0 cursor-pointer items-center justify-center !rounded-md text-ui-title transition-colors hover:bg-ui-surface-2",
                  "aria-pressed:bg-mist",
                  focusRing,
                )}
              >
                <span aria-hidden>{c.icon}</span>
              </button>
            ))}
          </div>
        ) : null}
        <div
          ref={gridRef}
          id={gridId}
          role="group"
          aria-label={gridLabel}
          data-slot="emoji-picker-grid"
          className="grid h-56 auto-rows-min grid-cols-8 gap-0.5 overflow-y-auto"
        >
          {items.length === 0 ? (
            <p className="col-span-8 py-6 text-center text-ui-label text-ink-3">
              {t.noResults}
            </p>
          ) : (
            items.map((g, i) => (
              <button
                key={g.emoji}
                type="button"
                data-slot="emoji-picker-item"
                aria-label={g.description}
                title={`:${g.names[0]}:`}
                tabIndex={i === 0 ? 0 : -1}
                onKeyDown={(e) => onGridKeyDown(e, i)}
                onClick={() => onSelect(g.emoji)}
                className={cn(
                  "inline-flex size-8 cursor-pointer items-center justify-center !rounded-md text-xl leading-none transition-colors hover:bg-ui-surface-2",
                  focusRing,
                )}
              >
                {g.emoji}
              </button>
            ))
          )}
        </div>
      </div>
    );
  },
);
EmojiPickerPanel.displayName = "EmojiPickerPanel";

export interface EmojiPickerProps {
  /** Called with the emoji character, e.g. "👍". */
  onSelect: (emoji: string) => void;
  /** Custom trigger element (rendered with `asChild`). Defaults to a smiley icon button. */
  trigger?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Close after picking. Defaults to true. */
  closeOnSelect?: boolean;
  disabled?: boolean;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  /** Classes for the default trigger button. */
  className?: string;
  /** Classes for the popover panel. */
  contentClassName?: string;
  labels?: Partial<EmojiPickerLabels>;
}

function useOpenState(
  open: boolean | undefined,
  defaultOpen: boolean | undefined,
  onOpenChange: ((open: boolean) => void) | undefined,
) {
  const [inner, setInner] = React.useState(defaultOpen ?? false);
  const value = open ?? inner;
  const set = (next: boolean) => {
    if (open === undefined) setInner(next);
    onOpenChange?.(next);
  };
  return [value, set] as const;
}

/** Popover emoji picker: search plus categories (data from gemoji). */
export const EmojiPicker = React.forwardRef<HTMLButtonElement, EmojiPickerProps>(
  (
    {
      onSelect,
      trigger,
      open: openProp,
      defaultOpen,
      onOpenChange,
      closeOnSelect = true,
      disabled,
      align = "start",
      side,
      className,
      contentClassName,
      labels,
    },
    ref,
  ) => {
    const t = useMessages(emojiPickerMessages, labels);
    const [open, setOpen] = useOpenState(openProp, defaultOpen, onOpenChange);
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled} ref={ref}>
          {trigger ?? (
            <button
              type="button"
              aria-label={t.trigger}
              data-slot="emoji-picker-trigger"
              className={cn(
                "inline-flex size-control-sm cursor-pointer items-center justify-center !rounded-lg text-ink-2 transition-colors hover:bg-mist hover:text-brand-ink disabled:cursor-not-allowed disabled:opacity-60",
                focusRing,
                className,
              )}
            >
              <Smile className="size-4" aria-hidden />
            </button>
          )}
        </PopoverTrigger>
        <PopoverContent
          align={align}
          side={side}
          aria-label={t.dialog}
          className={cn("w-auto p-2", contentClassName)}
        >
          <EmojiPickerPanel
            labels={labels}
            onSelect={(emoji) => {
              onSelect(emoji);
              if (closeOnSelect) setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    );
  },
);
EmojiPicker.displayName = "EmojiPicker";

export interface IconPickerProps {
  /** Current emoji icon ("" or undefined → none). */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Show a "remove icon" button inside the picker. Defaults to true. */
  clearable?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  /** Shown when there is no value. Defaults to a smiley outline. */
  placeholder?: React.ReactNode;
  className?: string;
  labels?: Partial<EmojiPickerLabels>;
}

const iconSizes = {
  sm: "size-control-sm text-base",
  md: "size-control-md text-xl",
  lg: "size-control-lg text-2xl",
} as const;

/** Emoji picker whose trigger shows the current emoji (e.g. a list/board icon). */
export const IconPicker = React.forwardRef<HTMLButtonElement, IconPickerProps>(
  (
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      clearable = true,
      disabled,
      size = "md",
      placeholder,
      className,
      labels,
    },
    ref,
  ) => {
    const t = useMessages(emojiPickerMessages, labels);
    const [inner, setInner] = React.useState(defaultValue ?? "");
    const value = valueProp ?? inner;
    const [open, setOpen] = React.useState(false);
    const commit = (v: string) => {
      if (valueProp === undefined) setInner(v);
      onValueChange?.(v);
    };
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <button
            ref={ref}
            type="button"
            data-slot="icon-picker"
            aria-label={value ? t.iconCurrent(value) : t.iconTrigger}
            className={cn(
              "inline-flex shrink-0 cursor-pointer items-center justify-center !rounded-lg border border-hairline bg-ui-surface-2 leading-none text-ink-3 transition-colors hover:bg-mist disabled:cursor-not-allowed disabled:opacity-60",
              iconSizes[size],
              focusRing,
              className,
            )}
          >
            {value ? (
              <span aria-hidden>{value}</span>
            ) : (
              (placeholder ?? <Smile className="size-4" aria-hidden />)
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" aria-label={t.dialog} className="w-auto p-2">
          <EmojiPickerPanel
            labels={labels}
            onSelect={(emoji) => {
              commit(emoji);
              setOpen(false);
            }}
          />
          {clearable && value ? (
            <button
              type="button"
              data-slot="icon-picker-clear"
              onClick={() => {
                commit("");
                setOpen(false);
              }}
              className={cn(
                "mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 !rounded-md px-2 py-1.5 text-ui-label text-ink-2 hover:bg-ui-surface-2",
                focusRing,
              )}
            >
              <X className="size-3.5" aria-hidden />
              {t.clearIcon}
            </button>
          ) : null}
        </PopoverContent>
      </Popover>
    );
  },
);
IconPicker.displayName = "IconPicker";
