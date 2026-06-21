import type { Meta, StoryObj } from "@storybook/react";
import { Button, Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../../src";

const meta: Meta<typeof Sheet> = {
  title: "Components/Overlays/Sheet",
  component: Sheet,
  parameters: {
    docs: {
      description: {
        component:
          "Slide-in panel from the screen edge — cart, filters, mobile nav. Built on Radix Dialog (same primitives as Dialog).",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Sheet>;

export const Playground: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Открыть панель</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Корзина</SheetTitle>
        </SheetHeader>
        <div style={{ padding: 16, color: "var(--ui-ink-2)" }}>3 позиции</div>
      </SheetContent>
    </Sheet>
  ),
};
