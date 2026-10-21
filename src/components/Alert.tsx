import { cva } from "class-variance-authority";
import {
  CircleAlert,
  CircleCheck,
  Info,
  Megaphone,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";
import * as React from "react";

import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import { focusRing } from "../lib/control";
import { useMessages } from "./TajUIProvider";

export const alertMessages = defineMessages("alert", {
  ru: {
    dismiss: "Закрыть уведомление",
    success: "Успешно",
    warning: "Внимание",
    danger: "Ошибка",
    info: "Информация",
  },
  tg: {
    dismiss: "Пӯшидани огоҳинома",
    success: "Бомуваффақият",
    warning: "Диққат",
    danger: "Хато",
    info: "Маълумот",
  },
  en: {
    dismiss: "Dismiss notice",
    success: "Success",
    warning: "Warning",
    danger: "Error",
    info: "Information",
  },
});

export type AlertMessages = (typeof alertMessages.locales)["ru"];

/** Tone vocabulary; `error` is accepted as an alias of `danger`. */
export type AlertTone =
  "brand" | "neutral" | "success" | "warning" | "danger" | "info" | "error";

type CanonicalTone = Exclude<AlertTone, "error">;

const canonical = (tone: AlertTone | undefined): CanonicalTone =>
  tone === "error" ? "danger" : (tone ?? "info");

const TONE_ICON: Record<CanonicalTone, LucideIcon> = {
  brand: Megaphone,
  neutral: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
  info: Info,
};

/** Live-region role: urgent tones interrupt, the rest are polite. */
function liveRole(tone: CanonicalTone, live: boolean | undefined) {
  if (!live) return undefined;
  return tone === "danger" || tone === "warning" ? "alert" : "status";
}

/** Screen-reader prefix so the tone is not conveyed by colour/icon alone. */
function tonePrefix(tone: CanonicalTone, t: AlertMessages): string | undefined {
  if (tone === "brand" || tone === "neutral") return undefined;
  return t[tone];
}

const alertVariants = cva(
  "relative flex w-full items-start gap-3 border !rounded-lg p-3 text-ui-body text-ink-1",
  {
    variants: {
      tone: {
        brand: "border-brand/30 bg-mist",
        neutral: "border-hairline bg-ui-surface-2",
        success: "border-tj-success/30 bg-tj-success/10",
        warning: "border-tj-warning/40 bg-tj-warning/12",
        danger: "border-tj-error/30 bg-tj-error/8",
        info: "border-tj-info/30 bg-tj-info/10",
      },
    },
    defaultVariants: { tone: "info" },
  },
);

const toneInk = cva("", {
  variants: {
    tone: {
      brand: "text-mist-ink",
      neutral: "text-ink-2",
      success: "text-tj-success-ink",
      warning: "text-tj-warning-ink",
      danger: "text-tj-error-ink",
      info: "text-tj-info-ink",
    },
  },
  defaultVariants: { tone: "info" },
});

const dismissClass = cn(
  "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center !rounded-md text-current opacity-80 transition-[opacity,background-color] hover:bg-ui-surface/60 hover:opacity-100 [[data-density=touch]_&]:size-11",
  focusRing,
);

function DismissButton({
  onDismiss,
  label,
  className,
}: {
  onDismiss: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      data-slot="alert-dismiss"
      aria-label={label}
      onClick={onDismiss}
      className={cn(dismissClass, className)}
    >
      <X className="size-4" aria-hidden />
    </button>
  );
}

function renderIcon(
  icon: React.ReactNode | false | undefined,
  tone: CanonicalTone,
  className: string,
) {
  if (icon === false || icon === null) return null;
  if (icon !== undefined) {
    return (
      <span
        aria-hidden
        className={cn("inline-flex shrink-0 [&>svg]:size-4", className)}
      >
        {icon}
      </span>
    );
  }
  const Icon = TONE_ICON[tone];
  return (
    <span aria-hidden className={cn("inline-flex shrink-0", className)}>
      <Icon className="size-4" aria-hidden />
    </span>
  );
}

export interface AlertProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  /** Colour + icon. Defaults to `info`. */
  tone?: AlertTone;
  /** Bold first line. */
  title?: React.ReactNode;
  /** Supporting text. `children` render after it. */
  description?: React.ReactNode;
  /** Replace the tone icon, or `false` to hide it. */
  icon?: React.ReactNode | false;
  /** Action area (usually one or two small Buttons). */
  action?: React.ReactNode;
  /** Shows a localized close button when set. */
  onDismiss?: () => void;
  /**
   * Announce the alert when it appears: `danger` / `warning` use
   * `role="alert"` (assertive), other tones `role="status"` (polite).
   * Leave off for alerts that are part of the initial page.
   */
  live?: boolean;
  labels?: Partial<AlertMessages>;
}

