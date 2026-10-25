import { Filter, Plus, Trash2, X } from "lucide-react";
import * as React from "react";

import { defineMessages } from "../i18n/messages";
import { cn } from "../lib/cn";
import { focusRing } from "../lib/control";
import { parseDateInput, toISODate } from "../lib/date";
import { Button } from "./Button";
import { ChipInput } from "./ChipInput";
import { DatePicker } from "./DatePicker";
import { DateRangePicker } from "./DateRangePicker";
import { Input } from "./Input";
import { MultiSelect } from "./MultiSelect";
import { NumberField } from "./NumberField";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { Select } from "./Select";
import { useMessages } from "./TajUIProvider";

export type FilterFieldType =
  | "data"
  | "select"
  | "link"
  | "check"
  | "date"
  | "datetime"
  | "number"
  | "currency"
  | "text"
  | "user"
  | "duration"
  | "time";

export interface FilterField {
  name: string;
  label: string;
  type: FilterFieldType;
  options?: { value: string; label: string }[];
}

export type FilterOperator =
  | "equals"
  | "not equals"
  | "like"
  | "not like"
  | "in"
  | "not in"
  | "is"
  | ">"
  | "<"
  | ">="
  | "<="
  | "between"
  | "timespan";

/**
 * One condition. Value shapes by operator: `in`/`not in` → `string[]`;
 * `is` → `"set" | "not set"`; `between` → `[from, to]`; `timespan` → a
 * `TIMESPAN_OPTIONS` value; `check` fields → `boolean`. Dates are ISO
 * `YYYY-MM-DD` strings, numbers are numbers.
 */
export interface FilterRule {
  id: string;
  field: string;
  operator: FilterOperator;
  value: unknown;
}

export interface FilterGroup {
  id: string;
  conjunction: "and" | "or";
  rules: (FilterRule | FilterGroup)[];
}

