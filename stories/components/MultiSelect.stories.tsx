import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Label, MultiSelect, TajUIProvider, type MultiSelectOption } from "../../src";

const warehouses: MultiSelectOption[] = [
  { value: "dsh-main", label: "Главный склад, Душанбе", group: "Душанбе" },
  { value: "dsh-korvon", label: "Магазин «Корвон»", group: "Душанбе" },
  { value: "dsh-sino", label: "Магазин Сино", group: "Душанбе" },
  { value: "khj-1", label: "Склад Худжанд", group: "Согдийская обл." },
  { value: "khj-panj", label: "Магазин «Панчшанбе»", group: "Согдийская обл." },
  { value: "isf", label: "Склад Исфара (закрыт)", group: "Согдийская обл.", disabled: true },
  { value: "bkh", label: "Склад Бохтар", group: "Хатлонская обл." },
  { value: "kul", label: "Магазин Куляб", group: "Хатлонская обл." },
];

const categories: MultiSelectOption[] = [
  { value: "dairy", label: "Молочные продукты" },
  { value: "bakery", label: "Хлеб и выпечка" },
  { value: "grocery", label: "Бакалея" },
  { value: "drinks", label: "Напитки" },
  { value: "household", label: "Бытовая химия" },
  { value: "sweets", label: "Сладости" },
  { value: "frozen", label: "Заморозка" },
];

const meta: Meta<typeof MultiSelect> = {
  title: "Components/Inputs/MultiSelect",
  component: MultiSelect,
  parameters: {
    docs: {
      description: {
        component:
          "Pick several values from a searchable list — e.g. filter reports by warehouses or product categories. Selected values show as chips (Backspace removes the last one); use `maxVisibleChips` in tight toolbars, `selectAll` for long lists, `creatable` for tags. For a single value use Autocomplete or Select.",
      },
    },
  },
  args: { size: "md", disabled: false, loading: false },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
};
export default meta;

type Story = StoryObj<typeof MultiSelect>;

export const Warehouses: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string[]>(["dsh-main", "khj-1"]);
    return (
      <div style={{ maxWidth: 420, display: "grid", gap: 6 }}>
        <Label htmlFor="ms-warehouses">Склады</Label>
        <MultiSelect
          {...args}
          id="ms-warehouses"
          options={warehouses}
          value={value}
          onValueChange={setValue}
          placeholder="Все склады"
          selectAll
        />
        <p style={{ color: "var(--ui-ink-3)", fontSize: 13 }}>Выбрано: {value.join(", ") || "—"}</p>
      </div>
    );
  },
};

export const ReportToolbar: Story = {
  name: "Report filter (+N overflow)",
  render: (args) => (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", maxWidth: 720 }}>
      <div style={{ width: 300, display: "grid", gap: 6 }}>
        <Label htmlFor="ms-wh">Склады</Label>
        <MultiSelect
          {...args}
          id="ms-wh"
          size="sm"
          options={warehouses}
          defaultValue={["dsh-main", "dsh-korvon", "dsh-sino", "bkh"]}
          maxVisibleChips={2}
          selectAll
        />
      </div>
      <div style={{ width: 300, display: "grid", gap: 6 }}>
        <Label htmlFor="ms-cat">Категории</Label>
        <MultiSelect
          {...args}
          id="ms-cat"
          size="sm"
          options={categories}
          defaultValue={["dairy", "drinks"]}
          maxVisibleChips={2}
          placeholder="Все категории"
        />
      </div>
    </div>
  ),
};

export const GroupsProp: Story = {
  name: "Groups prop",
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <MultiSelect
        {...args}
        aria-label="Категории"
        groups={[
          { label: "Продукты", options: categories.slice(0, 4) },
          { label: "Непродовольственные", options: categories.slice(4) },
        ]}
        placeholder="Категории товаров"
      />
    </div>
  ),
};

export const Creatable: Story = {
  render: (args) => {
    const [options, setOptions] = React.useState(categories);
    const [value, setValue] = React.useState<string[]>(["grocery"]);
    return (
      <div style={{ maxWidth: 420, display: "grid", gap: 6 }}>
        <Label htmlFor="ms-tags">Метки товара</Label>
        <MultiSelect
          {...args}
          id="ms-tags"
          options={options}
          value={value}
          onValueChange={setValue}
          creatable
          clearSearchOnSelect
          onCreate={(text) => {
            const value = `tag-${Date.now()}`;
            setOptions((prev) => [...prev, { value, label: text }]);
            return value;
          }}
          placeholder="Введите метку и нажмите Enter"
        />
      </div>
    );
  },
};

export const ServerSearch: Story = {
  name: "Server-side search + loading",
  render: (args) => {
    const [search, setSearch] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [options, setOptions] = React.useState<MultiSelectOption[]>(warehouses);
    React.useEffect(() => {
      setLoading(true);
      const timer = setTimeout(() => {
        const q = search.trim().toLowerCase();
        setOptions(warehouses.filter((w) => w.label.toLowerCase().includes(q)));
        setLoading(false);
      }, 600);
      return () => clearTimeout(timer);
    }, [search]);
    return (
      <div style={{ maxWidth: 420 }}>
        <MultiSelect
          {...args}
          aria-label="Склады"
          options={options}
          searchValue={search}
          onSearchChange={setSearch}
          filter={() => true}
          loading={loading}
        />
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12, maxWidth: 420 }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <MultiSelect
          key={size}
          aria-label={`Размер ${size}`}
          size={size}
          options={categories}
          defaultValue={["dairy", "bakery"]}
        />
      ))}
      <MultiSelect aria-label="Отключено" disabled options={categories} defaultValue={["sweets"]} />
    </div>
  ),
};

export const Touch: Story = {
  name: "Touch density",
  render: () => (
    <div data-density="touch" style={{ maxWidth: 420 }}>
      <MultiSelect aria-label="Склады" options={warehouses} defaultValue={["dsh-main", "kul"]} selectAll />
    </div>
  ),
};

export const Tajik: Story = {
  name: "Тоҷикӣ",
  render: () => (
    <TajUIProvider locale="tg">
      <div style={{ maxWidth: 420, display: "grid", gap: 6 }}>
        <Label htmlFor="ms-tg">Анборҳо</Label>
        <MultiSelect
          id="ms-tg"
          selectAll
          options={[
            { value: "dsh", label: "Анбори асосӣ, Душанбе", group: "Душанбе" },
            { value: "korvon", label: "Мағозаи «Корвон»", group: "Душанбе" },
            { value: "khj", label: "Анбори Хуҷанд", group: "Вилояти Суғд" },
            { value: "bkh", label: "Анбори Бохтар", group: "Вилояти Хатлон" },
            { value: "kul", label: "Мағозаи Кӯлоб", group: "Вилояти Хатлон" },
          ]}
          defaultValue={["dsh", "khj"]}
        />
      </div>
    </TajUIProvider>
  ),
};
