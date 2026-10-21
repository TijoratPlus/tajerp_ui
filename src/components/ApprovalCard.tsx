import {
  ArrowLeftRight,
  Check,
  CircleAlert,
  ClipboardCheck,
  Clock,
  MessageSquareText,
  ReceiptText,
  ShoppingCart,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import * as React from "react";

import { intlLocale } from "../i18n/locale";
import { defineMessages } from "../i18n/messages";
import { focusRing } from "../lib/control";
import { cn } from "../lib/cn";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Textarea } from "./Textarea";
import { useCommonMessages, useFormat, useMessages } from "./TajUIProvider";

// ── Types ──────────────────────────────────────────────────────────────────

/** Known action kinds get a default title and icon; any other string works too. */
export type ApprovalKind =
  | "purchase_order"
  | "invoice"
  | "transfer"
  | "price_change"
  | "sms"
  | (string & Record<never, never>);

export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired";

export interface ApprovalRequester {
  name: string;
  /** "ai" — drafted by TijoratAI (gets the brand accent and an AI badge). */
  kind: "ai" | "user";
}

export interface ApprovalDetail {
  label: React.ReactNode;
  value: React.ReactNode;
}

export interface ApprovalItem {
  name: React.ReactNode;
  qty: number;
  /** Unit after the quantity: "шт", "кг", "уп". */
  unit?: string;
}

export interface ApprovalStep {
  /** Person or role who decides at this step ("Фарход, бухгалтер"). */
  approver: React.ReactNode;
  /** Optional rule or role shown under the name ("свыше 3 000 с"). */
  note?: React.ReactNode;
  status: "approved" | "rejected" | "pending";
  /** When the step was decided (relative time is shown). */
  decidedAt?: Date | number | string;
}

// Any return value is allowed; a returned Promise drives the loading state.
type ActionResult = unknown;

export type ApprovalCardMessages = {
  approve: string;
  edit: string;
  reject: string;
  confirmReject: string;
  aiBadge: string;
  aiDraft: string;
  statusPending: string;
  statusApproved: string;
  statusRejected: string;
  statusExpired: string;
  by: (name: string) => string;
  amount: string;
  details: string;
  items: string;
  moreItems: (n: number) => string;
  showLess: string;
  steps: string;
  stepOf: (current: number, total: number) => string;
  allStepsDone: string;
  stepApproved: string;
  stepRejected: string;
  stepCurrent: string;
  stepQueued: string;
  rejectReason: string;
  rejectReasonPlaceholder: string;
  rejectReasonRequired: string;
  escalatesIn: (duration: string) => string;
  escalated: string;
  kindPurchaseOrder: string;
  kindInvoice: string;
  kindTransfer: string;
  kindPriceChange: string;
  kindSms: string;
  kindOther: string;
};

