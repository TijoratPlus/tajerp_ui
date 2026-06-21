import type { Meta, StoryObj } from "@storybook/react";
import { Surface } from "../../src";

const meta: Meta<typeof Surface> = {
  title: "Components/Layout/Surface",
  component: Surface,
  parameters: {
    docs: {
      description: {
        component: "Low-level layout box with tone, elevation, radius, padding, and border tokens.",
      },
    },
  },
  argTypes: {
    tone: { control: "select", options: ["surface", "surface-2", "inset", "mist"] },
    elevation: { control: "select", options: ["none", "sm", "md", "lg"] },
    radius: { control: "select", options: ["none", "sm", "md", "lg", "xl"] },
    padding: { control: "select", options: ["none", "sm", "md", "lg"] },
    border: { control: "boolean" },
  },
  args: {
    tone: "surface",
    elevation: "md",
    radius: "lg",
    padding: "lg",
    border: true,
  },
};
export default meta;

type Story = StoryObj<typeof Surface>;

export const Playground: Story = {
  render: (args) => (
    <Surface {...args} style={{ maxWidth: 320 }}>
      <div style={{ fontWeight: 600 }}>Surface</div>
      <div style={{ color: "var(--ui-ink-3)", fontSize: 13 }}>The low-level box primitive.</div>
    </Surface>
  ),
};

export const Elevations: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {(["none", "sm", "md", "lg"] as const).map((e) => (
        <Surface key={e} elevation={e} padding="lg" border>
          elevation=&quot;{e}&quot;
        </Surface>
      ))}
    </div>
  ),
};

export const Tones: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {(["surface", "surface-2", "inset", "mist"] as const).map((t) => (
        <Surface key={t} tone={t} padding="lg" border>
          tone=&quot;{t}&quot;
        </Surface>
      ))}
    </div>
  ),
};
