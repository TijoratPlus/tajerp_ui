import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../src";

const meta: Meta<typeof Card> = {
  title: "Primitives/Card",
  component: Card,
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card variant="elevated" style={{ maxWidth: 360 }}>
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
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(3, 1fr)" }}>
      {(["default", "elevated", "strong", "muted", "warning", "interactive"] as const).map(
        (v) => (
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
        ),
      )}
    </div>
  ),
};
