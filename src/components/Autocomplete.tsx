import { Check, ChevronDown } from "lucide-react";
import * as React from "react";

import type { ControlSize } from "../lib/control";
import { cn } from "../lib/cn";
import { Input } from "./Input";
import { Popover, PopoverAnchor, PopoverContent } from "./Popover";
import type { SelectOption } from "./Select";
import { Spinner } from "./Spinner";
import { useCommonMessages } from "./TajUIProvider";

export type { SelectOption } from "./Select";

const defaultFilter = (option: SelectOption, query: string) =>
  option.label.toLowerCase().includes(query.trim().toLowerCase());

export interface AutocompleteProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "defaultValue" | "onChange" | "size" | "children"
  > {
  options: SelectOption[];
  /** Controlled selected value. */
  value?: string;
  defaultValue?: string;
  /** Fires with the committed option value (or free text with allowCustomValue). */
  onValueChange?: (value: string) => void;
  /** @deprecated Use `onValueChange`. */
  onChange?: (value: string) => void;
  /** Controlled text in the field. */
  inputValue?: string;
  onInputChange?: (value: string) => void;
  placeholder?: string;
  /** Predicate to match an option against the typed query. */
  filter?: (option: SelectOption, query: string) => boolean;
  loading?: boolean;
  /** Shown when nothing matches. Defaults to the locale's "No results". */
  emptyMessage?: React.ReactNode;
  /** Allow committing free text that doesn't match any option. */
  allowCustomValue?: boolean;
  size?: ControlSize;
  /** Classes for the wrapper. Use `inputClassName` for the input itself. */
  className?: string;
  inputClassName?: string;
}

/**
 * Text field with a filtered listbox of suggestions and keyboard navigation
 * (WAI-ARIA combobox). Props not listed here (`id`, `name`, `aria-*`,
 * `onBlur`, …) go to the input, so `<Label htmlFor>` and `FormControl` work.
 */
export const Autocomplete = React.forwardRef<
  HTMLInputElement,
  AutocompleteProps
