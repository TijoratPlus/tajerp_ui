import { Check, X } from "lucide-react";
import * as React from "react";

import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import { focusRing } from "../lib/control";
import { useMessages } from "./TajUIProvider";

export const stepperMessages = defineMessages("stepper", {
  ru: {
    label: "Этапы",
    stepOf: (current: number, total: number) => `Шаг ${current} из ${total}`,
    complete: "выполнен",
    error: "ошибка",
    upcoming: "не начат",
    optional: "Необязательно",
  },
  tg: {
    label: "Марҳилаҳо",
    stepOf: (current: number, total: number) => `Қадами ${current} аз ${total}`,
    complete: "иҷро шуд",
    error: "хато",
    upcoming: "оғоз нашудааст",
    optional: "Ихтиёрӣ",
  },
  en: {
    label: "Progress",
    stepOf: (current: number, total: number) => `Step ${current} of ${total}`,
    complete: "completed",
    error: "error",
    upcoming: "not started",
    optional: "Optional",
  },
});

export type StepperMessages = (typeof stepperMessages.locales)["ru"];

export type StepStatus = "complete" | "current" | "upcoming" | "error";

export interface StepperStep {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  /** Shows a localized "Optional" note. */
  optional?: boolean;
  /** Override the derived status (e.g. `"error"` for a failed payment). */
  status?: StepStatus;
  /** Never clickable, even when complete. */
  disabled?: boolean;
}

export interface StepperProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "onChange"
> {
  steps: StepperStep[];
  /** Index of the current step (0-based). Steps before it are complete. */
  activeStep: number;
  orientation?: "horizontal" | "vertical";
  /**
   * Makes completed steps buttons that jump back, e.g. from Оплата back to
   * Корзина. Current and upcoming steps stay static.
   */
  onStepClick?: (index: number, step: StepperStep) => void;
  labels?: Partial<StepperMessages>;
}

/** Status of step `index` given the active step (explicit status wins). */
export function getStepStatus(
  step: StepperStep,
  index: number,
  activeStep: number,
): StepStatus {
  if (step.status) return step.status;
  if (index < activeStep) return "complete";
  if (index === activeStep) return "current";
  return "upcoming";
}

const indicatorTone: Record<StepStatus, string> = {
  complete: "border-brand-solid bg-brand-solid text-on-brand",
  current: "border-brand bg-mist text-mist-ink",
  upcoming: "border-hairline bg-ui-surface text-ink-3",
  error: "border-tj-error bg-tj-error/12 text-tj-error-ink",
};

/**
 * Progress through a multi-step flow: POS checkout (Корзина → Оплата → Чек),
 * onboarding, import wizards. Shows where the person is; it does not render
 * the step content.
 */
export const Stepper = React.forwardRef<HTMLElement, StepperProps>(
  (
    {
      className,
      steps,
      activeStep,
      orientation = "horizontal",
      onStepClick,
      labels,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const t = useMessages(stepperMessages, labels);
    const vertical = orientation === "vertical";
    const total = steps.length;
    const current = Math.min(Math.max(activeStep, 0), Math.max(total - 1, 0));
    const currentStep = steps[current];

    return (
      <nav
        ref={ref}
        data-slot="stepper"
        data-orientation={orientation}
        aria-label={ariaLabel ?? t.label}
        className={cn("w-full", className)}
        {...props}
      >
        <p className="sr-only" aria-live="polite" data-slot="stepper-summary">
          {total > 0 ? t.stepOf(current + 1, total) : null}
          {currentStep && typeof currentStep.label === "string"
            ? `: ${currentStep.label}`
            : null}
        </p>
        <ol
          className={cn(
            "flex",
            vertical ? "flex-col" : "flex-row items-start gap-2",
          )}
        >
          {steps.map((step, index) => {
            const status = getStepStatus(step, index, activeStep);
            const isCurrent = index === activeStep;
            const isLast = index === total - 1;
            const clickable =
              !!onStepClick &&
              !isCurrent &&
              !step.disabled &&
              (status === "complete" ||
                (status === "error" && index < activeStep));
            const reached =
              status === "complete" ||
              (status === "error" && index < activeStep);
            const statusText =
              status === "complete"
                ? t.complete
                : status === "error"
                  ? t.error
                  : status === "upcoming"
                    ? t.upcoming
                    : undefined;

            const indicator = (
              <span
                aria-hidden
                data-slot="stepper-indicator"
                data-status={status}
                className={cn(
                  "inline-flex size-7 shrink-0 items-center justify-center !rounded-full border-2 text-ui-label font-bold tabular-nums transition-colors",
                  indicatorTone[status],
                )}
              >
                {status === "complete" ? (
                  <Check className="size-3.5" strokeWidth={3} />
                ) : status === "error" ? (
                  <X className="size-3.5" strokeWidth={3} />
                ) : (
                  index + 1
                )}
              </span>
            );

            const text = (
              <span
                className={cn(
                  "flex min-w-0 flex-col text-left",
                  // On phones a horizontal stepper keeps only the current label.
                  !vertical && !isCurrent && "max-sm:sr-only",
                )}
              >
                <span
                  data-slot="stepper-label"
                  className={cn(
                    "text-ui-label font-semibold leading-snug",
                    status === "upcoming" ? "text-ink-3" : "text-ink-1",
                    status === "error" && "text-tj-error-ink",
                  )}
                >
                  {step.label}
                  {statusText ? (
                    <span className="sr-only"> — {statusText}</span>
                  ) : null}
                </span>
                {step.description ? (
                  <span
                    data-slot="stepper-description"
                    className="text-ui-helper text-ink-3 leading-snug"
                  >
                    {step.description}
                  </span>
                ) : null}
                {step.optional ? (
                  <span className="text-ui-caption text-ink-4">
                    {t.optional}
                  </span>
                ) : null}
              </span>
            );

            const itemClass = cn(
              "flex items-start gap-2.5",
              vertical ? "min-h-7" : "min-w-0",
            );
            const content = clickable ? (
              <button
                type="button"
                data-slot="stepper-trigger"
                onClick={() => onStepClick?.(index, step)}
                className={cn(
                  itemClass,
                  "-m-1 cursor-pointer !rounded-lg p-1 transition-colors hover:bg-ui-surface-2",
                  focusRing,
                )}
              >
                {indicator}
                {text}
              </button>
            ) : (
              <div
                data-slot="stepper-trigger"
                aria-current={isCurrent ? "step" : undefined}
                className={itemClass}
              >
                {indicator}
                {text}
              </div>
            );

            return (
              <li
                key={step.id}
                data-slot="stepper-item"
                data-status={status}
                className={cn(
                  "relative flex",
                  vertical
                    ? "gap-3 pb-6 last:pb-0"
                    : "min-w-0 flex-1 items-center gap-2 last:flex-none",
                )}
              >
                {content}
                {!isLast ? (
                  <span
                    aria-hidden
                    data-slot="stepper-separator"
                    className={cn(
                      "shrink-0 transition-colors",
                      reached ? "bg-brand-solid" : "bg-hairline",
                      vertical
                        ? "absolute top-9 bottom-1.5 left-3.5 w-0.5 -translate-x-1/2"
                        : "mt-3.5 h-0.5 min-w-4 flex-1 self-start",
                    )}
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  },
);
Stepper.displayName = "Stepper";
