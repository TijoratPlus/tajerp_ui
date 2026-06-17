import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../src";

const meta: Meta = { title: "Overlays/Overlays" };
export default meta;

type Story = StoryObj;

export const DialogStory: Story = {
  name: "Dialog",
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

export const SheetStory: Story = {
  name: "Sheet",
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

export const PopoverStory: Story = {
  name: "Popover",
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

export const TooltipStory: Story = {
  name: "Tooltip",
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost">Наведите</Button>
      </TooltipTrigger>
      <TooltipContent>Сканировать штрихкод</TooltipContent>
    </Tooltip>
  ),
};
