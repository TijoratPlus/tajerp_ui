import { X } from "lucide-react";
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
import { Popover, PopoverAnchor, PopoverContent } from "./Popover";
import { Spinner } from "./Spinner";
import { useMessages } from "./TajUIProvider";

export const chipInputMessages = defineMessages("chipInput", {
  ru: {
    remove: (value: string) => `Удалить «${value}»`,
    suggestions: "Варианты",
    loading: "Загрузка…",
    noResults: "Ничего не найдено",
    invalid: (value: string) => `«${value}» — неверное значение`,
    added: (value: string) => `Добавлено: ${value}`,
    removed: (value: string) => `Удалено: ${value}`,
  },
  tg: {
    remove: (value: string) => `«${value}»-ро нест кардан`,
    suggestions: "Имконҳо",
    loading: "Боркунӣ…",
    noResults: "Ҳеҷ чиз ёфт нашуд",
    invalid: (value: string) => `«${value}» — қимати нодуруст`,
    added: (value: string) => `Илова шуд: ${value}`,
    removed: (value: string) => `Нест шуд: ${value}`,
  },
  en: {
    remove: (value: string) => `Remove “${value}”`,
    suggestions: "Suggestions",
    loading: "Loading…",
    noResults: "No results",
    invalid: (value: string) => `“${value}” is not valid`,
    added: (value: string) => `Added: ${value}`,
    removed: (value: string) => `Removed: ${value}`,
  },
});

export type ChipInputLabels = (typeof chipInputMessages.locales)["ru"];

export interface ChipSuggestion {
  value: string;
  label: string;
  description?: string;
}

export type ChipInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "size" | "type"
> & {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Async suggestions for the typed text (debounced 200 ms). */
  search?: (query: string) => Promise<ChipSuggestion[]>;
  /** Reject typed values, e.g. invalid e-mails. */
  validate?: (value: string) => boolean;
  /** Accept typed values that are not suggestions. Defaults to true. */
  allowCustom?: boolean;
  /** Custom chip content (the remove button is added around it). */
  renderChip?: (value: string) => React.ReactNode;
  size?: ControlSize;
  /** Classes for the outer frame (`className` goes there too). */
  inputClassName?: string;
  labels?: Partial<ChipInputLabels>;
};

const SEPARATORS = /[,;\n\r\t]+/;

/**
 * Tag/recipient field: Enter, comma or paste turn text into chips, Backspace
 * on an empty field removes the last one. Optional async `search` shows
 * suggestions (e.g. contacts for an e-mail To/CC line); `validate` rejects
 * bad input.
 */
