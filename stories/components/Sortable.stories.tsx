import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { DragHandle, SortableList, TajUIProvider } from "../../src";

const meta: Meta<typeof SortableList> = {
  title: "Components/Inputs/SortableList",
  component: SortableList,
  parameters: {
    docs: {
      description: {
        component:
          "Drag-to-reorder list on @dnd-kit for ordered settings: pipeline stages, list columns, sort priority, quick filters. Works with mouse, touch and keyboard (focus the grip, Space to pick up, arrows to move, Space to drop, Escape to cancel) and announces moves to screen readers. `renderItem` receives handle props — spread them on a `DragHandle`. `orientation` is vertical, horizontal or grid. Use `arrayMove` for your own reorder logic.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof SortableList>;

export const PipelineStages: Story = {
  render: () => {
    const [stages, setStages] = React.useState([
      "Новый",
      "Квалификация",
      "Демонстрация",
      "Переговоры",
      "Договор подписан",
    ]);
    return (
      <div className="max-w-sm">
        <SortableList
          items={stages}
          getId={(s) => s}
          onReorder={setStages}
          as="ul"
          itemAs="li"
          aria-label="Этапы воронки"
          renderItem={(stage, handle, { isDragging }) => (
            <div
              className={`flex items-center gap-2 !rounded-lg border border-hairline bg-ui-surface px-2 py-1.5 text-ui-body ${isDragging ? "shadow-tj-lg" : ""}`}
            >
              <DragHandle {...handle} />
              {stage}
            </div>
          )}
        />
      </div>
    );
  },
};

export const HorizontalChips: Story = {
  render: () => {
    const [cols, setCols] = React.useState(["Имя", "Телефон", "Статус", "Ответственный", "Сумма"]);
    return (
      <SortableList
        orientation="horizontal"
        items={cols}
        getId={(c) => c}
        onReorder={setCols}
        aria-label="Порядок колонок"
        renderItem={(col, handle) => (
          <span className="inline-flex items-center gap-1 !rounded-pill bg-mist py-0.5 pr-2 pl-0.5 text-ui-label text-mist-ink">
            <DragHandle {...handle} />
            {col}
          </span>
        )}
      />
    );
  },
};

export const Tajik: Story = {
  render: () => {
    const [items, setItems] = React.useState(["Нав", "Тасдиқшуда", "Музокира", "Бурд"]);
    return (
      <TajUIProvider locale="tg">
        <div className="max-w-sm">
          <SortableList
            items={items}
            getId={(s) => s}
            onReorder={setItems}
            aria-label="Марҳилаҳо"
            renderItem={(s, handle) => (
              <div className="flex items-center gap-2 !rounded-lg border border-hairline bg-ui-surface px-2 py-1.5">
                <DragHandle {...handle} />
                {s}
              </div>
            )}
          />
        </div>
      </TajUIProvider>
    );
  },
};
