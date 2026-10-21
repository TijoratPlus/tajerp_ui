import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Button, Progress, TajUIProvider } from "../../src";

const meta: Meta<typeof Progress> = {
  title: "Components/Feedback/Progress",
  component: Progress,
  parameters: {
    docs: {
      description: {
        component:
          "Linear progress for a known share of work — stock count, sales plan, syncing offline receipts. Use `indeterminate` when the total is unknown, and Spinner for short waits inside a control. Pair warning/danger tones with a label so status is not colour-only. Built on Radix Progress.",
      },
    },
  },
  args: { value: 62, label: "План продаж на октябрь", showValue: true, tone: "brand", size: "md" },
  argTypes: {
    tone: { control: "select", options: ["brand", "success", "warning", "danger", "info"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
    value: { control: { type: "range", min: 0, max: 100 } },
  },
};
export default meta;

type Story = StoryObj<typeof Progress>;

export const Playground: Story = {
  render: (args) => (
    <div className="max-w-md">
      <Progress {...args} />
    </div>
  ),
};

export const Tones: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-4">
      <Progress value={100} tone="success" label="Инвентаризация завершена" showValue />
      <Progress value={82} tone="warning" label="Склад заполнен" showValue />
      <Progress value={96} tone="danger" label="Лимит SMS почти исчерпан" showValue />
      <Progress value={40} tone="info" label="Импорт прайс-листа" showValue size="sm" />
    </div>
  ),
};

export const OfflineSync: Story = {
  render: () => {
    const total = 48;
    const [done, setDone] = React.useState(0);
    React.useEffect(() => {
      if (done >= total) return;
      const t = setTimeout(() => setDone((d) => d + 1), 120);
      return () => clearTimeout(t);
    }, [done]);
    return (
      <div className="flex max-w-md flex-col items-start gap-3">
        <Progress
          value={done}
          max={total}
          label={`Синхронизация чеков: ${done} из ${total}`}
          showValue
          tone={done >= total ? "success" : "brand"}
        />
        <Button size="sm" variant="subtle" onClick={() => setDone(0)}>
          Повторить
        </Button>
      </div>
    );
  },
};

export const Indeterminate: Story = {
  render: () => (
    <div className="max-w-md">
      <Progress indeterminate label="Подключение к серверу…" />
    </div>
  ),
};

export const Tajik: Story = {
  name: "Tajik (Тоҷикӣ)",
  render: () => (
    <TajUIProvider locale="tg">
      <div className="flex max-w-md flex-col gap-4">
        <Progress value={37} label="Ҳамоҳангсозии чекҳо" showValue />
        <Progress indeterminate />
      </div>
    </TajUIProvider>
  ),
};