/**
 * Inline notice inside a page, form or card — a failed sync, a low-stock
 * warning, a successful import. For app-wide notices use `Banner`; for
 * transient confirmations use `toast`.
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      tone: toneProp,
      title,
      description,
      icon,
      action,
      onDismiss,
      live,
      labels,
      role,
      children,
      ...props
    },
    ref,
  ) => {
    const t = useMessages(alertMessages, labels);
    const tone = canonical(toneProp);
    const prefix = tonePrefix(tone, t);
    const body = description ?? children;

    return (
      <div
        ref={ref}
        data-slot="alert"
        data-tone={tone}
        role={role ?? liveRole(tone, live)}
        className={cn(alertVariants({ tone }), className)}
        {...props}
      >
        {renderIcon(icon, tone, cn("mt-0.5", toneInk({ tone })))}
        <div
          data-slot="alert-content"
          className="flex min-w-0 flex-1 flex-col gap-0.5"
        >
          {prefix && !title ? (
            <span className="sr-only">{prefix}: </span>
          ) : null}
          {title ? (
            <div
              data-slot="alert-title"
              className={cn("font-semibold leading-snug", toneInk({ tone }))}
            >
              {prefix ? <span className="sr-only">{prefix}: </span> : null}
              {title}
            </div>
          ) : null}
          {body ? (
            <div
              data-slot="alert-description"
              className="text-ink-2 leading-relaxed"
            >
              {body}
            </div>
          ) : null}
          {description && children ? children : null}
          {action ? (
            <div
              data-slot="alert-action"
              className="mt-2 flex flex-wrap items-center gap-2"
            >
              {action}
            </div>
          ) : null}
        </div>
        {onDismiss ? (
          <DismissButton
            onDismiss={onDismiss}
            label={t.dismiss}
            className={cn("-my-1 -mr-1", toneInk({ tone }))}
          />
        ) : null}
      </div>
    );
  },
);
Alert.displayName = "Alert";

// ── Banner ──────────────────────────────────────────────────────────────────

// The tint sits on a ::before layer above an opaque surface, so a sticky
// banner never lets scrolled content show through.
const bannerVariants = cva(
  "relative isolate flex w-full items-center gap-3 border-b bg-ui-surface px-4 py-2 text-ui-label before:absolute before:inset-0 before:-z-10 before:pointer-events-none",
  {
    variants: {
      tone: {
        brand: "border-transparent bg-brand-solid text-on-brand",
        neutral: "border-hairline text-ink-1 before:bg-ui-surface-2",
        success:
          "border-tj-success/30 text-tj-success-ink before:bg-tj-success/15",
        warning:
          "border-tj-warning/40 text-tj-warning-ink before:bg-tj-warning/18",
        danger: "border-tj-error/30 text-tj-error-ink before:bg-tj-error/12",
        info: "border-tj-info/30 text-tj-info-ink before:bg-tj-info/12",
      },
      sticky: {
        true: "sticky top-0 z-(--tj-z-sticky)",
        false: "",
      },
    },
    defaultVariants: { tone: "info", sticky: false },
  },
);

export interface BannerProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  tone?: AlertTone;
  /** Bold lead-in before the message. */
  title?: React.ReactNode;
  /** Replace the tone icon, or `false` to hide it. */
  icon?: React.ReactNode | false;
  /** Inline action (link or small Button) after the message. */
  action?: React.ReactNode;
  onDismiss?: () => void;
  /** Stick to the top of the scroll container (`z-(--tj-z-sticky)`). */
  sticky?: boolean;
  /** Announce when it appears (see `Alert`'s `live`). */
  live?: boolean;
  labels?: Partial<AlertMessages>;
}

/**
 * Full-width strip for app-level notices: offline mode, trial ending,
 * plan limits, scheduled maintenance. Place it above the app header or the
 * page content.
 */
export const Banner = React.forwardRef<HTMLDivElement, BannerProps>(
  (
    {
      className,
      tone: toneProp,
      title,
      icon,
      action,
      onDismiss,
      sticky = false,
      live,
      labels,
      role,
      children,
      ...props
    },
    ref,
  ) => {
    const t = useMessages(alertMessages, labels);
    const tone = canonical(toneProp);
    const prefix = tonePrefix(tone, t);

    return (
      <div
        ref={ref}
        data-slot="banner"
        data-tone={tone}
        role={role ?? liveRole(tone, live)}
        className={cn(bannerVariants({ tone, sticky }), className)}
        {...props}
      >
        {renderIcon(icon, tone, "")}
        <div
          data-slot="banner-content"
          className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1"
        >
          <p className="min-w-0 leading-snug">
            {prefix ? <span className="sr-only">{prefix}: </span> : null}
            {title ? (
              <strong data-slot="banner-title" className="mr-1.5 font-semibold">
                {title}
              </strong>
            ) : null}
            {children}
          </p>
          {action ? (
            <div data-slot="banner-action" className="flex items-center gap-2">
              {action}
            </div>
          ) : null}
        </div>
        {onDismiss ? (
          <DismissButton
            onDismiss={onDismiss}
            label={t.dismiss}
            className="-my-1 -mr-2"
          />
        ) : null}
      </div>
    );
  },
);
Banner.displayName = "Banner";

export { alertVariants, bannerVariants };
