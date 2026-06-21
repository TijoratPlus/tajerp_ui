import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Slider } from "../../src";

const meta: Meta<typeof Slider> = {
  title: "Components/Inputs/Slider",
  component: Slider,
  parameters: {
    docs: {
      description: {
        component: "Drag control for numeric ranges. Single thumb or dual-thumb range. Built on Radix Slider.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Slider>;

export const Playground: Story = {
  render: () => {
    const [value, setValue] = React.useState([40]);
    return (
      <div style={{ maxWidth: 320 }}>
        <Slider value={value} onValueChange={setValue} max={100} step={1} />
        <p style={{ marginTop: 12, color: "var(--ui-ink-3)", fontSize: 13 }}>
          {value[0]}%
        </p>
      </div>
    );
  },
};

export const Range: Story = {
  render: () => {
    const [value, setValue] = React.useState([20, 80]);
    return (
      <div style={{ maxWidth: 320 }}>
        <Slider value={value} onValueChange={setValue} max={100} step={5} />
        <p style={{ marginTop: 12, color: "var(--ui-ink-3)", fontSize: 13 }}>
          {value[0]} – {value[1]}
        </p>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Slider defaultValue={[50]} disabled />
    </div>
  ),
};
