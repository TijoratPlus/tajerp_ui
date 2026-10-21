import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as React from "react";

import { cn } from "../lib/cn";

const avatarSizes = {
  xs: "size-6 text-ui-micro",
  sm: "size-8 text-ui-caption",
  md: "size-9 text-sm",
  lg: "size-12 text-base",
  xl: "size-16 text-lg",
} as const;

export type AvatarProps = React.ComponentPropsWithoutRef<
  typeof AvatarPrimitive.Root
> & {
  size?: keyof typeof avatarSizes;
};

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size = "md", ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    data-slot="avatar"
    className={cn(
      "relative flex shrink-0 overflow-hidden !rounded-full",
      avatarSizes[size],
      className,
    )}
    {...props}
  />
));
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    data-slot="avatar-image"
    className={cn("aspect-square size-full object-cover", className)}
    {...props}
  />
));
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    data-slot="avatar-fallback"
    className={cn(
      "flex size-full items-center justify-center !rounded-full bg-mist text-mist-ink font-bold",
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";

/** Initials for an avatar fallback: "Зарина Каримова" → "ЗК". */
function initialsOf(name: string, max = 2): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, max)
    .map((part) => part[0]!.toLocaleUpperCase())
    .join("");
}

export { Avatar, AvatarImage, AvatarFallback, initialsOf };
