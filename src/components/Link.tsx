import { cva, type VariantProps } from "class-variance-authority";
import { ArrowUpRight } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";
import { Slot } from "../lib/Slot";

const linkVariants = cva(
  "inline-flex items-center gap-1 !rounded-sm outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-focus",
  {
    variants: {
      variant: {
        default: "text-brand-ink hover:text-brand",
        subtle: "text-ink-2 hover:text-brand-ink",
        muted: "text-ink-3 hover:text-ink-1",
      },
      underline: {
        hover: "no-underline hover:underline",
        always: "underline",
        none: "no-underline",
      },
    },
    defaultVariants: {
      variant: "default",
      underline: "hover",
    },
  },
);

export type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> &
  VariantProps<typeof linkVariants> & {
    /** Open in a new tab and append an external-link icon. */
    external?: boolean;
    /**
     * Style your router's link component instead of rendering an `<a>`:
     * `<Link asChild><NavLink to="/pos">Касса</NavLink></Link>`.
     */
    asChild?: boolean;
  };

/** Styled anchor with brand variants and optional external-link affordance. */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (
    { className, variant, underline, external, children, target, rel, asChild, ...props },
    ref,
  ) =>
    asChild ? (
      <Slot
        ref={ref as React.Ref<HTMLElement>}
        data-slot="link"
        className={cn(linkVariants({ variant, underline }), className)}
        {...props}
      >
        {children}
      </Slot>
    ) : (
    <a
      ref={ref}
      data-slot="link"
      target={external ? "_blank" : target}
      rel={external ? "noreferrer noopener" : rel}
      className={cn(linkVariants({ variant, underline }), className)}
      {...props}
    >
      {children}
      {external ? <ArrowUpRight className="size-[1em]" aria-hidden /> : null}
    </a>
    ),
);
Link.displayName = "Link";

export { linkVariants };
