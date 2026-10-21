import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../lib/cn";
import { Slot } from "../lib/Slot";
import { Spinner } from "./Spinner";

const buttonVariants = cva(
  "inline-flex justify-center items-center gap-1.5 disabled:opacity-60 outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-ui-surface font-bold whitespace-nowrap motion-safe:active:scale-[0.97] transition-[transform,background,box-shadow,color] duration-150 ease-tj-out cursor-pointer disabled:pointer-events-none select-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        solid:
          "bg-brand-solid text-on-brand shadow-tj-brand hover:bg-brand-solid-hover disabled:bg-brand-disabled disabled:shadow-none !rounded-lg",
        outline:
          "border-[1.5px] border-brand/40 bg-transparent text-brand-ink hover:bg-mist !rounded-lg",
        ghost:
          "bg-transparent text-ink-2 hover:bg-mist hover:text-brand-ink !rounded-lg",
        subtle:
          "bg-ui-surface-2 border border-hairline text-ink-2 hover:text-ink-1 !rounded-lg",
        danger:
          "bg-danger-solid text-on-brand hover:opacity-90 focus-visible:ring-tj-error/50 shadow-tj-sm !rounded-lg",
        link: "bg-transparent text-brand-ink underline-offset-4 hover:underline shadow-none px-0 h-auto active:scale-100 !rounded-none",
      },
      // Heights follow the density tokens (--tj-control-*).
      size: {
        sm: "h-control-sm px-3 text-ui-label !rounded-lg",
        md: "h-control-md px-4 text-ui-control !rounded-xl",
        lg: "h-control-lg px-4 text-ui-title !rounded-xl",
        /** Primary POS actions (Pay, Checkout) — 48px+ in every density. */
        xl: "min-h-12 h-[calc(var(--tj-control-lg)+8px)] px-5 text-base !rounded-xl",
        icon: "size-control-md !rounded-xl p-0",
        "icon-sm": "size-control-sm !rounded-lg p-0",
        "icon-lg": "size-control-lg !rounded-xl p-0",
      },
      radius: {
        none: "!rounded-none",
        sm: "!rounded-sm",
        md: "!rounded-md",
        lg: "!rounded-lg",
        xl: "!rounded-xl",
        full: "!rounded-full",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "sm",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    /** Spinner replaces the left icon and disables the button. */
    loading?: boolean;
    iconLeft?: React.ReactNode;
    iconRight?: React.ReactNode;
    /**
     * Render the single child element (e.g. a Link/anchor) with the button's
     * styling instead of a native `<button>`. When set, `loading` / `iconLeft` /
     * `iconRight` are ignored — compose those inside the child element.
     */
    asChild?: boolean;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      radius,
      type = "button",
      loading = false,
      iconLeft,
      iconRight,
      asChild = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const classes = cn(buttonVariants({ variant, size, radius }), className);

    if (asChild) {
      return (
        <Slot
          ref={ref as React.Ref<HTMLElement>}
          data-slot="button"
          className={classes}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        data-slot="button"
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={classes}
        {...props}
      >
        {loading ? <Spinner className="size-4 text-current" /> : iconLeft}
        {children}
        {iconRight}
      </button>
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
