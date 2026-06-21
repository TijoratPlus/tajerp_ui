import { Loader2, Search, X } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

export type SearchFieldProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "type"
> & {
  value?: string;
  defaultValue?: string;
  /** Fires on every keystroke with the new value. */
  onValueChange?: (value: string) => void;
  /** Fires when the clear (×) button is pressed. */
  onClear?: () => void;
  /** Fires when Enter is pressed, with the current value. */
  onSearch?: (value: string) => void;
  /** Swap the clear button for a spinner. */
  loading?: boolean;
};

/** Text input pre-wired for search: leading icon + clear button + Enter handler. */
export const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
  (
    {
      className,
      value,
      defaultValue,
      onValueChange,
      onClear,
      onSearch,
      loading,
      disabled,
      placeholder = "Search…",
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState(defaultValue ?? "");
    const current = isControlled ? value : internal;

    const innerRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    const setValue = (next: string) => {
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    };

    const clear = () => {
      setValue("");
      onClear?.();
      innerRef.current?.focus();
    };

    return (
      <div
        data-slot="search-field"
        className={cn(
          "relative flex h-11 w-full items-center rounded-md border border-hairline bg-ui-surface-2 text-ink-1 transition-colors duration-150",
          "focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/30",
          disabled && "cursor-not-allowed opacity-60",
          className,
        )}
      >
        <Search className="pointer-events-none absolute left-3.5 size-4 text-ink-3" />
        <input
          ref={innerRef}
          type="search"
          value={current}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearch?.(current);
            onKeyDown?.(e);
          }}
          className={cn(
            "h-full w-full bg-transparent pl-10 pr-10 text-[14px] font-medium text-ink-1 outline-none",
            "placeholder:font-normal placeholder:text-ink-3",
            "disabled:cursor-not-allowed",
            "[&::-webkit-search-cancel-button]:appearance-none",
          )}
          {...props}
        />
        {loading ? (
          <Loader2 className="absolute right-3.5 size-4 animate-spin text-ink-3" />
        ) : current ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={clear}
            disabled={disabled}
            className="absolute right-2.5 inline-flex size-6 items-center justify-center rounded-full text-ink-3 outline-none transition-colors hover:bg-mist hover:text-ink-1 focus-visible:ring-2 focus-visible:ring-brand/30"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>
    );
  },
);
SearchField.displayName = "SearchField";
