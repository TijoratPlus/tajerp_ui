import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";
import { Slot } from "../lib/Slot";

const buttonVariants = cva(
  "inline-flex justify-center items-center gap-1.5 disabled:opacity-60 outline-none focus-visible:ring-2 focus-visible:ring-brand/50 font-bold whitespace-nowrap active:scale-[0.97] transition-[transform,background,box-shadow,color] duration-150 ease-tj-out cursor-pointer disabled:pointer-events-none select-none",
  {
    variants: {
      variant: {
        solid:
          "bg-brand text-on-brand shadow-tj-brand hover:bg-brand-ink disabled:bg-brand-disabled disabled:shadow-none !rounded-lg",
        outline:
          "border-[1.5px] border-brand/40 bg-transparent text-brand-ink hover:bg-mist !rounded-lg",
        ghost:
          "bg-transparent text-ink-2 hover:bg-mist hover:text-brand-ink !rounded-lg",
        subtle:
          "bg-ui-surface-2 border border-hairline text-ink-2 hover:text-ink-1 !rounded-lg",
        danger:
          "bg-tj-error text-white hover:opacity-90 shadow-tj-sm !rounded-lg",
        link: "bg-transparent text-brand-ink underline-offset-4 hover:underline shadow-none px-0 h-auto active:scale-100 !rounded-none",
      },
      size: {
        sm: "h-8 px-3 text-[13px] !rounded-lg",
        md: "h-9 px-4 text-[14px] !rounded-xl",
        lg: "h-10 px-4 text-[15px] !rounded-xl",
        icon: "h-9 w-9 !rounded-xl p-0",
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
        disabled={disabled || loading}
        className={classes}
        {...props}
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : iconLeft}
        {children}
        {iconRight}
      </button>
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
