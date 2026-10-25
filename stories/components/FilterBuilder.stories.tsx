import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import {
  FilterBuilder,
  FilterPopover,
  type FilterField,
  type FilterGroup,
  type FilterRule,
  Input,
  TajUIProvider,
} from "../../src";

const FIELDS: FilterField[] = [
  { name: "lead_name", label: "Имя лида", type: "data" },
  {
    name: "status",
    label: "Статус",
    type: "select",
    options: [
      { value: "New", label: "Новый" },
      { value: "Contacted", label: "Связались" },
      { value: "Qualified", label: "Квалифицирован" },
      { value: "Junk", label: "Мусор" },
    ],
  },
  { name: "lead_owner", label: "Ответственный", type: "user" },
  { name: "annual_revenue", label: "Годовой оборот", type: "currency" },
  { name: "creation", label: "Создан", type: "date" },
  { name: "converted", label: "Конвертирован", type: "check" },
];

const meta: Meta<typeof FilterBuilder> = {
  title: "Components/Inputs/FilterBuilder",
  component: FilterBuilder,
  parameters: {
    docs: {
      description: {
        component:
          "Condition editor for list views (CRM leads, deals, contacts) and automation rules. Flat mode edits AND-ed field / operator / value rows; `nested` edits an and/or group with sub-groups (assignment rules, SLA conditions). Operators follow the field type (`defaultOperators`; override with `operatorsFor`). Value inputs: text → Input, select → Select (MultiSelect for `in`), check → Да/Нет, date → DatePicker / DateRangePicker (`between`) / `TIMESPAN_OPTIONS` (`timespan`), number/currency → NumberField. Replace any input with `renderValueInput` (e.g. a Link autocomplete). `FilterPopover` wraps it in a «Фильтр (n)» button with «Очистить всё».",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof FilterBuilder>;

export const ListViewPopover: Story = {
  render: () => {
    const [value, setValue] = React.useState<FilterRule[] | FilterGroup>([
      { id: "r1", field: "status", operator: "equals", value: "New" },
      { id: "r2", field: "creation", operator: "timespan", value: "this month" },
    ]);
    return (
      <div className="flex flex-col gap-3">
        <FilterPopover fields={FIELDS} value={value} onValueChange={setValue} />
        <pre className="text-ui-caption text-ink-3">{JSON.stringify(value, null, 2)}</pre>
      </div>
    );
  },
};

export const Flat: Story = {
  render: () => {
    const [value, setValue] = React.useState<FilterRule[] | FilterGroup>([
      { id: "r1", field: "annual_revenue", operator: ">", value: 100000 },
      { id: "r2", field: "status", operator: "in", value: ["New", "Contacted"] },
    ]);
    return <FilterBuilder fields={FIELDS} value={value} onValueChange={setValue} />;
  },
};

export const NestedAssignmentRule: Story = {
  render: () => {
    const [value, setValue] = React.useState<FilterRule[] | FilterGroup>({
      id: "root",
      conjunction: "and",
      rules: [
        { id: "r1", field: "status", operator: "equals", value: "New" },
        {
          id: "g1",
          conjunction: "or",
          rules: [
            { id: "r2", field: "annual_revenue", operator: ">=", value: 500000 },
            { id: "r3", field: "lead_name", operator: "like", value: "Душанбе" },
          ],
        },
      ],
    });
    return <FilterBuilder nested fields={FIELDS} value={value} onValueChange={setValue} />;
  },
};

export const CustomLinkInput: Story = {
  render: () => {
    const [value, setValue] = React.useState<FilterRule[] | FilterGroup>([
      { id: "r1", field: "lead_owner", operator: "equals", value: "" },
    ]);
    return (
      <FilterBuilder
        fields={FIELDS}
        value={value}
        onValueChange={setValue}
        renderValueInput={({ field, value: v, onChange }) =>
          field.type === "user" ? (
            <Input
              size="sm"
              aria-label="Пользователь"
              placeholder="Начните вводить имя…"
              value={String(v ?? "")}
              onChange={(e) => onChange(e.target.value)}
            />
          ) : undefined
        }
      />
    );
  },
};

export const Tajik: Story = {
  render: () => {
    const [value, setValue] = React.useState<FilterRule[] | FilterGroup>([
      { id: "r1", field: "lead_name", operator: "like", value: "Хуҷанд" },
    ]);
    return (
      <TajUIProvider locale="tg">
        <FilterPopover
          defaultOpen
          fields={[
            { name: "lead_name", label: "Номи муштарӣ", type: "data" },
            { name: "creation", label: "Сана", type: "date" },
          ]}
          value={value}
          onValueChange={setValue}
        />
      </TajUIProvider>
    );
  },
};
