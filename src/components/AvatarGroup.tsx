import * as React from "react";

import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import { focusRing } from "../lib/control";
import { Avatar, AvatarFallback, AvatarImage, initialsOf, type AvatarProps } from "./Avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";
import { useMessages } from "./TajUIProvider";

export const avatarGroupMessages = defineMessages("avatarGroup", {
  ru: {
    more: (n: number) => `и ещё ${n}`,
  },
  tg: {
    more: (n: number) => `ва боз ${n}`,
  },
  en: {
    more: (n: number) => `and ${n} more`,
  },
});

export type AvatarGroupLabels = (typeof avatarGroupMessages.locales)["ru"];

export interface AvatarGroupItem {
  name: string;
  src?: string | null;
}

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLSpanElement> {
  avatars: AvatarGroupItem[];
  /** Avatars shown before "+N". Defaults to 3. */
  max?: number;
  size?: AvatarProps["size"];
  /** Show the names tooltip. Defaults to true. */
  tooltip?: boolean;
  labels?: Partial<AvatarGroupLabels>;
}

const overlap: Record<NonNullable<AvatarProps["size"]>, string> = {
  xs: "-ml-1.5",
  sm: "-ml-2",
  md: "-ml-2.5",
  lg: "-ml-3",
  xl: "-ml-4",
};

/**
 * Overlapping avatars of assignees or participants with a "+N" counter. The
 * full list of names is the accessible name and the tooltip.
 */
export const AvatarGroup = React.forwardRef<HTMLSpanElement, AvatarGroupProps>(
  ({ avatars, max = 3, size = "sm", tooltip = true, labels, className, ...props }, ref) => {
    const t = useMessages(avatarGroupMessages, labels);
    const shown = avatars.slice(0, Math.max(0, max));
    const rest = avatars.length - shown.length;
    const names = avatars.map((a) => a.name).join(", ");
    const label =
      rest > 0 ? `${shown.map((a) => a.name).join(", ")} ${t.more(rest)}` : names;

    const group = (
      <span
        ref={ref}
        role="img"
        aria-label={label}
        tabIndex={tooltip && avatars.length > 0 ? 0 : undefined}
        data-slot="avatar-group"
        className={cn("inline-flex items-center !rounded-full", tooltip && focusRing, className)}
        {...props}
      >
        {shown.map((a, i) => (
          <Avatar
            key={`${a.name}-${i}`}
            size={size}
            aria-hidden
            className={cn("ring-2 ring-ui-surface", i > 0 && overlap[size])}
          >
            {a.src ? <AvatarImage src={a.src} alt="" /> : null}
            <AvatarFallback>{initialsOf(a.name)}</AvatarFallback>
          </Avatar>
        ))}
        {rest > 0 ? (
          <Avatar
            size={size}
            aria-hidden
            data-slot="avatar-group-more"
            className={cn("ring-2 ring-ui-surface", shown.length > 0 && overlap[size])}
          >
            <AvatarFallback className="bg-ui-surface-2 text-ink-2">+{rest}</AvatarFallback>
          </Avatar>
        ) : null}
      </span>
    );

    if (!tooltip || avatars.length === 0) return group;
    return (
      <Tooltip>
        <TooltipTrigger asChild>{group}</TooltipTrigger>
        <TooltipContent>
          <ul className="flex flex-col gap-0.5">
            {avatars.map((a, i) => (
              <li key={`${a.name}-${i}`}>{a.name}</li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    );
  },
);
AvatarGroup.displayName = "AvatarGroup";
