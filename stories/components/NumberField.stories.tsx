import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { NumberField } from "../../src";

const meta: Meta<typeof NumberField> = {
  title: "Components/Inputs/NumberField",
  component: NumberField,
  parameters: {
    docs: {
      description: {
        component: "Stepper input for quantities and amounts. Supports prefix/suffix and min/max bounds.",
      },
    },
  },
  args: { min: 0, max: 100, step: 1 },
  argTypes: { disabled: { control: "boolean" } },
};
export default meta;

type Story = StoryObj<typeof NumberField>;

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(1);
    return (
      <div style={{ maxWidth: 200 }}>
        <NumberField {...args} value={value} onValueChange={setValue} />
        <p style={{ marginTop: 12, color: "var(--ui-ink-3)", fontSize: 13 }}>
          Значение: {value}
        </p>
      </div>
    );
  },
};

export const WithAffixes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16 }}>
      <div style={{ width: 160 }}>
        <NumberField defaultValue={500} step={50} min={0} suffix="c." />
      </div>
      <div style={{ width: 140 }}>
        <NumberField defaultValue={2} min={1} max={10} prefix="×" />
      </div>
    </div>
  ),
};