export const ChipInput = React.forwardRef<HTMLInputElement, ChipInputProps>(
  (
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      search,
      validate,
      allowCustom = true,
      renderChip,
      size = "md",
      placeholder,
      disabled,
      className,
      inputClassName,
      labels,
      id,
      onKeyDown,
      onBlur,
      "aria-invalid": ariaInvalid,
      ...props
    },
    ref,
  ) => {
    const t = useMessages(chipInputMessages, labels);
    const [inner, setInner] = React.useState<string[]>(defaultValue ?? []);
    const value = valueProp ?? inner;
    const [text, setText] = React.useState("");
    const [invalid, setInvalid] = React.useState(false);
    const [suggestions, setSuggestions] = React.useState<ChipSuggestion[]>([]);
    const [searching, setSearching] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const [active, setActive] = React.useState(-1);
    const [announcement, setAnnouncement] = React.useState("");
    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);
    const autoId = React.useId();
    const inputId = id ?? `${autoId}-input`;
    const listId = `${autoId}-list`;
    const searchSeq = React.useRef(0);

    const commit = (next: string[]) => {
      if (valueProp === undefined) setInner(next);
      onValueChange?.(next);
    };

    /** Add values; returns the ones refused by `validate`. */
    const add = (raw: string[], fromSuggestion = false): string[] => {
      const refused: string[] = [];
      const next = [...value];
      for (const r of raw) {
        const v = r.trim();
        if (!v) continue;
        if (!fromSuggestion && (!allowCustom || (validate && !validate(v)))) {
          refused.push(v);
          continue;
        }
        if (!next.includes(v)) next.push(v);
      }
      if (next.length !== value.length) {
        commit(next);
        setAnnouncement(t.added(next.slice(value.length).join(", ")));
      }
      return refused;
    };

    const removeAt = (index: number) => {
      const v = value[index]!;
      commit(value.filter((_, i) => i !== index));
      setAnnouncement(t.removed(v));
      inputRef.current?.focus();
    };

    // Debounced async suggestions; stale responses are ignored.
    React.useEffect(() => {
      if (!search) return;
      const q = text.trim();
      if (!q) {
        setSuggestions([]);
        setOpen(false);
        return;
      }
      const seq = ++searchSeq.current;
      const handle = setTimeout(() => {
        setSearching(true);
        setOpen(true);
        search(q)
          .then((res) => {
            if (seq !== searchSeq.current) return;
            setSuggestions(res.filter((s) => !value.includes(s.value)));
            setActive(res.length > 0 ? 0 : -1);
          })
          .catch(() => {
            if (seq === searchSeq.current) setSuggestions([]);
          })
          .finally(() => {
            if (seq === searchSeq.current) setSearching(false);
          });
      }, 200);
      return () => clearTimeout(handle);
      // `value` is read only to hide chosen options.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [text, search]);

    const submitText = () => {
      const refused = add([text]);
      if (refused.length > 0) setInvalid(true);
      else {
        setText("");
        setInvalid(false);
      }
    };

    const pick = (s: ChipSuggestion) => {
      add([s.value], true);
      setText("");
      setInvalid(false);
      setOpen(false);
      setSuggestions([]);
      inputRef.current?.focus();
    };

    const listVisible = open && !!search && text.trim() !== "";

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;
      if (listVisible && suggestions.length > 0 && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        e.preventDefault();
        const delta = e.key === "ArrowDown" ? 1 : -1;
        setActive((i) => (i + delta + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === "Enter") {
        if (listVisible && active >= 0 && suggestions[active]) {
          e.preventDefault();
          pick(suggestions[active]!);
          return;
        }
        if (text.trim()) {
          e.preventDefault();
          submitText();
        }
        return;
      }
      if (e.key === "," || e.key === ";") {
        if (text.trim()) {
          e.preventDefault();
          submitText();
        } else e.preventDefault();
        return;
      }
      if (e.key === "Escape" && listVisible) {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key === "Backspace" && text === "" && value.length > 0) {
        e.preventDefault();
        removeAt(value.length - 1);
      }
    };

    const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      const data = e.clipboardData.getData("text");
      if (!SEPARATORS.test(data)) return;
      e.preventDefault();
      const refused = add(data.split(SEPARATORS));
      setText(refused.join(", "));
      setInvalid(refused.length > 0);
    };

    const showInvalid = invalid || ariaInvalid === true || ariaInvalid === "true";

    return (
      <Popover open={listVisible} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div
            data-slot="chip-input"
            data-disabled={disabled || undefined}
            onClick={() => inputRef.current?.focus()}
            className={cn(
              "flex w-full flex-wrap items-center gap-1 px-1.5 py-1",
              size === "sm" ? "min-h-control-sm" : size === "lg" ? "min-h-control-lg" : "min-h-control-md",
              controlFrame,
              controlFocusWithin,
              controlInvalidWithin,
              disabled && "cursor-not-allowed opacity-60",
              className,
            )}
          >
            {value.map((v, i) => (
              <span
                key={v}
                data-slot="chip-input-chip"
                className="inline-flex max-w-full items-center gap-1 !rounded-md bg-mist py-0.5 pr-0.5 pl-2 text-ui-label font-medium text-mist-ink"
              >
                <span className="min-w-0 truncate">{renderChip ? renderChip(v) : v}</span>
                <button
                  type="button"
                  data-slot="chip-input-remove"
                  aria-label={t.remove(v)}
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAt(i);
                  }}
                  className={cn(
                    "inline-flex size-5 shrink-0 cursor-pointer items-center justify-center !rounded-sm hover:bg-ui-surface disabled:cursor-not-allowed",
                    focusRing,
                  )}
                >
                  <X className="size-3" aria-hidden />
                </button>
              </span>
            ))}
            <input
              ref={inputRef}
              id={inputId}
              type="text"
              role={search ? "combobox" : undefined}
              aria-expanded={search ? listVisible : undefined}
              aria-controls={search && listVisible ? listId : undefined}
              aria-autocomplete={search ? "list" : undefined}
              aria-activedescendant={
                listVisible && active >= 0 && suggestions[active] ? `${listId}-${active}` : undefined
              }
              aria-invalid={showInvalid || undefined}
              autoComplete="off"
              disabled={disabled}
              placeholder={value.length === 0 ? placeholder : undefined}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setInvalid(false);
              }}
              onKeyDown={handleKeyDown}
              onPaste={onPaste}
              onBlur={(e) => {
                onBlur?.(e);
                // Typed text becomes a chip when focus leaves (unless picking).
                if (text.trim() && !listVisible) submitText();
              }}
              className={cn(
                "min-w-24 flex-1 bg-transparent px-1 py-0.5 text-ui-control text-ink-1 outline-none placeholder:text-ink-4 disabled:cursor-not-allowed",
                inputClassName,
              )}
              {...props}
            />
            <span role="status" className="sr-only">
              {showInvalid && text ? t.invalid(text.trim()) : announcement}
            </span>
          </div>
        </PopoverAnchor>
        <PopoverContent
          align="start"
          className="w-(--radix-popover-trigger-width) min-w-56 p-1"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            if (e.target instanceof Node && inputRef.current?.parentElement?.contains(e.target))
              e.preventDefault();
          }}
        >
          <ul id={listId} role="listbox" aria-label={t.suggestions} className="max-h-60 overflow-y-auto">
            {searching && suggestions.length === 0 ? (
              <li className="flex items-center gap-2 px-2 py-1.5 text-ui-label text-ink-3">
                <Spinner className="size-3.5" /> {t.loading}
              </li>
            ) : suggestions.length === 0 ? (
              <li className="px-2 py-1.5 text-ui-label text-ink-3">{t.noResults}</li>
            ) : (
              suggestions.map((s, i) => (
                <li
                  key={s.value}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(s)}
                  className={cn(
                    "flex cursor-pointer flex-col !rounded-md px-2 py-1.5",
                    i === active && "bg-mist",
                  )}
                >
                  <span className="text-ui-body font-medium text-ink-1">{s.label}</span>
                  {s.description ? (
                    <span className="text-ui-helper text-ink-3">{s.description}</span>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </PopoverContent>
      </Popover>
    );
  },
);
ChipInput.displayName = "ChipInput";