export const approvalCardMessages = defineMessages<ApprovalCardMessages>("approvalCard", {
  ru: {
    approve: "Одобрить",
    edit: "Изменить",
    reject: "Отклонить",
    confirmReject: "Отклонить",
    aiBadge: "AI",
    aiDraft: "Черновик TijoratAI",
    statusPending: "Ожидает решения",
    statusApproved: "Одобрено",
    statusRejected: "Отклонено",
    statusExpired: "Срок истёк",
    by: (name) => `Автор: ${name}`,
    amount: "Сумма",
    details: "Подробности",
    items: "Позиции",
    moreItems: (n) => `ещё ${n}`,
    showLess: "Свернуть",
    steps: "Цепочка согласования",
    stepOf: (c, t) => `Шаг ${c} из ${t}`,
    allStepsDone: "Все шаги пройдены",
    stepApproved: "Одобрил(а)",
    stepRejected: "Отклонил(а)",
    stepCurrent: "Ждём решения",
    stepQueued: "В очереди",
    rejectReason: "Причина отказа",
    rejectReasonPlaceholder: "Например: у другого поставщика дешевле",
    rejectReasonRequired: "Укажите причину отказа",
    escalatesIn: (d) => `Эскалация через ${d}`,
    escalated: "Передано руководителю",
    kindPurchaseOrder: "Заказ поставщику",
    kindInvoice: "Счёт",
    kindTransfer: "Перемещение товара",
    kindPriceChange: "Изменение цен",
    kindSms: "SMS-напоминание",
    kindOther: "Действие на согласование",
  },
  tg: {
    approve: "Тасдиқ кардан",
    edit: "Тағйир додан",
    reject: "Рад кардан",
    confirmReject: "Рад кардан",
    aiBadge: "AI",
    aiDraft: "Сиёҳнависи TijoratAI",
    statusPending: "Интизори қарор",
    statusApproved: "Тасдиқ шуд",
    statusRejected: "Рад шуд",
    statusExpired: "Мӯҳлат гузашт",
    by: (name) => `Муаллиф: ${name}`,
    amount: "Маблағ",
    details: "Тафсилот",
    items: "Номгӯи мол",
    moreItems: (n) => `боз ${n}`,
    showLess: "Печондан",
    steps: "Занҷираи тасдиқ",
    stepOf: (c, t) => `Қадами ${c} аз ${t}`,
    allStepsDone: "Ҳамаи қадамҳо гузаштанд",
    stepApproved: "Тасдиқ кард",
    stepRejected: "Рад кард",
    stepCurrent: "Интизори қарор",
    stepQueued: "Дар навбат",
    rejectReason: "Сабаби рад",
    rejectReasonPlaceholder: "Масалан: дар таъминкунандаи дигар арзонтар аст",
    rejectReasonRequired: "Сабаби радро нависед",
    escalatesIn: (d) => `Ба роҳбар баъд аз ${d}`,
    escalated: "Ба роҳбар фиристода шуд",
    kindPurchaseOrder: "Фармоиш ба таъминкунанда",
    kindInvoice: "Ҳисобнома",
    kindTransfer: "Интиқоли мол",
    kindPriceChange: "Тағйири нархҳо",
    kindSms: "Ёдраси SMS",
    kindOther: "Амал барои тасдиқ",
  },
  en: {
    approve: "Approve",
    edit: "Edit",
    reject: "Reject",
    confirmReject: "Reject",
    aiBadge: "AI",
    aiDraft: "TijoratAI draft",
    statusPending: "Awaiting decision",
    statusApproved: "Approved",
    statusRejected: "Rejected",
    statusExpired: "Expired",
    by: (name) => `By ${name}`,
    amount: "Amount",
    details: "Details",
    items: "Items",
    moreItems: (n) => `${n} more`,
    showLess: "Show less",
    steps: "Approval chain",
    stepOf: (c, t) => `Step ${c} of ${t}`,
    allStepsDone: "All steps complete",
    stepApproved: "Approved",
    stepRejected: "Rejected",
    stepCurrent: "Awaiting decision",
    stepQueued: "Queued",
    rejectReason: "Reason for rejection",
    rejectReasonPlaceholder: "e.g. another supplier is cheaper",
    rejectReasonRequired: "Please give a reason",
    escalatesIn: (d) => `Escalates in ${d}`,
    escalated: "Escalated to manager",
    kindPurchaseOrder: "Purchase order",
    kindInvoice: "Invoice",
    kindTransfer: "Stock transfer",
    kindPriceChange: "Price change",
    kindSms: "SMS reminder",
    kindOther: "Action to approve",
  },
});

const KIND_META: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    title:
      | "kindPurchaseOrder"
      | "kindInvoice"
      | "kindTransfer"
      | "kindPriceChange"
      | "kindSms";
  }
> = {
  purchase_order: { icon: ShoppingCart, title: "kindPurchaseOrder" },
  invoice: { icon: ReceiptText, title: "kindInvoice" },
  transfer: { icon: ArrowLeftRight, title: "kindTransfer" },
  price_change: { icon: Tag, title: "kindPriceChange" },
  sms: { icon: MessageSquareText, title: "kindSms" },
};

const STATUS_TONE = {
  pending: "warning",
  approved: "success",
  rejected: "error",
  expired: "neutral",
} as const;

