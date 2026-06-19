import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

const buttonVariants = cva(
  "inline-flex justify-center items-center gap-2 disabled:opacity-60 outline-none focus-visible:ring-2 focus-visible:ring-brand/50 font-bold whitespace-nowrap active:scale-[0.97] transition-[transform,background,box-shadow,color] duration-150 ease-tj-out disabled:pointer-events-none select-none",
  {
    variants: {
      variant: {
        solid:
          "bg-brand text-on-brand shadow-tj-brand hover:bg-brand-ink disabled:bg-brand-disabled disabled:shadow-none",
        outline:
          "border-[1.5px] border-brand/40 bg-transparent text-brand-ink hover:bg-mist",
        ghost: "bg-transparent text-ink-2 hover:bg-mist hover:text-brand-ink",
        subtle:
          "bg-ui-surface-2 border border-hairline text-ink-2 hover:text-ink-1",
        danger: "bg-tj-error text-white hover:opacity-90 shadow-tj-sm",
      },
      size: {
        sm: "h-9 px-3.5 text-[13px] rounded-lg",
        md: "h-11 px-5 text-[15px] rounded-lg",
        lg: "h-12 px-6 text-base rounded-xl",
        icon: "h-10 w-10 rounded-xl p-0",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    /** Spinner replaces the left icon and disables the button. */
    loading?: boolean;
    iconLeft?: React.ReactNode;
    iconRight?: React.ReactNode;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      type = "button",
      loading = false,
      iconLeft,
      iconRight,
      disabled,
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : iconLeft}
      {children}
      {iconRight}
    </button>
  ),
);
Button.displayName = "Button";

export { buttonVariants };
