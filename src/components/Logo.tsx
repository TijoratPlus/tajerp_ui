import * as React from "react";

export interface TajERPLogoProps {
  className?: string;
  "aria-hidden"?: boolean;
}

/**
 * Tijorat+ logomark — the green rounded-square "T+" speedline mark.
 * Same 550×550 viewBox used across TajERP front-ends.
 */
export function TajERPLogo({
  className,
  "aria-hidden": ariaHidden = true,
}: TajERPLogoProps) {
  return (
    <svg
      className={className}
      width="1em"
      height="1em"
      viewBox="0 0 550 550"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={ariaHidden}
    >
      <rect width="550" height="550" rx="150" fill="#1D9F6E" />
      <path
        d="M205.8 403L238.2 217H183.4L195 153H381L369.4 217H314.2L281.8 403H205.8ZM179 171L9.8 153H182.2L179 171ZM172.6 209.4L3 191.4H175.4L172.6 209.4ZM220.6 247.8L51 229.8H223.8L220.6 247.8ZM213.8 286.2L44.2 268.2H217L213.8 286.2ZM207 324.6L37.4 306.6H210.2L207 324.6ZM200.2 363L30.6 345H203.4L200.2 363ZM193.4 401.8L23.8 383.8H196.6L193.4 401.8Z"
        fill="white"
      />
      <path
        d="M312.708 319.48L321.408 269.368H372.912L382.656 215.428H429.984L420.24 269.368H472.092L463.392 319.48H411.54L401.796 373.768H354.468L364.212 319.48H312.708Z"
        fill="white"
      />
    </svg>
  );
}