export interface ApprovalCardProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  kind: ApprovalKind;
  /** Defaults to a localized title for known kinds. */
  title?: React.ReactNode;
  summary?: React.ReactNode;
  /** Total amount, printed with `useFormat().money`. */
  amount?: number;
  /** ISO 4217 currency of `amount`; defaults to the provider's (TJS). */
  currency?: string;
  requestedBy?: ApprovalRequester;
  requestedAt?: Date | number | string;
  /** Compact key-value rows (supplier, warehouse, due date, …). */
  details?: ApprovalDetail[];
  /** Line preview ("name × qty"); collapsed after `itemsPreviewCount`. */
  items?: ApprovalItem[];
  /** How many items show before "ещё N". Defaults to 3. */
  itemsPreviewCount?: number;
  status?: ApprovalStatus;
  /** Multi-step approval chain. The first `pending` step is the current one. */
  steps?: ApprovalStep[];
  /** Approve. Return a Promise to show a spinner until it settles. */
  onApprove?: () => ActionResult;
  /** Open the draft for editing. May return a Promise. */
  onEdit?: () => ActionResult;
  /** Reject, with the reason when `requireRejectReason`. May return a Promise. */
  onReject?: (reason?: string) => ActionResult;
  /** Ask for a reason inline before rejecting. */
  requireRejectReason?: boolean;
  /** When the request escalates to the next approver ("Эскалация через 3 ч"). */
  escalatesAt?: Date | number | string;
  /** Outcome note for decided cards (who approved, rejection reason, …). */
  statusNote?: React.ReactNode;
  /** Disable all actions (e.g. offline). */
  disabled?: boolean;
  /** Heading level of the title. Defaults to 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Reference time for relative dates (tests, stories). Defaults to now. */
  now?: number;
  labels?: Partial<ApprovalCardMessages>;
}

type Pending = "approve" | "edit" | "reject" | null;

function toTime(v: Date | number | string) {
  return v instanceof Date ? v.getTime() : new Date(v).getTime();
}

function isoOrUndefined(v: Date | number | string) {
  const ms = toTime(v);
  return Number.isFinite(ms) ? new Date(ms).toISOString() : undefined;
}

function useDuration(locale: "ru" | "tg" | "en") {
  return React.useCallback(
    (ms: number) => {
      const mins = Math.max(1, Math.round(ms / 60000));
      const [unit, n]: [string, number] =
        mins < 60
          ? ["minute", mins]
          : mins < 48 * 60
            ? ["hour", Math.round(mins / 60)]
            : ["day", Math.round(mins / 1440)];
      try {
        return new Intl.NumberFormat(intlLocale(locale), {
          style: "unit",
          unit,
          unitDisplay: "short",
        }).format(n);
      } catch {
        return String(n);
      }
    },
    [locale],
  );
}

/**
 * A pending action that needs a person's "yes": a supplier order, invoice,
 * stock transfer, price change or SMS reminder drafted by TijoratAI or a
 * colleague. Shows what will happen, who asked, the approval chain and
 * Approve / Edit / Reject. Use it in the approvals inbox, the AI panel (inside
 * a ChatBubble) and notification previews.
 */
