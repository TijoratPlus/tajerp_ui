import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import {
  ExportMenu,
  FilterBar,
  SearchField,
  Select,
  TajUIProvider,
  type FilterChip,
} from "../../src";

const meta: Meta<typeof FilterBar> = {
  title: "Components/Business/FilterBar",
  component: FilterBar,
  parameters: {
    docs: {
      description: {
        component:
          'Filter row above reports and lists: filter controls (DateRangePicker, Select, SearchField, …) that wrap on narrow screens, active filters as removable chips, "Сбросить все" and the result count. Put export or view actions in `actions`.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof FilterBar>;

const STORES: Record<string, string> = { dsh: "Душанбе", khj: "Худжанд" };
const STATUSES: Record<string, string> = { paid: "Оплачено", debt: "В долг" };

export const Default: Story = {
  render: () => {
    const [store, setStore] = React.useState("dsh");
    const [status, setStatus] = React.useState("debt");
    const [query, setQuery] = React.useState("");

    const chips: FilterChip[] = [];
    if (store)
      chips.push({
        id: "store",
        label: "Филиал",
        value: STORES[store],
        onRemove: () => setStore(""),
      });
    if (status)
      chips.push({
        id: "status",
        label: "Статус",
        value: STATUSES[status],
        onRemove: () => setStatus(""),
      });
    if (query)
      chips.push({
        id: "q",
        label: "Поиск",
        value: `«${query}»`,
        onRemove: () => setQuery(""),
      });

    return (
      <FilterBar
        chips={chips}
        onClearAll={() => {
          setStore("");
          setStatus("");
          setQuery("");
        }}
        resultCount={128 - chips.length * 31}
        actions={
          <ExportMenu
            onExport={() => new Promise((r) => setTimeout(r, 1200))}
          />
        }
      >
        <div className="w-full sm:w-64">
          <SearchField
            aria-label="Поиск по чекам"
            placeholder="Поиск по чекам…"
            value={query}
            onValueChange={setQuery}
          />
        </div>
        <div className="w-full sm:w-44">
          <Select
            aria-label="Филиал"
            value={store}
            onChange={(e) => setStore(e.target.value)}
          >
            <option value="">Все филиалы</option>
            <option value="dsh">Душанбе</option>
            <option value="khj">Худжанд</option>
          </Select>
        </div>
        <div className="w-full sm:w-44">
          <Select
            aria-label="Статус"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Любой статус</option>
            <option value="paid">Оплачено</option>
            <option value="debt">В долг</option>
          </Select>
        </div>
      </FilterBar>
    );
  },
};

export const Tajik: Story = {
  render: () => (
    <TajUIProvider locale="tg">
      <FilterBar
        chips={[
          {
            id: "wh",
            label: "Анбор",
            value: "Анбори марказӣ",
            onRemove: () => {},
          },
          { id: "cat", label: "Гурӯҳ", value: "Нӯшокиҳо", onRemove: () => {} },
        ]}
        onClearAll={() => {}}
        resultCount={42}
      />
    </TajUIProvider>
  ),
};
