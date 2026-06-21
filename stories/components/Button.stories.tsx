import type { Meta, StoryObj } from "@storybook/react";
import { ArrowRight, Plus } from "lucide-react";
import { Button } from "../../src";

const meta: Meta<typeof Button> = {
  title: "Components/Actions/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          "Primary action trigger. Supports five visual variants, four sizes, a loading state, and leading/trailing icons.",
      },
    },
  },
  args: { children: "Оплатить", variant: "solid", size: "sm" },
  argTypes: {
    variant: {
      control: "select",
      options: ["solid", "outline", "ghost", "subtle", "danger"],
      description: "Visual emphasis of the button.",
      table: { defaultValue: { summary: "solid" } },
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "icon"],
      description: "Control height / padding. `icon` renders a square icon button.",
      table: { defaultValue: { summary: "sm" } },
    },
    loading: { control: "boolean", description: "Show a spinner and disable the button." },
    disabled: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <Button variant="solid">Solid</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="subtle">Subtle</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Добавить">
        <Plus className="size-4" />
      </Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <Button iconLeft={<Plus className="size-4" />}>Добавить товар</Button>
      <Button variant="outline" iconRight={<ArrowRight className="size-4" />}>
        Далее
      </Button>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <Button loading>Сохранение…</Button>
      <Button disabled>Disabled</Button>
      <Button variant="danger">Удалить</Button>
    </div>
  ),
};
