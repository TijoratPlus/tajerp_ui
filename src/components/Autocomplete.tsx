import { Check, ChevronDown, Loader2 } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";
import { Input } from "./Input";
import { Popover, PopoverAnchor, PopoverContent } from "./Popover";
import type { SelectOption } from "./Select";

export type { SelectOption } from "./Select";

const defaultFilter = (option: SelectOption, query: string) =>
  option.label.toLowerCase().includes(query.trim().toLowerCase());

export interface AutocompleteProps {
  options: SelectOption[];
  /** Controlled selected value. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Controlled text in the field. */
  inputValue?: string;
  onInputChange?: (value: string) => void;
  placeholder?: string;
  /** Predicate to match an option against the typed query. */
  filter?: (option: SelectOption, query: string) => boolean;
  loading?: boolean;
  emptyMessage?: React.ReactNode;
  /** Allow committing free text that doesn't match any option. */
  allowCustomValue?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

/** Text field with a filtered listbox of suggestions and keyboard navigation. */
export const Autocomplete = React.forwardRef<
  HTMLInputElement,
  AutocompleteProps
>(
  (
    {
      options,
      value,
      defaultValue,
      onChange,
      inputValue,
      onInputChange,
      placeholder,
      filter = defaultFilter,
      loading = false,
      emptyMessage = "No results",
      allowCustomValue = false,
      disabled,
      className,
      id,
    },
    ref,
  ) => {
    const reactId = React.useId();
    const listId = id ?? reactId;

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
    const [internalInput, setInternalInput] = React.useState(
      labelFor(defaultValue ?? "") || defaultValue || "",
    );
    const text = isInputControlled ? inputValue : internalInput;

    const [open, setOpen] = React.useState(false);
    const [active, setActive] = React.useState(0);

    const innerRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    const filtered = React.useMemo(
      () => (text.trim() ? options.filter((o) => filter(o, text)) : options),
      [options, text, filter],
    );

    const setText = (next: string) => {
      if (!isInputControlled) setInternalInput(next);
      onInputChange?.(next);
    };

    const commit = (option: SelectOption) => {
      if (option.disabled) return;
      if (!isValueControlled) setInternalValue(option.value);
      onChange?.(option.value);
      setText(option.label);
      setOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (!open) setOpen(true);
          else setActive((i) => Math.min(filtered.length - 1, i + 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActive((i) => Math.max(0, i - 1));
          break;
        case "Enter": {
          const option = filtered[active];
          if (open && option) {
            e.preventDefault();
            commit(option);
          } else if (allowCustomValue && text.trim()) {
            if (!isValueControlled) setInternalValue(text);
            onChange?.(text);
            setOpen(false);
          }
          break;
        }
        case "Escape":
          setOpen(false);
          break;
      }
    };

    return (
      <Popover open={open && !disabled} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div className={cn("relative", className)} data-slot="autocomplete">
            <Input
              ref={innerRef}
              role="combobox"
              aria-expanded={open}
              aria-controls={`${listId}-listbox`}
              aria-autocomplete="list"
              aria-activedescendant={
                open && filtered[active] ? `${listId}-opt-${active}` : undefined
              }
              value={text}
              placeholder={placeholder}
              disabled={disabled}
              autoComplete="off"
              className="pr-9"
              onChange={(e) => {
                setText(e.target.value);
                setActive(0);
                if (!open) setOpen(true);
              }}
              onFocus={() => !disabled && setOpen(true)}
              onKeyDown={handleKeyDown}
            />
            <span className="top-1/2 right-3 absolute text-ink-3 -translate-y-1/2 pointer-events-none">
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
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
          className="p-1 w-[var(--radix-popover-trigger-width)] max-h-64 overflow-y-auto"
        >
          <ul
            role="listbox"
            id={`${listId}-listbox`}
            className="flex flex-col gap-0.5"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-[13px] text-ink-3">
                {loading ? "Loading…" : emptyMessage}
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
                    aria-disabled={option.disabled}
                    onPointerDown={(e) => e.preventDefault()}
                    onPointerEnter={() => setActive(i)}
                    onClick={() => commit(option)}
                    className={cn(
                      "flex justify-between items-center gap-2 px-3 py-2 rounded-lg font-medium text-[13.5px] text-ink-1 cursor-pointer",
                      isActive && "bg-mist text-mist-ink",
                      option.disabled && "pointer-events-none opacity-50",
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected ? (
                      <Check className="size-4 text-brand shrink-0" />
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
