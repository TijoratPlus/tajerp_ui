import type { Meta, StoryObj } from "@storybook/react";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "../../src";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Overlays/Tooltip",
  component: Tooltip,
  parameters: {
    docs: {
      description: {
        component:
          "Hover/focus hint for icon buttons and truncated labels. Each `Tooltip` ships its own provider, so no extra setup is needed (use `TooltipProvider` only to share delay timing across many tooltips). Built on Radix Tooltip.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Playground: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost">Наведите</Button>
      </TooltipTrigger>
      <TooltipContent>Сканировать штрихкод</TooltipContent>
    </Tooltip>
  ),
};
