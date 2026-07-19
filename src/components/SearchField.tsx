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
          "relative flex items-center bg-ui-surface-2 border border-hairline !rounded-lg w-full h-9 text-ink-1 transition-colors duration-150",
          "focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/30",
          disabled && "cursor-not-allowed opacity-60",
          className,
        )}
      >
        <Search className="left-3 absolute size-4 text-ink-3 pointer-events-none" />
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
            "bg-transparent pr-9 pl-9 outline-none w-full h-full font-medium text-[14px] text-ink-1",
            "placeholder:font-normal placeholder:text-ink-3",
            "disabled:cursor-not-allowed",
            "[&::-webkit-search-cancel-button]:appearance-none",
          )}
          {...props}
        />
        {loading ? (
          <Loader2 className="right-3 absolute size-4 text-ink-3 animate-spin" />
        ) : current ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={clear}
            disabled={disabled}
            className="inline-flex right-2 absolute justify-center items-center hover:bg-mist !rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand/30 size-5 text-ink-3 hover:text-ink-1 transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>
    );
  },
);
SearchField.displayName = "SearchField";
