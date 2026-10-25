import {
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Mail,
  Sheet as SheetIcon,
} from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";
import { focusRing } from "../lib/control";
import { defineMessages } from "../i18n/messages";
import { Button, type ButtonProps } from "./Button";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { Spinner } from "./Spinner";
import { useMessages } from "./TajUIProvider";

export const exportMenuMessages = defineMessages("exportMenu", {
  ru: {
    export: "Экспорт",
    menuLabel: "Формат экспорта",
    pdf: "PDF",
    pdfHint: "Для печати и отправки",
    excel: "Excel",
    excelHint: "Таблица .xlsx",
    csv: "CSV",
    csvHint: "Текст с разделителями",
    email: "Отправить на почту",
    emailHint: "Файл придёт письмом",
    exporting: "Готовим файл…",
  },
  tg: {
    export: "Экспорт",
    menuLabel: "Формати содирот",
    pdf: "PDF",
    pdfHint: "Барои чоп ва фиристодан",
    excel: "Excel",
    excelHint: "Ҷадвали .xlsx",
    csv: "CSV",
    csvHint: "Матн бо ҷудокунандаҳо",
    email: "Ба почтаи электронӣ фиристодан",
    emailHint: "Файл бо мактуб меояд",
    exporting: "Файл омода мешавад…",
  },
  en: {
    export: "Export",
    menuLabel: "Export format",
    pdf: "PDF",
    pdfHint: "For printing and sharing",
    excel: "Excel",
    excelHint: ".xlsx spreadsheet",
    csv: "CSV",
    csvHint: "Delimited text",
    email: "Send by email",
    emailHint: "The file arrives by email",
    exporting: "Preparing file…",
  },
});

export type ExportMenuLabels = (typeof exportMenuMessages.locales)["ru"];

export type ExportFormat = "pdf" | "excel" | "csv" | "email";

const DEFAULT_FORMATS: readonly ExportFormat[] = [
  "pdf",
  "excel",
  "csv",
  "email",
];

const ICONS: Record<
  ExportFormat,
  React.ComponentType<{ className?: string }>
> = {
  pdf: FileText,
  excel: FileSpreadsheet,
  csv: SheetIcon,
  email: Mail,
};

export interface ExportMenuProps extends Omit<
  ButtonProps,
  "onError" | "asChild" | "loading" | "iconLeft" | "iconRight"
> {
  /** Offered formats, in order. Defaults to PDF, Excel, CSV, e-mail. */
  formats?: readonly ExportFormat[];
  /**
   * Called with the chosen format. Return a Promise to show a spinner on
   * the item until it settles; the menu closes when it resolves.
   */
  onExport: (format: ExportFormat) => void | Promise<unknown>;
  /** Called when the Promise returned by `onExport` rejects. */
  onExportError?: (error: unknown, format: ExportFormat) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: "start" | "center" | "end";
  labels?: Partial<ExportMenuLabels>;
}

/**
 * "Export" button with a PDF / Excel / CSV / e-mail menu for reports and
 * lists. Menu-button keyboard model: Enter, Space or ArrowDown opens and
 * focuses the first item, arrows / Home / End move, Escape closes and
 * returns focus to the button.
 */
