import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../src";

const meta: Meta<typeof Card> = {
  title: "Components/Layout/Card",
  component: Card,
  parameters: {
    docs: {
      description: {
        component:
          "Structured content container with header, body, and footer slots. Pick a semantic `variant` preset, or compose the look directly with the tone / elevation / radius / padding / border axes (any axis overrides the preset). Use `as` to render a different element.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "elevated",
        "strong",
        "muted",
        "warning",
        "interactive",
      ],
    },
    tone: {
      control: "select",
      options: ["surface", "surface-2", "inset", "mist"],
    },
    elevation: { control: "select", options: ["none", "sm", "md", "lg"] },
    radius: { control: "select", options: ["none", "sm", "md", "lg", "xl"] },
    padding: { control: "select", options: ["none", "sm", "md", "lg"] },
    border: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Playground: Story = {
  args: {
    variant: "elevated",
  },
  render: (args) => (
    <Card {...args} style={{ maxWidth: 360 }}>
      <CardHeader>
        <CardTitle>Смена №1042</CardTitle>
        <CardDescription>Открыта в 09:00 · Касса 2</CardDescription>
      </CardHeader>
      <CardContent>
        <p style={{ margin: 0, color: "var(--ui-ink-2)" }}>
          Продаж за смену: 128 · Выручка: 4 820 c.
        </p>
      </CardContent>
      <CardFooter>
        <Button size="sm">Закрыть смену</Button>
      </CardFooter>
    </Card>
  ),
};

export const Variants: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gap: 16,
        gridTemplateColumns: "repeat(3, 1fr)",
      }}
    >
      {(
        [
          "default",
          "elevated",
          "strong",
          "muted",
          "warning",
          "interactive",
        ] as const
      ).map((v) => (
        <Card key={v} variant={v}>
          <CardHeader>
            <CardTitle style={{ fontSize: 16 }}>{v}</CardTitle>
          </CardHeader>
          <CardContent>
            <span style={{ color: "var(--ui-ink-3)", fontSize: 13 }}>
              variant=&quot;{v}&quot;
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
};

/** Card doubles as the low-level box primitive — compose tone directly. */
export const Tones: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {(["surface", "surface-2", "inset", "mist"] as const).map((t) => (
        <Card key={t} tone={t} padding="lg" border>
          tone=&quot;{t}&quot;
        </Card>
      ))}
    </div>
  ),
};

export const Elevations: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {(["none", "sm", "md", "lg"] as const).map((e) => (
        <Card key={e} elevation={e} padding="lg" border>
          elevation=&quot;{e}&quot;
        </Card>
      ))}
    </div>
  ),
};