export const filterBuilderMessages = defineMessages("filterBuilder", {
  ru: {
    filter: "Фильтр",
    filters: "Фильтры",
    field: "Поле",
    operator: "Условие",
    value: "Значение",
    addFilter: "Добавить фильтр",
    addCondition: "Добавить условие",
    addGroup: "Добавить группу",
    removeRule: "Удалить условие",
    removeGroup: "Удалить группу",
    clearAll: "Очистить всё",
    where: "Где",
    and: "и",
    or: "или",
    conjunction: "Связка условий",
    empty: "Фильтров нет",
    group: (n: number) => `Группа ${n}`,
    rule: (n: number) => `Условие ${n}`,
    yes: "Да",
    no: "Нет",
    set: "заполнено",
    notSet: "не заполнено",
    from: "От",
    to: "До",
    values: "Значения",
    selectValue: "Выберите…",
    equals: "равно",
    "not equals": "не равно",
    like: "содержит",
    "not like": "не содержит",
    in: "одно из",
    "not in": "ни одно из",
    is: "является",
    ">": "больше",
    "<": "меньше",
    ">=": "больше или равно",
    "<=": "меньше или равно",
    between: "между",
    timespan: "период",
    "last week": "Прошлая неделя",
    "last month": "Прошлый месяц",
    "last quarter": "Прошлый квартал",
    "last 6 months": "Последние 6 месяцев",
    "last year": "Прошлый год",
    yesterday: "Вчера",
    today: "Сегодня",
    tomorrow: "Завтра",
    "this week": "Эта неделя",
    "this month": "Этот месяц",
    "this quarter": "Этот квартал",
    "this year": "Этот год",
    "next week": "Следующая неделя",
    "next month": "Следующий месяц",
    "next quarter": "Следующий квартал",
    "next 6 months": "Следующие 6 месяцев",
    "next year": "Следующий год",
    count: (n: number) => `Фильтр (${n})`,
  },
  tg: {
    filter: "Филтр",
    filters: "Филтрҳо",
    field: "Майдон",
    operator: "Шарт",
    value: "Қимат",
    addFilter: "Илова кардани филтр",
    addCondition: "Илова кардани шарт",
    addGroup: "Илова кардани гурӯҳ",
    removeRule: "Нест кардани шарт",
    removeGroup: "Нест кардани гурӯҳ",
    clearAll: "Ҳамаро тоза кардан",
    where: "Ки",
    and: "ва",
    or: "ё",
    conjunction: "Пайвасти шартҳо",
    empty: "Филтр нест",
    group: (n: number) => `Гурӯҳи ${n}`,
    rule: (n: number) => `Шарти ${n}`,
    yes: "Ҳа",
    no: "Не",
    set: "пур карда шудааст",
    notSet: "холӣ аст",
    from: "Аз",
    to: "То",
    values: "Қиматҳо",
    selectValue: "Интихоб кунед…",
    equals: "баробар",
    "not equals": "баробар нест",
    like: "дорад",
    "not like": "надорад",
    in: "яке аз",
    "not in": "ҳеҷ яке аз",
    is: "ҳаст",
    ">": "зиёдтар",
    "<": "камтар",
    ">=": "зиёдтар ё баробар",
    "<=": "камтар ё баробар",
    between: "байни",
    timespan: "давра",
    "last week": "Ҳафтаи гузашта",
    "last month": "Моҳи гузашта",
    "last quarter": "Семоҳаи гузашта",
    "last 6 months": "6 моҳи охир",
    "last year": "Соли гузашта",
    yesterday: "Дирӯз",
    today: "Имрӯз",
    tomorrow: "Фардо",
    "this week": "Ҳамин ҳафта",
    "this month": "Ҳамин моҳ",
    "this quarter": "Ҳамин семоҳа",
    "this year": "Ҳамин сол",
    "next week": "Ҳафтаи оянда",
    "next month": "Моҳи оянда",
    "next quarter": "Семоҳаи оянда",
    "next 6 months": "6 моҳи оянда",
    "next year": "Соли оянда",
    count: (n: number) => `Филтр (${n})`,
  },
  en: {
    filter: "Filter",
    filters: "Filters",
    field: "Field",
    operator: "Operator",
    value: "Value",
    addFilter: "Add filter",
    addCondition: "Add condition",
    addGroup: "Add group",
    removeRule: "Remove condition",
    removeGroup: "Remove group",
    clearAll: "Clear all",
    where: "Where",
    and: "and",
    or: "or",
    conjunction: "Join conditions with",
    empty: "No filters",
    group: (n: number) => `Group ${n}`,
    rule: (n: number) => `Condition ${n}`,
    yes: "Yes",
    no: "No",
    set: "is set",
    notSet: "is not set",
    from: "From",
    to: "To",
    values: "Values",
    selectValue: "Select…",
    equals: "equals",
    "not equals": "not equals",
    like: "contains",
    "not like": "does not contain",
    in: "is any of",
    "not in": "is none of",
    is: "is",
    ">": "greater than",
    "<": "less than",
    ">=": "greater or equal",
    "<=": "less or equal",
    between: "between",
    timespan: "timespan",
    "last week": "Last week",
    "last month": "Last month",
    "last quarter": "Last quarter",
    "last 6 months": "Last 6 months",
    "last year": "Last year",
    yesterday: "Yesterday",
    today: "Today",
    tomorrow: "Tomorrow",
    "this week": "This week",
    "this month": "This month",
    "this quarter": "This quarter",
    "this year": "This year",
    "next week": "Next week",
    "next month": "Next month",
    "next quarter": "Next quarter",
    "next 6 months": "Next 6 months",
    "next year": "Next year",
    count: (n: number) => `Filter (${n})`,
  },
});

export type FilterBuilderLabels = (typeof filterBuilderMessages.locales)["ru"];

const TIMESPAN_VALUES = [
  "last week",
  "last month",
  "last quarter",
  "last 6 months",
  "last year",
  "yesterday",
  "today",
  "tomorrow",
  "this week",
  "this month",
  "this quarter",
  "this year",
  "next week",
  "next month",
  "next quarter",
  "next 6 months",
  "next year",
] as const;

export type TimespanValue = (typeof TIMESPAN_VALUES)[number];

/**
 * Frappe-compatible timespan values with Russian labels. The builder shows
 * them in the active locale; use this list for server mapping or menus.
 */
export const TIMESPAN_OPTIONS: { value: TimespanValue; label: string }[] =
  TIMESPAN_VALUES.map((value) => ({
    value,
    label: filterBuilderMessages.locales.ru[value],
  }));