export const ExportMenu = React.forwardRef<HTMLButtonElement, ExportMenuProps>(
  (
    {
      formats = DEFAULT_FORMATS,
      onExport,
      onExportError,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      align = "end",
      labels: labelsProp,
      variant = "subtle",
      size = "sm",
      children,
      onKeyDown,
      disabled,
      ...props
    },
    ref,
  ) => {
    const t = useMessages(exportMenuMessages, labelsProp);
    const menuId = React.useId();
    const triggerId = React.useId();

    const isControlled = openProp !== undefined;
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
    const open = isControlled ? openProp : internalOpen;
    const setOpen = (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    };

    const [busy, setBusy] = React.useState<ExportFormat | null>(null);
    const focusOnOpen = React.useRef<"first" | "last">("first");
    const items = React.useRef<Array<HTMLButtonElement | null>>([]);
    const mounted = React.useRef(true);
    React.useEffect(() => {
      mounted.current = true;
      return () => {
        mounted.current = false;
      };
    }, []);

    const focusItem = (i: number) => {
      const n = formats.length;
      if (n === 0) return;
      items.current[((i % n) + n) % n]?.focus();
    };
    const currentIndex = () =>
      items.current.findIndex(
        (el) => el != null && el === document.activeElement,
      );

    const select = (format: ExportFormat) => {
      if (busy) return;
      let result: void | Promise<unknown>;
      try {
        result = onExport(format);
      } catch (error) {
        onExportError?.(error, format);
        return;
      }
      if (result && typeof (result as Promise<unknown>).then === "function") {
        setBusy(format);
        (result as Promise<unknown>).then(
          () => {
            if (!mounted.current) return;
            setBusy(null);
            setOpen(false);
          },
          (error: unknown) => {
            if (!mounted.current) return;
            setBusy(null);
            onExportError?.(error, format);
          },
        );
      } else {
        setOpen(false);
      }
    };

    const onMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const i = currentIndex();
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          focusItem(i + 1);
          return;
        case "ArrowUp":
          e.preventDefault();
          focusItem(i < 0 ? -1 : i - 1);
          return;
        case "Home":
          e.preventDefault();
          focusItem(0);
          return;
        case "End":
          e.preventDefault();
          focusItem(formats.length - 1);
          return;
        case "Tab":
          e.preventDefault();
          setOpen(false);
          return;
      }
      // Typeahead by first letter.
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const key = e.key.toLocaleLowerCase();
        const n = formats.length;
        for (let k = 1; k <= n; k++) {
          const j = (Math.max(i, 0) + k) % n;
          if (t[formats[j]].toLocaleLowerCase().startsWith(key)) {
            focusItem(j);
            break;
          }
        }
      }
    };

    return (
      <>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              id={triggerId}
              variant={variant}
              size={size}
              disabled={disabled}
              aria-haspopup="menu"
              data-slot="export-menu"
              iconLeft={<Download className="size-4" aria-hidden />}
              iconRight={
                <ChevronDown className="size-3.5 opacity-70" aria-hidden />
              }
              onKeyDown={(e) => {
                onKeyDown?.(e);
                if (e.defaultPrevented) return;
                if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                  e.preventDefault();
                  focusOnOpen.current = e.key === "ArrowUp" ? "last" : "first";
                  setOpen(true);
                }
              }}
              {...props}
            >
              {children ?? t.export}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            id={menuId}
            role="menu"
            aria-labelledby={triggerId}
            aria-orientation="vertical"
            aria-busy={busy ? true : undefined}
            align={align}
            data-slot="export-menu-content"
            className="w-64 p-1"
            onKeyDown={onMenuKeyDown}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              focusItem(
                focusOnOpen.current === "last" ? formats.length - 1 : 0,
              );
              focusOnOpen.current = "first";
            }}
          >
            {formats.map((format, i) => {
              const Icon = ICONS[format];
              const isBusy = busy === format;
              const blocked = busy != null && !isBusy;
              const hint = t[
                `${format}Hint` as keyof ExportMenuLabels
              ] as string;
              return (
                <React.Fragment key={format}>
                  {format === "email" && i > 0 ? (
                    <div role="separator" className="my-1 h-px bg-hairline" />
                  ) : null}
                  <button
                    ref={(el) => {
                      items.current[i] = el;
                    }}
                    type="button"
                    role="menuitem"
                    tabIndex={-1}
                    aria-disabled={blocked || undefined}
                    aria-busy={isBusy || undefined}
                    data-format={format}
                    data-slot="export-menu-item"
                    onClick={() => select(format)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2.5 !rounded-md px-2 py-1.5 text-left",
                      "min-h-control-md hover:bg-mist focus-visible:bg-mist",
                      focusRing,
                      blocked && "cursor-not-allowed opacity-50",
                    )}
                  >
                    <span
                      aria-hidden
                      className="grid size-7 shrink-0 place-items-center !rounded-md bg-ui-surface-2 text-ink-2"
                    >
                      {isBusy ? (
                        <Spinner className="size-4 text-brand-ink" />
                      ) : (
                        <Icon className="size-4" />
                      )}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col leading-tight">
                      <span className="truncate text-ui-body font-bold text-ink-1">
                        {t[format]}
                      </span>
                      <span className="truncate text-ui-helper text-ink-3">
                        {isBusy ? t.exporting : hint}
                      </span>
                    </span>
                  </button>
                </React.Fragment>
              );
            })}
          </PopoverContent>
        </Popover>
        <span className="sr-only" role="status" data-slot="export-menu-status">
          {busy ? t.exporting : ""}
        </span>
      </>
    );
  },
);
ExportMenu.displayName = "ExportMenu";
