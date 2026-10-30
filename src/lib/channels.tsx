import {
  MessageCircle,
  MessageSquareText,
  Send,
  Smartphone,
} from "lucide-react";
import * as React from "react";

import type { Locale } from "../i18n/locale";

/** Channel a conversation or message goes through. */
export type ChatChannel =
  "telegram" | "whatsapp" | "sms" | "app" | "instagram" | "messenger";

type IconProps = React.SVGProps<SVGSVGElement> & { className?: string };

/** Shared lucide-style frame (24px grid, 2px round stroke). */
function StrokeIcon({
  children,
  ...props
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

/**
 * Instagram glyph (camera outline). lucide-react 1.x dropped brand icons, so
 * the two Meta channels draw their own in the same stroke style.
 */
export function InstagramGlyph(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </StrokeIcon>
  );
}

/** Messenger glyph (speech bubble with a zig-zag bolt). */
export function MessengerGlyph(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M12 2.5c-5.25 0-9.5 3.93-9.5 8.78 0 2.6 1.22 4.93 3.15 6.53V21.5l3.2-1.77c1 .28 2.06.43 3.15.43 5.25 0 9.5-3.93 9.5-8.78S17.25 2.5 12 2.5Z" />
      <path d="m7.5 13.5 3-3.25 2.25 2 3.75-3.75" />
    </StrokeIcon>
  );
}

export const CHANNEL_ICONS: Record<
  ChatChannel,
  React.ComponentType<{ className?: string }>
> = {
  telegram: Send,
  whatsapp: MessageCircle,
  sms: MessageSquareText,
  app: Smartphone,
  instagram: InstagramGlyph,
  messenger: MessengerGlyph,
};

/** Channel names per locale (product names stay untranslated). */
export const CHANNEL_LABELS: Record<Locale, Record<ChatChannel, string>> = {
  ru: {
    telegram: "Telegram",
    whatsapp: "WhatsApp",
    sms: "SMS",
    app: "Приложение",
    instagram: "Instagram",
    messenger: "Messenger",
  },
  tg: {
    telegram: "Telegram",
    whatsapp: "WhatsApp",
    sms: "SMS",
    app: "Барнома",
    instagram: "Instagram",
    messenger: "Messenger",
  },
  en: {
    telegram: "Telegram",
    whatsapp: "WhatsApp",
    sms: "SMS",
    app: "App",
    instagram: "Instagram",
    messenger: "Messenger",
  },
};

/** Parse a message time. ISO-like strings become dates; "14:05" stays text. */
export function parseChatTime(time: Date | number | string): Date | null {
  if (time instanceof Date) return Number.isNaN(time.getTime()) ? null : time;
  if (typeof time === "number") return new Date(time);
  if (/^\d{4}-\d{2}-\d{2}/.test(time)) {
    // Frappe sends "2026-10-30 14:05:00" (a space, no zone): read it as local time.
    const d = new Date(time.includes("T") ? time : time.replace(" ", "T"));
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}