/** Operators offered for a field type by default. */
export function defaultOperators(type: FilterFieldType): FilterOperator[] {
  switch (type) {
    case "data":
    case "text":
    case "link":
    case "user":
      return ["equals", "not equals", "like", "not like", "in", "not in", "is"];
    case "select":
      return ["equals", "not equals", "in", "not in", "is"];
    case "check":
      return ["equals"];
    case "date":
    case "datetime":
      return ["equals", "not equals", ">", "<", ">=", "<=", "between", "timespan", "is"];
    case "number":
    case "currency":
    case "duration":
      return ["equals", "not equals", ">", "<", ">=", "<=", "between", "is"];
    case "time":
      return ["equals", "not equals", ">", "<", ">=", "<=", "is"];
  }
}

/** Initial value when a rule gets a new field or operator. */
export function defaultFilterValue(field: FilterField, operator: FilterOperator): unknown {
  if (operator === "in" || operator === "not in") return [];
  if (operator === "is") return "set";
  if (operator === "timespan") return "last week";
  if (operator === "between") return [null, null];
  if (field.type === "check") return true;
  return field.type === "number" || field.type === "currency" || field.type === "duration"
    ? null
    : "";
}

let idCounter = 0;
/** Unique id for a new rule or group. */
export function newFilterId(prefix = "f"): string {
  idCounter += 1;
  return `${prefix}${Date.now().toString(36)}${idCounter.toString(36)}`;
}

export function isFilterGroup(node: FilterRule | FilterGroup): node is FilterGroup {
  return (node as FilterGroup).rules !== undefined;
}

/** Number of leaf conditions (for "Filter (n)" badges). */
export function countFilterRules(value: FilterRule[] | FilterGroup | undefined): number {
  if (!value) return 0;
  const nodes = Array.isArray(value) ? value : value.rules;
  return nodes.reduce((n, r) => n + (isFilterGroup(r) ? countFilterRules(r) : 1), 0);
}

export interface FilterValueInputArgs {
  field: FilterField;
  operator: FilterOperator;
  value: unknown;
  onChange: (v: unknown) => void;
}

export interface FilterBuilderProps {
  fields: FilterField[];
  /** Flat list (joined with AND) when `nested` is false; a group when true. */
  value: FilterRule[] | FilterGroup;
  onValueChange: (v: FilterRule[] | FilterGroup) => void;
  /** And/or conjunctions and nested groups (assignment rules, SLA conditions). */
  nested?: boolean;
  /** Maximum group depth with `nested`. Defaults to 3. */
  maxDepth?: number;
  operatorsFor?: (field: FilterField) => FilterOperator[];
  /** Custom value editor; return `undefined` to use the default one. */
  renderValueInput?: (args: FilterValueInputArgs) => React.ReactNode | undefined;
  className?: string;
  labels?: Partial<FilterBuilderLabels>;
}

type Ctx = {
  fields: FilterField[];
  fieldByName: Record<string, FilterField>;
  operatorsFor: (field: FilterField) => FilterOperator[];
  renderValueInput?: FilterBuilderProps["renderValueInput"];
  t: FilterBuilderLabels;
  maxDepth: number;
};

function makeRule(ctx: Ctx, fieldName?: string): FilterRule {
  const field = (fieldName ? ctx.fieldByName[fieldName] : undefined) ?? ctx.fields[0]!;
  const operator = ctx.operatorsFor(field)[0] ?? "equals";
  return { id: newFilterId("r"), field: field.name, operator, value: defaultFilterValue(field, operator) };
}

/**
 * Condition editor for list views and automation rules. Flat mode (default)
 * edits an AND-ed list of field / operator / value rows; `nested` edits an
 * and/or group with sub-groups. Value inputs follow the field type; override
 * any of them with `renderValueInput` (e.g. a Link autocomplete).
 */
