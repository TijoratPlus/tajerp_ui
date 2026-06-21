import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "../../src";

const meta: Meta<typeof Skeleton> = {
  title: "Components/Feedback/Skeleton",
  component: Skeleton,
  parameters: {
    docs: {
      description: {
        component: "Placeholder shimmer for loading content. Variants: rect, circle, text (with optional `lines`).",
      },
    },
  },
  argTypes: {
    variant: { control: "select", options: ["rect", "circle", "text"] },
    lines: { control: "number" },
  },
};
export default meta;

type Story = StoryObj<typeof Skeleton>;

export const Playground: Story = {
  args: { variant: "rect", className: "h-24 w-full max-w-xs" },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 360 }}>
      <Skeleton variant="rect" className="h-24 w-full" />
      <Skeleton variant="circle" className="size-12" />
      <Skeleton variant="text" className="w-40" />
      <Skeleton variant="text" lines={3} />
    </div>
  ),
};

export const CardLayout: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        maxWidth: 360,
        padding: 16,
        border: "1px solid var(--ui-hairline)",
        borderRadius: 16,
        background: "var(--ui-surface)",
      }}
    >
      <Skeleton variant="circle" className="size-12 shrink-0" />
      <div style={{ flex: 1 }}>
        <Skeleton variant="text" className="mb-2 w-1/2" />
        <Skeleton variant="text" lines={2} />
      </div>
    </div>
  ),
};
