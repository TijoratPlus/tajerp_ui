import type { Meta, StoryObj } from "@storybook/react";
import { ResizablePanel, TajUIProvider } from "../../src";

const meta: Meta<typeof ResizablePanel> = {
  title: "Components/Layout/ResizablePanel",
  component: ResizablePanel,
  parameters: {
    docs: {
      description: {
        component:
          "Panel with a draggable edge for sidebars and detail panes (CRM deal side panel, email list). The handle is a focusable separator: arrows resize (Shift — larger steps), Home/End jump to the limits, double-click resets. Pass `storageKey` to remember the width in localStorage (failures are ignored).",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ResizablePanel>;

export const LeftSidebar: Story = {
  render: () => (
    <div className="flex h-72 !rounded-lg border border-hairline">
      <ResizablePanel defaultWidth={240} minWidth={180} maxWidth={420} storageKey="story.sidebar" className="border-r border-hairline bg-ui-surface-2 p-3">
        <p className="text-ui-label font-semibold">Представления</p>
        <p className="text-ui-helper text-ink-3">Мои лиды · Горячие · Без ответственного</p>
      </ResizablePanel>
      <div className="flex-1 p-3 text-ui-body">Список лидов</div>
    </div>
  ),
};

export const RightDetails: Story = {
  render: () => (
    <div className="flex h-72 !rounded-lg border border-hairline">
      <div className="flex-1 p-3 text-ui-body">Лента активности</div>
      <ResizablePanel side="left" defaultWidth={320} className="border-l border-hairline bg-ui-surface p-3">
        <p className="text-ui-label font-semibold">Сделка D-104</p>
        <p className="text-ui-helper text-ink-3">Pamir Foods · 210 000 с</p>
      </ResizablePanel>
    </div>
  ),
};

export const Tajik: Story = {
  render: () => (
    <TajUIProvider locale="tg">
      <div className="flex h-48 !rounded-lg border border-hairline">
        <ResizablePanel defaultWidth={220} className="border-r border-hairline p-3">
          Менюи паҳлӯӣ
        </ResizablePanel>
        <div className="flex-1 p-3">Рӯйхати муштариён</div>
      </div>
    </TajUIProvider>
  ),
};
