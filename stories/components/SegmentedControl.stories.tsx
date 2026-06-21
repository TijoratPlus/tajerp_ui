import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { SegmentedControl } from "../../src";

const meta: Meta<typeof SegmentedControl> = {
  title: "Components/Inputs/SegmentedControl",
  component: SegmentedControl,
  parameters: {
    docs: {
      description: {
        component:
          "Mutually exclusive option picker rendered as a pill group. Use for 2–5 related choices (language, view mode, period).",
      },
    },
  },
  args: {
    options: [
      { value: "RU", label: "RU" },
      { value: "TJ", label: "TJ" },
      { value: "EN", label: "EN" },
    ],
  },
};
export default meta;

type Story = StoryObj<typeof SegmentedControl>;

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = React.useState("RU");
    return <SegmentedControl {...args} value={value} onChange={setValue} />;
  },
};

export const ThreeOptions: Story = {
  render: () => {
    const [period, setPeriod] = React.useState("day");
    return (
      <SegmentedControl
        value={period}
        onChange={setPeriod}
        options={[
          { value: "day", label: "День" },
          { value: "week", label: "Неделя" },
          { value: "month", label: "Месяц" },
        ]}
      />
    );
  },
};
