import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, StatCard, Switch, TajUIProvider } from "../../src";
import { GridLayout, type GridItem } from "../../src/charts";

const INITIAL: GridItem[] = [
  { i: "leads", x: 0, y: 0, w: 5, h: 4, minW: 4 },
  { i: "deals", x: 5, y: 0, w: 5, h: 4, minW: 4 },
  { i: "won", x: 10, y: 0, w: 5, h: 4, minW: 4 },
  { i: "revenue", x: 15, y: 0, w: 5, h: 4, minW: 4 },
  { i: "pipeline", x: 0, y: 4, w: 12, h: 9 },
  { i: "sources", x: 12, y: 4, w: 8, h: 9 },
];

const TITLES: Record<string, string> = {
  leads: "Новые лиды",
  deals: "Открытые сделки",
  won: "Выиграно",
  revenue: "Выручка",
  pipeline: "Воронка продаж",
  sources: "Источники лидов",
};

const meta: Meta<typeof GridLayout> = {
  title: "Components/Layout/GridLayout",
  component: GridLayout,
  parameters: {
    docs: {
      description: {
        component:
          "Dashboard grid (react-grid-layout) for CRM and ERP dashboards: number cards and charts on a 20-column grid. With `editable`, items drag and resize (corner handle) and `onLayoutChange` reports the new layout to save. Import from `tajerp_ui/charts`; its CSS is already part of `tajerp_ui/styles/index.css`.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof GridLayout>;

export const CRMDashboard: Story = {
  render: () => {
    const [layout, setLayout] = React.useState(INITIAL);
    const [editable, setEditable] = React.useState(false);
    return (
      <div className="flex flex-col gap-3">
        <label className="inline-flex items-center gap-2 text-ui-label">
          <Switch checked={editable} onCheckedChange={setEditable} /> Режим редактирования
        </label>
        <GridLayout
          layout={layout}
          onLayoutChange={setLayout}
          editable={editable}
          renderItem={(item) =>
            item.h <= 4 ? (
              <StatCard className="h-full" label={TITLES[item.i]!} value={1240} />
            ) : (
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>{TITLES[item.i]}</CardTitle>
                </CardHeader>
                <CardContent className="text-ui-body text-ink-3">График</CardContent>
              </Card>
            )
          }
        />
      </div>
    );
  },
};

export const Tajik: Story = {
  render: () => (
    <TajUIProvider locale="tg">
      <GridLayout
        editable
        layout={[
          { i: "a", x: 0, y: 0, w: 10, h: 5 },
          { i: "b", x: 10, y: 0, w: 10, h: 5 },
        ]}
        renderItem={(item) => (
          <Card className="h-full">
            <CardContent className="p-3">{item.i === "a" ? "Фурӯши имрӯза" : "Муштариёни нав"}</CardContent>
          </Card>
        )}
      />
    </TajUIProvider>
  ),
};
