import { ArrowDownNarrowWide, ArrowUpDown, ArrowUpNarrowWide, Plus, X } from "lucide-react";
import * as React from "react";

import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import { focusRing } from "../lib/control";
import { Button } from "./Button";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { Select } from "./Select";
import { DragHandle, SortableList } from "./Sortable";
import { useMessages } from "./TajUIProvider";

export const sortBuilderMessages = defineMessages("sortBuilder", {
  ru: {
    sort: "Сортировка",
    sorting: "Сортировка списка",
    count: (n: number) => `Сортировка (${n})`,
    field: "Поле сортировки",
    direction: "Направление",
    asc: "По возрастанию",
    desc: "По убыванию",
    addSort: "Добавить сортировку",
    remove: "Удалить сортировку",
    clearAll: "Очистить всё",
    empty: "Сортировка не задана",
    rules: "Правила сортировки",
  },
  tg: {
    sort: "Мураттабсозӣ",
    sorting: "Мураттабсозии рӯйхат",
    count: (n: number) => `Мураттабсозӣ (${n})`,
    field: "Майдони мураттабсозӣ",
    direction: "Самт",
    asc: "Афзуншаванда",
    desc: "Камшаванда",
    addSort: "Илова кардани мураттабсозӣ",
    remove: "Нест кардани мураттабсозӣ",
    clearAll: "Ҳамаро тоза кардан",
    empty: "Мураттабсозӣ муқаррар нашудааст",
    rules: "Қоидаҳои мураттабсозӣ",
  },
  en: {
    sort: "Sort",
    sorting: "Sort list",
    count: (n: number) => `Sort (${n})`,
    field: "Sort field",
    direction: "Direction",
    asc: "Ascending",
    desc: "Descending",
    addSort: "Add sort",
    remove: "Remove sort",
    clearAll: "Clear all",
    empty: "No sorting",
    rules: "Sort rules",
  },
});

export type SortBuilderLabels = (typeof sortBuilderMessages.locales)["ru"];

export interface SortRule {
  field: string;
  direction: "asc" | "desc";
}

export interface SortBuilderProps {
  fields: { name: string; label: string }[];
  value: SortRule[];
  onValueChange: (v: SortRule[]) => void;
  className?: string;
  labels?: Partial<SortBuilderLabels>;
}

/**
 * Multi-column sort editor: field + direction per rule, drag (or keyboard)
 * to change priority. Each field can be used once.
 */
export const SortBuilder = React.forwardRef<HTMLDivElement, SortBuilderProps>(
  ({ fields, value, onValueChange, className, labels }, ref) => {
    const t = useMessages(sortBuilderMessages, labels);
    const used = new Set(value.map((r) => r.field));
    const free = fields.filter((f) => !used.has(f.name));
    const update = (index: number, next: SortRule) =>
      onValueChange(value.map((r, i) => (i === index ? next : r)));

    return (
      <div ref={ref} data-slot="sort-builder" className={cn("flex flex-col gap-2", className)}>
        {value.length === 0 ? <p className="text-ui-label text-ink-3">{t.empty}</p> : null}
        <SortableList
          items={value}
          getId={(r) => r.field}
          onReorder={onValueChange}
          as="ul"
          itemAs="li"
          aria-label={t.rules}
          renderItem={(rule, handle, { index }) => {
            const options = fields.filter((f) => f.name === rule.field || !used.has(f.name));
            return (
              <div data-slot="sort-rule" className="flex items-center gap-2 bg-ui-surface">
                <DragHandle {...handle} />
                <Select
                  size="sm"
                  aria-label={t.field}
                  wrapperClassName="w-48"
                  value={rule.field}
                  onChange={(e) => update(index, { ...rule, field: e.target.value })}
                  options={options.map((f) => ({ value: f.name, label: f.label }))}
                />
                <Button
                  variant="subtle"
                  size="sm"
                  aria-label={`${t.direction}: ${rule.direction === "asc" ? t.asc : t.desc}`}
                  title={rule.direction === "asc" ? t.asc : t.desc}
                  onClick={() =>
                    update(index, { ...rule, direction: rule.direction === "asc" ? "desc" : "asc" })
                  }
                  iconLeft={
                    rule.direction === "asc" ? (
                      <ArrowUpNarrowWide className="size-4" aria-hidden />
                    ) : (
                      <ArrowDownNarrowWide className="size-4" aria-hidden />
                    )
                  }
                >
                  <span className="hidden sm:inline">{rule.direction === "asc" ? t.asc : t.desc}</span>
                </Button>
                <button
                  type="button"
                  data-slot="sort-rule-remove"
                  aria-label={t.remove}
                  onClick={() => onValueChange(value.filter((_, i) => i !== index))}
                  className={cn(
                    "inline-flex size-control-sm shrink-0 cursor-pointer items-center justify-center !rounded-lg text-ink-3 transition-colors hover:bg-ui-surface-2 hover:text-ink-1",
                    focusRing,
                  )}
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
            );
          }}
        />
        <div>
          <Button
            variant="ghost"
            size="sm"
            disabled={free.length === 0}
            iconLeft={<Plus className="size-4" aria-hidden />}
            onClick={() => onValueChange([...value, { field: free[0]!.name, direction: "asc" }])}
          >
            {t.addSort}
          </Button>
        </div>
      </div>
    );
  },
);
SortBuilder.displayName = "SortBuilder";

export type SortPopoverProps = SortBuilderProps & {
  /** Custom trigger (rendered with `asChild`). Defaults to a "Sort (n)" button. */
  trigger?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: "start" | "center" | "end";
  contentClassName?: string;
};

/** "Sort (n)" button with a SortBuilder and "Clear all" in a popover. */
export const SortPopover = React.forwardRef<HTMLButtonElement, SortPopoverProps>(
  (
    { trigger, open: openProp, defaultOpen, onOpenChange, align = "start", contentClassName, ...builder },
    ref,
  ) => {
    const t = useMessages(sortBuilderMessages, builder.labels);
    const [inner, setInner] = React.useState(defaultOpen ?? false);
    const open = openProp ?? inner;
    const setOpen = (o: boolean) => {
      if (openProp === undefined) setInner(o);
      onOpenChange?.(o);
    };
    const count = builder.value.length;
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild ref={ref}>
          {trigger ?? (
            <Button
              variant={count > 0 ? "outline" : "subtle"}
              size="sm"
              data-slot="sort-popover-trigger"
              iconLeft={<ArrowUpDown className="size-4" aria-hidden />}
            >
              {count > 0 ? t.count(count) : t.sort}
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent
          align={align}
          aria-label={t.sorting}
          className={cn("w-auto max-w-[min(520px,calc(100vw-2rem))] p-3", contentClassName)}
        >
          <SortBuilder {...builder} />
          {count > 0 ? (
            <div className="mt-2 flex justify-end border-t border-hairline pt-2">
              <Button variant="ghost" size="sm" onClick={() => builder.onValueChange([])}>
                {t.clearAll}
              </Button>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
    );
  },
);
SortPopover.displayName = "SortPopover";