export const FilterBuilder = React.forwardRef<HTMLDivElement, FilterBuilderProps>(
  (
    {
      fields,
      value,
      onValueChange,
      nested = false,
      maxDepth = 3,
      operatorsFor = (f) => defaultOperators(f.type),
      renderValueInput,
      className,
      labels,
    },
    ref,
  ) => {
    const t = useMessages(filterBuilderMessages, labels);
    const fieldByName = React.useMemo(
      () => Object.fromEntries(fields.map((f) => [f.name, f])),
      [fields],
    );
    const ctx: Ctx = { fields, fieldByName, operatorsFor, renderValueInput, t, maxDepth };

    if (nested) {
      const group: FilterGroup = Array.isArray(value)
        ? { id: "root", conjunction: "and", rules: value }
        : value;
      return (
        <div ref={ref} data-slot="filter-builder" data-nested="" className={cn("flex flex-col gap-2", className)}>
          <GroupEditor group={group} onChange={onValueChange} depth={1} ctx={ctx} />
        </div>
      );
    }

    const rules: FilterRule[] = Array.isArray(value)
      ? value
      : (value.rules.filter((r) => !isFilterGroup(r)) as FilterRule[]);
    return (
      <div ref={ref} data-slot="filter-builder" className={cn("flex flex-col gap-2", className)}>
        {rules.length === 0 ? <p className="text-ui-label text-ink-3">{t.empty}</p> : null}
        {rules.map((rule, i) => (
          <div key={rule.id} className="flex items-start gap-2">
            <span className="w-14 shrink-0 pt-2 text-ui-label text-ink-3">
              {i === 0 ? t.where : t.and}
            </span>
            <RuleEditor
              index={i}
              rule={rule}
              ctx={ctx}
              onChange={(next) => onValueChange(rules.map((r) => (r.id === rule.id ? next : r)))}
              onRemove={() => onValueChange(rules.filter((r) => r.id !== rule.id))}
            />
          </div>
        ))}
        <div>
          <Button
            variant="ghost"
            size="sm"
            iconLeft={<Plus className="size-4" aria-hidden />}
            disabled={fields.length === 0}
            onClick={() => onValueChange([...rules, makeRule(ctx)])}
          >
            {t.addFilter}
          </Button>
        </div>
      </div>
    );
  },
);
FilterBuilder.displayName = "FilterBuilder";

