import type { Meta, StoryObj } from "@storybook/react";
import { Archive, Bold, Italic, Star } from "lucide-react";
import { Toggle } from "../../src";

const meta: Meta<typeof Toggle> = {
  title: "Components/Actions/Toggle",
  component: Toggle,
  parameters: {
    docs: {
      description: {
        component:
          "Two-state button for an on/off option that applies immediately (bold text, \"show archived\", favourite product). Announced with `aria-pressed`. Use Switch for settings and Checkbox in forms. Icon-only toggles need `aria-label`. Built on Radix Toggle.",
      },
    },
  },
  args: { variant: "default", size: "md" },
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "outline"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof Toggle>;

export const Playground: Story = {
  render: (args) => (
    <Toggle {...args}>
      <Archive aria-hidden />
      Показать архив
    </Toggle>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <div className="flex gap-1">
      <Toggle aria-label="Жирный">
        <Bold aria-hidden />
      </Toggle>
      <Toggle aria-label="Курсив" variant="outline">
        <Italic aria-hidden />
      </Toggle>
      <Toggle aria-label="В избранное" defaultPressed variant="outline">
        <Star aria-hidden />
      </Toggle>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Toggle size="sm" variant="outline">Мало</Toggle>
      <Toggle size="md" variant="outline">Средне</Toggle>
      <Toggle size="lg" variant="outline">Крупно</Toggle>
    </div>
  ),
};

export const Tajik: Story = {
  name: "Tajik (Тоҷикӣ)",
  render: () => (
    <Toggle variant="outline">
      <Archive aria-hidden />
      Нишон додани бойгонӣ
    </Toggle>
  ),
};
