import { Search, X } from "lucide-react";
import * as React from "react";

import type { ControlSize } from "../lib/control";
import { cn } from "../lib/cn";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./InputGroup";
import { Spinner } from "./Spinner";
import { useCommonMessages } from "./TajUIProvider";

export type SearchFieldProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "type" | "size"
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
  /** Control height (density-aware). Defaults to "md". */
  size?: ControlSize;
  /** Accessible name of the clear button. Defaults to the locale's. */
  clearLabel?: string;
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
      placeholder,
      onKeyDown,
      size = "md",
      clearLabel,
      ...props
    },
    ref,
  ) => {
    const t = useCommonMessages();
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
      <InputGroup
        data-slot="search-field"
        size={size}
        disabled={disabled}
        className={className}
      >
        <InputGroupAddon>
          <Search aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          ref={innerRef}
          type="search"
          value={current}
          disabled={disabled}
          placeholder={placeholder ?? t.search}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearch?.(current);
            if (e.key === "Escape" && current) {
              e.preventDefault();
              clear();
            }
            onKeyDown?.(e);
          }}
          className="pl-2 pr-1"
          {...props}
        />
        {loading ? (
          <InputGroupAddon>
            <Spinner className="size-4 text-current" />
          </InputGroupAddon>
        ) : current ? (
          <button
            type="button"
            aria-label={clearLabel ?? t.clearSearch}
            onClick={clear}
            disabled={disabled}
            className={cn(
              "mr-1.5 inline-flex size-6 shrink-0 items-center justify-center !rounded-full text-ink-3 outline-none transition-colors cursor-pointer",
              "hover:bg-mist hover:text-ink-1 focus-visible:ring-2 focus-visible:ring-focus",
            )}
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
      </InputGroup>
    );
  },
);
SearchField.displayName = "SearchField";