function GroupEditor({
  group,
  onChange,
  onRemove,
  depth,
  ctx,
}: {
  group: FilterGroup;
  onChange: (g: FilterGroup) => void;
  onRemove?: () => void;
  depth: number;
  ctx: Ctx;
}) {
  const { t } = ctx;
  const update = (rules: FilterGroup["rules"]) => onChange({ ...group, rules });
  const replace = (id: string, node: FilterRule | FilterGroup) =>
    update(group.rules.map((r) => (r.id === id ? node : r)));
  const remove = (id: string) => update(group.rules.filter((r) => r.id !== id));

  return (
    <div
      role={depth > 1 ? "group" : undefined}
      aria-label={depth > 1 ? t.group(depth - 1) : undefined}
      data-slot="filter-group"
      className={cn(
        "flex flex-col gap-2",
        depth > 1 && "!rounded-lg border border-hairline bg-ui-surface-2 p-2",
      )}
    >
      {group.rules.length === 0 ? <p className="text-ui-label text-ink-3">{t.empty}</p> : null}
      {group.rules.map((node, i) => {
        const lead =
          i === 0 ? (
            <span className="w-16 shrink-0 pt-2 text-ui-label text-ink-3">{t.where}</span>
          ) : i === 1 ? (
            <Select
              size="sm"
              aria-label={t.conjunction}
              wrapperClassName="w-16 shrink-0"
              value={group.conjunction}
              onChange={(e) =>
                onChange({ ...group, conjunction: e.target.value as FilterGroup["conjunction"] })
              }
              options={[
                { value: "and", label: t.and },
                { value: "or", label: t.or },
              ]}
            />
          ) : (
            <span className="w-16 shrink-0 pt-2 text-ui-label text-ink-3">
              {group.conjunction === "and" ? t.and : t.or}
            </span>
          );
        return (
          <div key={node.id} className="flex items-start gap-2">
            {lead}
            {isFilterGroup(node) ? (
              <div className="min-w-0 flex-1">
                <GroupEditor
                  group={node}
                  depth={depth + 1}
                  ctx={ctx}
                  onChange={(g) => replace(node.id, g)}
                  onRemove={() => remove(node.id)}
                />
              </div>
            ) : (
              <RuleEditor
                index={i}
                rule={node}
                ctx={ctx}
                onChange={(r) => replace(node.id, r)}
                onRemove={() => remove(node.id)}
              />
            )}
          </div>
        );
      })}
      <div className="flex flex-wrap items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          iconLeft={<Plus className="size-4" aria-hidden />}
          disabled={ctx.fields.length === 0}
          onClick={() => update([...group.rules, makeRule(ctx)])}
        >
          {t.addCondition}
        </Button>
        {depth < ctx.maxDepth ? (
          <Button
            variant="ghost"
            size="sm"
            iconLeft={<Plus className="size-4" aria-hidden />}
            disabled={ctx.fields.length === 0}
            onClick={() =>
              update([
                ...group.rules,
                {
                  id: newFilterId("g"),
                  conjunction: group.conjunction === "and" ? "or" : "and",
                  rules: [makeRule(ctx)],
                },
              ])
            }
          >
            {t.addGroup}
          </Button>
        ) : null}
        {onRemove ? (
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            iconLeft={<Trash2 className="size-4" aria-hidden />}
            onClick={onRemove}
          >
            {t.removeGroup}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function RuleEditor({
  index,
  rule,
  ctx,
  onChange,
  onRemove,
}: {
  index: number;
  rule: FilterRule;
  ctx: Ctx;
  onChange: (r: FilterRule) => void;
  onRemove: () => void;
}) {
  const { t, fields, fieldByName, operatorsFor } = ctx;
  const field = fieldByName[rule.field] ?? fields[0];
  if (!field) return null;
  const operators = operatorsFor(field);

  const setField = (name: string) => {
    const f = fieldByName[name];
    if (!f) return;
    const ops = operatorsFor(f);
    const op = ops.includes(rule.operator) ? rule.operator : (ops[0] ?? "equals");
    onChange({ ...rule, field: name, operator: op, value: defaultFilterValue(f, op) });
  };
  const setOperator = (op: FilterOperator) => {
    const prev = rule.operator;
    const sameShape =
      !["in", "not in", "is", "between", "timespan"].includes(op) &&
      !["in", "not in", "is", "between", "timespan"].includes(prev);
    onChange({ ...rule, operator: op, value: sameShape ? rule.value : defaultFilterValue(field, op) });
  };
  const setValue = (v: unknown) => onChange({ ...rule, value: v });

  const custom = ctx.renderValueInput?.({ field, operator: rule.operator, value: rule.value, onChange: setValue });

  return (
    <div
      role="group"
      aria-label={t.rule(index + 1)}
      data-slot="filter-rule"
      className="flex min-w-0 flex-1 flex-wrap items-start gap-2"
    >
      <Select
        size="sm"
        aria-label={t.field}
        wrapperClassName="w-40 shrink-0"
        value={field.name}
        onChange={(e) => setField(e.target.value)}
        options={fields.map((f) => ({ value: f.name, label: f.label }))}
      />
      <Select
        size="sm"
        aria-label={t.operator}
        wrapperClassName="w-40 shrink-0"
        value={rule.operator}
        onChange={(e) => setOperator(e.target.value as FilterOperator)}
        options={operators.map((op) => ({ value: op, label: t[op] }))}
      />
      <div className="min-w-40 flex-1">
        {custom !== undefined ? (
          custom
        ) : (
          <DefaultValueInput field={field} operator={rule.operator} value={rule.value} onChange={setValue} t={t} />
        )}
      </div>
      <button
        type="button"
        data-slot="filter-rule-remove"
        aria-label={t.removeRule}
        onClick={onRemove}
        className={cn(
          "inline-flex size-control-sm shrink-0 cursor-pointer items-center justify-center !rounded-lg text-ink-3 transition-colors hover:bg-ui-surface-2 hover:text-ink-1",
          focusRing,
        )}
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}

const asString = (v: unknown) => (v == null ? "" : String(v));
const asNumber = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
const asDate = (v: unknown) => {
  if (v instanceof Date) return v;
  if (typeof v === "string" && v) {
    const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(v);
    if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    return parseDateInput(v) ?? undefined;
  }
  return undefined;
};

function DefaultValueInput({
  field,
  operator,
  value,
  onChange,
  t,
}: FilterValueInputArgs & { t: FilterBuilderLabels }) {
  const common = { size: "sm" as const, "aria-label": t.value };

  if (operator === "is") {
    return (
      <Select
        {...common}
        value={asString(value) || "set"}
        onChange={(e) => onChange(e.target.value)}
        options={[
          { value: "set", label: t.set },
          { value: "not set", label: t.notSet },
        ]}
      />
    );
  }
  if (operator === "timespan") {
    return (
      <Select
        {...common}
        value={asString(value) || "last week"}
        onChange={(e) => onChange(e.target.value)}
        options={TIMESPAN_VALUES.map((v) => ({ value: v, label: t[v] }))}
      />
    );
  }
  if (operator === "in" || operator === "not in") {
    const list = Array.isArray(value) ? (value as string[]) : [];
    if (field.options?.length) {
      return (
        <MultiSelect
          size="sm"
          aria-label={t.values}
          options={field.options}
          value={list}
          onValueChange={onChange}
          placeholder={t.selectValue}
        />
      );
    }
    return <ChipInput size="sm" aria-label={t.values} value={list} onValueChange={onChange} />;
  }
  if (field.type === "check") {
    return (
      <Select
        {...common}
        value={value === false || value === 0 || value === "0" ? "0" : "1"}
        onChange={(e) => onChange(e.target.value === "1")}
        options={[
          { value: "1", label: t.yes },
          { value: "0", label: t.no },
        ]}
      />
    );
  }
  if (field.type === "select") {
    return (
      <Select
        {...common}
        value={asString(value)}
        placeholder={t.selectValue}
        onChange={(e) => onChange(e.target.value)}
        options={field.options ?? []}
      />
    );
  }
  if (field.type === "date" || field.type === "datetime") {
    if (operator === "between") {
      const [from, to] = Array.isArray(value) ? value : [];
      return (
        <DateRangePicker
          size="sm"
          aria-label={t.value}
          value={{ from: asDate(from), to: asDate(to) }}
          onValueChange={(r) =>
            onChange([r.from ? toISODate(r.from) : null, r.to ? toISODate(r.to) : null])
          }
          className="w-full"
        />
      );
    }
    return (
      <DatePicker
        size="sm"
        aria-label={t.value}
        value={asDate(value)}
        onValueChange={(d) => onChange(d ? toISODate(d) : "")}
      />
    );
  }
  if (field.type === "number" || field.type === "currency" || field.type === "duration") {
    if (operator === "between") {
      const [from, to] = Array.isArray(value) ? value : [];
      return (
        <div className="flex gap-2">
          <NumberField
            size="sm"
            aria-label={t.from}
            placeholder={t.from}
            value={asNumber(from)}
            onValueChange={(n) => onChange([n, asNumber(to) ?? null])}
            onClear={() => onChange([null, asNumber(to) ?? null])}
          />
          <NumberField
            size="sm"
            aria-label={t.to}
            placeholder={t.to}
            value={asNumber(to)}
            onValueChange={(n) => onChange([asNumber(from) ?? null, n])}
            onClear={() => onChange([asNumber(from) ?? null, null])}
          />
        </div>
      );
    }
    return (
      <NumberField
        {...common}
        value={asNumber(value)}
        onValueChange={onChange}
        onClear={() => onChange(null)}
      />
    );
  }
  if (field.type === "time") {
    return (
      <Input {...common} type="time" value={asString(value)} onChange={(e) => onChange(e.target.value)} />
    );
  }
  return <Input {...common} value={asString(value)} onChange={(e) => onChange(e.target.value)} />;
}

export type FilterPopoverProps = FilterBuilderProps & {
  /** Custom trigger (rendered with `asChild`). Defaults to a "Filter (n)" button. */
  trigger?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: "start" | "center" | "end";
  contentClassName?: string;
};

/** "Filter (n)" button with a FilterBuilder and "Clear all" in a popover. */
export const FilterPopover = React.forwardRef<HTMLButtonElement, FilterPopoverProps>(
  (
    { trigger, open: openProp, defaultOpen, onOpenChange, align = "start", contentClassName, ...builder },
    ref,
  ) => {
    const t = useMessages(filterBuilderMessages, builder.labels);
    const [inner, setInner] = React.useState(defaultOpen ?? false);
    const open = openProp ?? inner;
    const setOpen = (o: boolean) => {
      if (openProp === undefined) setInner(o);
      onOpenChange?.(o);
    };
    const count = countFilterRules(builder.value);
    const clear = () =>
      builder.onValueChange(
        builder.nested && !Array.isArray(builder.value)
          ? { ...builder.value, rules: [] }
          : [],
      );
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild ref={ref}>
          {trigger ?? (
            <Button
              variant={count > 0 ? "outline" : "subtle"}
              size="sm"
              data-slot="filter-popover-trigger"
              iconLeft={<Filter className="size-4" aria-hidden />}
            >
              {count > 0 ? t.count(count) : t.filter}
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent
          align={align}
          aria-label={t.filters}
          className={cn("w-auto max-w-[min(720px,calc(100vw-2rem))] p-3", contentClassName)}
        >
          <FilterBuilder {...builder} />
          {count > 0 ? (
            <div className="mt-2 flex justify-end border-t border-hairline pt-2">
              <Button variant="ghost" size="sm" onClick={clear}>
                {t.clearAll}
              </Button>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
    );
  },
);
FilterPopover.displayName = "FilterPopover";
