import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../src";

const meta: Meta<typeof Dialog> = {
  title: "Components/Overlays/Dialog",
  component: Dialog,
  parameters: {
    docs: {
      description: {
        component:
          "Modal dialog for confirmations and focused tasks. Compose with `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, and `DialogFooter`. Built on Radix Dialog.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Dialog>;

export const Playground: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Открыть диалог</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Подтвердите оплату</DialogTitle>
          <DialogDescription>Сумма к оплате: 4 820 сомони.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost">Отмена</Button>
          <Button>Оплатить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
