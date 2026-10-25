import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { DurationInput, Label, TajUIProvider } from "../../src";

const meta: Meta<typeof DurationInput> = {
  title: "Components/Inputs/DurationInput",
  component: DurationInput,
  parameters: {
    docs: {
      description: {
        component:
          "Duration field (Frappe `Duration`): call length, SLA response time, task estimate. Each part is a small numeric input (↑/↓ step by one); the value is the total in seconds, so 90 minutes reads back as 1 h 30 min. `showDays` / `showSeconds` add parts.",
      },
    },
  },
  args: { size: "md", showDays: false, showSeconds: false, disabled: false },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
};
export default meta;

type Story = StoryObj<typeof DurationInput>;

const field = { display: "grid", gap: 6, justifyItems: "start" } as const;
const caption = { margin: 0, color: "var(--ui-ink-3)", fontSize: 13 } as const;

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(5400);
    return (
      <div style={field}>
        <Label id="estimate-label">Оценка задачи</Label>
        <DurationInput {...args} aria-labelledby="estimate-label" value={value} onValueChange={setValue} />
        <p style={caption}>Секунд: {value}</p>
      </div>
    );
  },
};

export const SlaResponse: Story = {
  name: "SLA: время ответа (с днями)",
  render: () => (
    <div style={field}>
      <Label id="sla-label">Время первого ответа</Label>
      <DurationInput aria-labelledby="sla-label" showDays defaultValue={86400 + 4 * 3600} />
    </div>
  ),
};

export const CallLength: Story = {
  name: "Длительность звонка (с секундами)",
  render: () => (
    <div style={field}>
      <Label id="call-label">Длительность звонка</Label>
      <DurationInput aria-labelledby="call-label" showSeconds defaultValue={185} />
    </div>
  ),
};

export const Tajik: Story = {
  name: "Тоҷикӣ",
  render: () => (
    <TajUIProvider locale="tg">
      <div style={field}>
        <Label id="tg-label">Давомнокии вазифа</Label>
        <DurationInput aria-labelledby="tg-label" showDays defaultValue={2 * 3600} />
      </div>
    </TajUIProvider>
  ),
};