export const ApprovalCard = React.forwardRef<HTMLElement, ApprovalCardProps>(
  (
    {
      kind,
      title,
      summary,
      amount,
      currency,
      requestedBy,
      requestedAt,
      details,
      items,
      itemsPreviewCount = 3,
      status = "pending",
      steps,
      onApprove,
      onEdit,
      onReject,
      requireRejectReason = false,
      escalatesAt,
      statusNote,
      disabled = false,
      headingLevel = 3,
      now,
      labels,
      className,
      ...props
    },
    ref,
  ) => {
    const t = useMessages(approvalCardMessages, labels);
    const common = useCommonMessages();
    const fmt = useFormat();
    const duration = useDuration(fmt.locale);
    const uid = React.useId();
    const titleId = `${uid}-title`;
    const itemsId = `${uid}-items`;
    const reasonId = `${uid}-reason`;
    const reasonErrorId = `${uid}-reason-error`;

    const [pending, setPending] = React.useState<Pending>(null);
    const [expanded, setExpanded] = React.useState(false);
    const [rejecting, setRejecting] = React.useState(false);
    const [reason, setReason] = React.useState("");
    const [reasonError, setReasonError] = React.useState(false);
    const reasonRef = React.useRef<HTMLTextAreaElement>(null);
    const rejectButtonRef = React.useRef<HTMLButtonElement>(null);
    const mounted = React.useRef(true);
    React.useEffect(() => {
      mounted.current = true;
      return () => {
        mounted.current = false;
      };
    }, []);

    React.useEffect(() => {
      if (rejecting) reasonRef.current?.focus();
    }, [rejecting]);

    const run = (which: Exclude<Pending, null>, fn: () => ActionResult) => {
      if (pending) return;
      let result: ActionResult;
      try {
        result = fn();
      } catch {
        return;
      }
      if (result && typeof (result as Promise<unknown>).then === "function") {
        setPending(which);
        const done = () => {
          if (mounted.current) setPending(null);
        };
        (result as Promise<unknown>).then(done, done);
      }
    };

    const isAi = requestedBy?.kind === "ai";
    const meta = KIND_META[kind];
    const KindIcon = meta?.icon ?? ClipboardCheck;
    const heading = title ?? t[meta?.title ?? "kindOther"];
    const Heading = `h${headingLevel}` as "h3";
    const nowMs = now ?? Date.now();
    const isPending = status === "pending";
    const actionsDisabled = disabled || pending !== null;

    const statusLabel = {
      pending: t.statusPending,
      approved: t.statusApproved,
      rejected: t.statusRejected,
      expired: t.statusExpired,
    }[status];

    // Approval chain: the first pending step is current.
    const currentStep = steps ? steps.findIndex((s) => s.status === "pending") : -1;

    // Items preview
    const visibleItems =
      items && !expanded ? items.slice(0, itemsPreviewCount) : items;
    const hiddenCount = items ? items.length - itemsPreviewCount : 0;

    let escalation: string | null = null;
    if (isPending && escalatesAt !== undefined) {
      const at = toTime(escalatesAt);
      if (Number.isFinite(at)) {
        escalation = at <= nowMs ? t.escalated : t.escalatesIn(duration(at - nowMs));
      }
    }

    const submitReject = () => {
      if (!onReject) return;
      if (requireRejectReason) {
        const trimmed = reason.trim();
        if (!trimmed) {
          setReasonError(true);
          reasonRef.current?.focus();
          return;
        }
        run("reject", () => onReject(trimmed));
      } else {
        run("reject", () => onReject());
      }
    };

    const cancelReject = () => {
      setRejecting(false);
      setReason("");
      setReasonError(false);
      requestAnimationFrame(() => rejectButtonRef.current?.focus());
    };

    const hasActions = isPending && (onApprove || onEdit || onReject);

    return (
      <article
        ref={ref}
        data-slot="approval-card"
        data-status={status}
        data-requester={requestedBy?.kind}
        aria-labelledby={titleId}
        aria-busy={pending ? true : undefined}
        className={cn(
          "relative flex flex-col gap-3 overflow-hidden border bg-ui-surface p-4 text-ink-1 shadow-tj-sm !rounded-xl",
          isAi ? "border-brand/35" : "border-hairline",
          isAi &&
            "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-brand",
          !isPending && "bg-ui-surface-2",
          className,
        )}
        {...props}
      >
        {/* Header */}
        <div data-slot="approval-card-header" className="flex items-start gap-3">
          <span
            aria-hidden
            className={cn(
              "inline-flex size-9 shrink-0 items-center justify-center !rounded-lg [&_svg]:size-4.5",
              isAi ? "bg-mist text-mist-ink" : "bg-ui-surface-2 text-ink-2 border border-hairline",
            )}
          >
            <KindIcon />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <Heading
                id={titleId}
                className="font-bold text-ink-1 text-ui-title leading-snug"
              >
                {heading}
              </Heading>
              {isAi && (
                <Badge
                  tone="brand"
                  size="sm"
                  data-slot="approval-card-ai-badge"
                >
                  <Sparkles aria-hidden className="size-3" />
                  {t.aiBadge}
                  <span className="sr-only">: {t.aiDraft}</span>
                </Badge>
              )}
            </div>
            {(requestedBy || requestedAt !== undefined) && (
              <p className="mt-0.5 text-ink-3 text-ui-helper">
                {requestedBy && t.by(requestedBy.name)}
                {requestedBy && requestedAt !== undefined && " · "}
                {requestedAt !== undefined && (
                  <time dateTime={isoOrUndefined(requestedAt)}>
                    {fmt.relative(requestedAt, nowMs)}
                  </time>
                )}
              </p>
            )}
          </div>
          <Badge
            tone={STATUS_TONE[status]}
            size="md"
            data-slot="approval-card-status"
            className="shrink-0"
          >
            {status === "approved" && <Check aria-hidden className="size-3.5" />}
            {status === "rejected" && <X aria-hidden className="size-3.5" />}
            {status === "pending" && <Clock aria-hidden className="size-3.5" />}
            {statusLabel}
          </Badge>
        </div>

        {summary && (
          <div data-slot="approval-card-summary" className="text-ink-2 text-ui-body leading-relaxed">
            {summary}
          </div>
        )}

        {amount !== undefined && (
          <p data-slot="approval-card-amount" className="flex items-baseline justify-between gap-3">
            <span className="text-ink-3 text-ui-label">{t.amount}</span>
            <span className="font-black text-ink-1 text-ui-title tabular-nums tracking-tight">
              {fmt.money(amount, currency ? { currency } : undefined)}
            </span>
          </p>
        )}

        {details && details.length > 0 && (
          <dl
            data-slot="approval-card-details"
            aria-label={t.details}
            className="grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] gap-x-4 gap-y-1.5 border-hairline border-t pt-3 text-ui-body"
          >
            {details.map((d, i) => (
              <React.Fragment key={i}>
                <dt className="text-ink-3">{d.label}</dt>
                <dd className="min-w-0 text-right font-medium text-ink-1 break-words">
                  {d.value}
                </dd>
              </React.Fragment>
            ))}
          </dl>
        )}

        {items && items.length > 0 && (
          <div data-slot="approval-card-items" className="border-hairline border-t pt-3">
            <p className="mb-1.5 font-bold text-ink-3 text-ui-caption uppercase tracking-[0.06em]">
              {t.items} · {fmt.number(items.length)}
            </p>
            <ul id={itemsId} className="flex flex-col gap-1 text-ui-body">
              {visibleItems?.map((item, i) => (
                <li key={i} className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-ink-1">{item.name}</span>
                  <span className="shrink-0 text-ink-2 tabular-nums">
                    × {fmt.number(item.qty)}
                    {item.unit ? ` ${item.unit}` : ""}
                  </span>
                </li>
              ))}
            </ul>
            {hiddenCount > 0 && (
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={itemsId}
                onClick={() => setExpanded((v) => !v)}
                className={cn(
                  "mt-1.5 inline-flex min-h-6 items-center font-bold text-brand-ink text-ui-label hover:underline underline-offset-4 cursor-pointer !rounded-sm",
                  focusRing,
                )}
              >
                {expanded ? t.showLess : t.moreItems(hiddenCount)}
              </button>
            )}
          </div>
        )}

        {steps && steps.length > 0 && (
          <div data-slot="approval-card-steps" className="border-hairline border-t pt-3">
            <p className="mb-2 flex items-center justify-between gap-2 text-ui-label">
              <span className="font-bold text-ink-2">{t.steps}</span>
              <span className="text-ink-3 tabular-nums">
                {currentStep === -1
                  ? t.allStepsDone
                  : t.stepOf(currentStep + 1, steps.length)}
              </span>
            </p>
            <ol aria-label={t.steps} className="flex flex-col gap-2">
              {steps.map((step, i) => {
                const isCurrent = i === currentStep;
                const queued = step.status === "pending" && !isCurrent;
                const stateLabel =
                  step.status === "approved"
                    ? t.stepApproved
                    : step.status === "rejected"
                      ? t.stepRejected
                      : isCurrent
                        ? t.stepCurrent
                        : t.stepQueued;
                return (
                  <li
                    key={i}
                    aria-current={isCurrent ? "step" : undefined}
                    data-state={isCurrent ? "current" : step.status}
                    className="flex items-start gap-2.5"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "mt-0.5 inline-flex size-5 shrink-0 items-center justify-center !rounded-full text-ui-micro font-bold [&_svg]:size-3",
                        step.status === "approved" && "bg-tj-success/15 text-tj-success-ink",
                        step.status === "rejected" && "bg-tj-error/12 text-tj-error-ink",
                        isCurrent && "bg-tj-warning/15 text-tj-warning-ink ring-1 ring-tj-warning/50",
                        queued && "bg-ui-surface-2 text-ink-3 border border-hairline",
                      )}
                    >
                      {step.status === "approved" ? (
                        <Check />
                      ) : step.status === "rejected" ? (
                        <X />
                      ) : (
                        i + 1
                      )}
                    </span>
                    <div className="min-w-0 flex-1 text-ui-body">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                        <span className={cn("font-medium", queued ? "text-ink-3" : "text-ink-1")}>
                          {step.approver}
                        </span>
                        <span
                          className={cn(
                            "text-ui-helper",
                            isCurrent ? "font-bold text-tj-warning-ink" : "text-ink-3",
                          )}
                        >
                          {stateLabel}
                          {step.decidedAt !== undefined && (
                            <> · {fmt.relative(step.decidedAt, nowMs)}</>
                          )}
                        </span>
                      </div>
                      {step.note && (
                        <p className="text-ink-3 text-ui-helper">{step.note}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {escalation && (
          <p
            data-slot="approval-card-escalation"
            className="flex items-center gap-1.5 text-tj-warning-ink text-ui-helper font-medium"
          >
            <Clock aria-hidden className="size-3.5 shrink-0" />
            {escalation}
          </p>
        )}

        {statusNote && !isPending && (
          <div
            data-slot="approval-card-note"
            className="flex items-start gap-1.5 text-ink-2 text-ui-helper"
          >
            {status === "rejected" && (
              <CircleAlert aria-hidden className="mt-px size-3.5 shrink-0 text-tj-error-ink" />
            )}
            <div className="min-w-0">{statusNote}</div>
          </div>
        )}

        {hasActions && rejecting && (
          <div data-slot="approval-card-reject" className="flex flex-col gap-2 border-hairline border-t pt-3">
            <label htmlFor={reasonId} className="font-bold text-ink-2 text-ui-label">
              {t.rejectReason}
            </label>
            <Textarea
              ref={reasonRef}
              id={reasonId}
              value={reason}
              rows={2}
              required
              placeholder={t.rejectReasonPlaceholder}
              aria-invalid={reasonError || undefined}
              aria-describedby={reasonError ? reasonErrorId : undefined}
              disabled={actionsDisabled}
              onChange={(e) => {
                setReason(e.target.value);
                if (reasonError && e.target.value.trim()) setReasonError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  cancelReject();
                }
              }}
              className="min-h-14 text-ui-control"
            />
            {reasonError && (
              <p id={reasonErrorId} className="text-tj-error-ink text-ui-helper font-medium">
                {t.rejectReasonRequired}
              </p>
            )}
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={cancelReject} disabled={actionsDisabled}>
                {common.cancel}
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={pending === "reject"}
                disabled={actionsDisabled && pending !== "reject"}
                onClick={submitReject}
              >
                {t.confirmReject}
              </Button>
            </div>
          </div>
        )}

        {hasActions && !rejecting && (
          <div data-slot="approval-card-actions" className="flex flex-wrap items-center gap-2 pt-1">
            {onApprove && (
              <Button
                variant="solid"
                size="md"
                iconLeft={<Check aria-hidden className="size-4" />}
                loading={pending === "approve"}
                disabled={actionsDisabled && pending !== "approve"}
                onClick={() => run("approve", onApprove)}
              >
                {t.approve}
              </Button>
            )}
            {onEdit && (
              <Button
                variant="subtle"
                size="md"
                loading={pending === "edit"}
                disabled={actionsDisabled && pending !== "edit"}
                onClick={() => run("edit", onEdit)}
              >
                {t.edit}
              </Button>
            )}
            {onReject && (
              <Button
                ref={rejectButtonRef}
                variant="ghost"
                size="md"
                className="ml-auto text-tj-error-ink hover:bg-tj-error/10 hover:text-tj-error-ink"
                loading={pending === "reject"}
                disabled={actionsDisabled && pending !== "reject"}
                onClick={() => {
                  if (requireRejectReason) setRejecting(true);
                  else submitReject();
                }}
              >
                {t.reject}
              </Button>
            )}
          </div>
        )}
      </article>
    );
  },
);
ApprovalCard.displayName = "ApprovalCard";