>(
  (
    {
      options,
      value,
      defaultValue,
      onValueChange,
      onChange,
      inputValue,
      onInputChange,
      placeholder,
      filter = defaultFilter,
      loading = false,
      emptyMessage,
      allowCustomValue = false,
      disabled,
      size,
      className,
      inputClassName,
      onBlur,
      onFocus,
      onKeyDown,
      ...inputProps
    },
    ref,
  ) => {
    const t = useCommonMessages();
    const listId = React.useId();

    const isValueControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState(
      defaultValue ?? "",
    );
    const selectedValue = isValueControlled ? value : internalValue;

    const labelFor = React.useCallback(
      (val: string) => options.find((o) => o.value === val)?.label ?? "",
      [options],
    );

    const isInputControlled = inputValue !== undefined;
    const [internalInput, setInternalInput] = React.useState(() => {
      const initial = value ?? defaultValue ?? "";
      return labelFor(initial) || initial;
    });
    const text = isInputControlled ? inputValue : internalInput;

    const [open, setOpen] = React.useState(false);
    const [active, setActive] = React.useState(-1);

    const innerRef = React.useRef<HTMLInputElement>(null);
    const anchorRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    const setText = React.useCallback(
      (next: string) => {
        if (!isInputControlled) setInternalInput(next);
        onInputChange?.(next);
      },
      [isInputControlled, onInputChange],
    );

    // A new controlled value (or new options) re-syncs the visible label.
    const syncedValue = React.useRef(selectedValue);
    React.useEffect(() => {
      if (syncedValue.current === selectedValue) return;
      syncedValue.current = selectedValue;
      const label = labelFor(selectedValue);
      if (label || !allowCustomValue) setText(label || selectedValue);
    }, [selectedValue, labelFor, allowCustomValue, setText]);

    const keepOpenOnAnchorInteraction = (e: Event) => {
      const target = e.target as Node | null;
      if (target && anchorRef.current?.contains(target)) {
        e.preventDefault();
      }
    };

    const filtered = React.useMemo(
      () => (text.trim() ? options.filter((o) => filter(o, text)) : options),
      [options, text, filter],
    );

    const firstEnabled = React.useCallback(
      (from: number, dir: 1 | -1) => {
        for (let i = from; i >= 0 && i < filtered.length; i += dir) {
          if (!filtered[i].disabled) return i;
        }
        return -1;
      },
      [filtered],
    );

    const openList = () => {
      if (disabled) return;
      setOpen(true);
      setActive(firstEnabled(0, 1));
    };

    // Keep the keyboard-highlighted option visible in the scrolling list.
    React.useEffect(() => {
      if (!open || active < 0) return;
      document
        .getElementById(`${listId}-opt-${active}`)
        ?.scrollIntoView({ block: "nearest" });
    }, [open, active, listId]);

    const emit = (next: string) => {
      syncedValue.current = next;
      if (!isValueControlled) setInternalValue(next);
      onValueChange?.(next);
      onChange?.(next);
    };

    const commit = (option: SelectOption) => {
      if (option.disabled) return;
      emit(option.value);
      setText(option.label);
      setOpen(false);
    };

    const move = (dir: 1 | -1) => {
      setActive((i) => {
        const start = i < 0 ? (dir === 1 ? 0 : filtered.length - 1) : i + dir;
        const next = firstEnabled(start, dir);
        return next === -1 ? i : next;
      });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(e);
      if (disabled || e.defaultPrevented) return;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (!open) openList();
          else move(1);
          break;
        case "ArrowUp":
          e.preventDefault();
          if (open) move(-1);
          break;
        case "Home":
          if (open) {
            e.preventDefault();
            setActive(firstEnabled(0, 1));
          }
          break;
        case "End":
          if (open) {
            e.preventDefault();
            setActive(firstEnabled(filtered.length - 1, -1));
          }
          break;
        case "Enter": {
          const option = active >= 0 ? filtered[active] : undefined;
          if (open && option) {
            e.preventDefault();
            commit(option);
          } else if (allowCustomValue && text.trim()) {
            emit(text);
            setOpen(false);
          }
          break;
        }
        case "Escape":
          if (open) {
            e.preventDefault();
            setOpen(false);
          }
          break;
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      onBlur?.(e);
      // Without free text, an uncommitted query reverts to the selection.
      if (!allowCustomValue) {
        const label = labelFor(selectedValue);
        if (text !== label) setText(label);
      }
    };

    const activeOption = open && active >= 0 ? filtered[active] : undefined;

    return (
      <Popover open={open && !disabled} onOpenChange={setOpen} modal={false}>
        <PopoverAnchor asChild>
          <div
            ref={anchorRef}
            className={cn("relative", className)}
            data-slot="autocomplete"
          >
            <Input
              ref={innerRef}
              role="combobox"
              aria-expanded={open}
              aria-controls={`${listId}-listbox`}
              aria-autocomplete="list"
              aria-activedescendant={
                activeOption ? `${listId}-opt-${active}` : undefined
              }
              value={text}
              placeholder={placeholder}
              disabled={disabled}
              autoComplete="off"
              size={size}
              className={cn("pr-9", inputClassName)}
              {...inputProps}
              onChange={(e) => {
                setText(e.target.value);
                if (!open) setOpen(true);
                setActive(-1);
              }}
              onFocus={(e) => {
                onFocus?.(e);
                openList();
              }}
              onMouseDown={() => {
                if (!disabled && !open) openList();
              }}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
            />
            <span
              aria-hidden
              className="top-1/2 right-3 absolute text-ink-3 -translate-y-1/2 pointer-events-none"
            >
              {loading ? (
                <Spinner className="size-4 text-current" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </span>
          </div>
        </PopoverAnchor>

        <PopoverContent
          align="start"
          sideOffset={6}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={keepOpenOnAnchorInteraction}
          onPointerDownOutside={keepOpenOnAnchorInteraction}
          className="p-1 w-[var(--radix-popover-trigger-width)] max-h-64 overflow-y-auto"
        >
          <ul
            role="listbox"
            id={`${listId}-listbox`}
            className="flex flex-col gap-0.5"
          >
            {filtered.length === 0 ? (
              <li role="presentation" className="px-2.5 py-1.5 text-ui-label text-ink-3">
                {loading ? t.loading : (emptyMessage ?? t.noResults)}
              </li>
            ) : (
              filtered.map((option, i) => {
                const isActive = i === active;
                const isSelected = option.value === selectedValue;
                return (
                  <li
                    key={option.value}
                    id={`${listId}-opt-${i}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled || undefined}
                    onPointerDown={(e) => e.preventDefault()}
                    onPointerEnter={() => {
                      if (!option.disabled) setActive(i);
                    }}
                    onClick={() => commit(option)}
                    className={cn(
                      "flex justify-between items-center gap-1.5 px-2.5 py-1.5 min-h-8 !rounded-lg font-medium text-ui-body text-ink-1 cursor-pointer",
                      isActive && "bg-mist text-mist-ink",
                      option.disabled && "cursor-not-allowed opacity-50",
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected ? (
                      <Check className="size-4 text-brand shrink-0" aria-hidden />
                    ) : null}
                  </li>
                );
              })
            )}
          </ul>
        </PopoverContent>
      </Popover>
    );
  },
);
Autocomplete.displayName = "Autocomplete";
