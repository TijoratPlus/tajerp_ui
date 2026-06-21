import type { Meta, StoryObj } from "@storybook/react";
import { Button, Popover, PopoverContent, PopoverTrigger } from "../../src";

const meta: Meta<typeof Popover> = {
  title: "Components/Overlays/Popover",
  component: Popover,
  parameters: {
    docs: {
      description: {
        component:
          "Floating panel anchored to a trigger. Use for filters, pickers, and compact forms. Built on Radix Popover.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Popover>;

export const Playground: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="subtle">Фильтры</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p style={{ margin: 0, fontWeight: 700 }}>Фильтр по категории</p>
        <p style={{ marginTop: 6, color: "var(--ui-ink-3)", fontSize: 13 }}>
          Содержимое поповера.
        </p>
      </PopoverContent>
    </Popover>
  ),
};
