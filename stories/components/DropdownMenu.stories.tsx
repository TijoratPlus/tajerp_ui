import type { Meta, StoryObj } from "@storybook/react";
import {
  ExternalLink,
  MessageSquare,
  MoreHorizontal,
  Printer,
  Trash2,
} from "lucide-react";
import * as React from "react";
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  TajUIProvider,
} from "../../src";

const meta: Meta<typeof DropdownMenu> = {
  title: "Components/Overlays/DropdownMenu",
  component: DropdownMenu,
  parameters: {
    docs: {
      description: {
        component:
          "Menu of actions behind a button — row actions in tables, the \"⋯\" menu on a document, view options. Use Select to pick a form value, and keep destructive items last with `variant=\"danger\"`. Arrow keys move, Enter selects, typing jumps to an item, Escape closes. Built on Radix DropdownMenu.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof DropdownMenu>;

export const InvoiceRowActions: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Действия со счётом № 1042">
          <MoreHorizontal className="size-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Счёт № 1042 · 1 234,50 с</DropdownMenuLabel>
        <DropdownMenuItem>
          <ExternalLink aria-hidden />
          Открыть
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Printer aria-hidden />
          Печать чека
          <DropdownMenuShortcut>Ctrl+P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <MessageSquare aria-hidden />
          Отправить SMS
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="danger">
          <Trash2 aria-hidden />
          Удалить
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const Tajik: Story = {
  name: "Tajik (Тоҷикӣ)",
  render: () => (
    <TajUIProvider locale="tg">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="subtle">Амалҳо</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-60">
          <DropdownMenuLabel>Ҳисобнома № 1042</DropdownMenuLabel>
          <DropdownMenuItem>
            <ExternalLink aria-hidden />
            Кушодан
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Printer aria-hidden />
            Чопи чек
          </DropdownMenuItem>
          <DropdownMenuItem>
            <MessageSquare aria-hidden />
            Фиристодани SMS
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="danger">
            <Trash2 aria-hidden />
            Нест кардан
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TajUIProvider>
  ),
};

export const CheckboxRadioAndSubmenu: Story = {
  render: () => {
    const [archived, setArchived] = React.useState(false);
    const [paid, setPaid] = React.useState(true);
    const [width, setWidth] = React.useState("80");
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Вид и печать</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-60">
          <DropdownMenuLabel>Показывать</DropdownMenuLabel>
          <DropdownMenuCheckboxItem checked={paid} onCheckedChange={setPaid}>
            Оплаченные
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={archived} onCheckedChange={setArchived}>
            Архивные
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Ширина чека</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={width} onValueChange={setWidth}>
            <DropdownMenuRadioItem value="58">58 мм</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="80">80 мм</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger inset>Экспорт</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Excel (.xlsx)</DropdownMenuItem>
                <DropdownMenuItem>PDF</DropdownMenuItem>
                <DropdownMenuItem>CSV</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

export const TouchDensity: Story = {
  render: () => (
    <div data-density="touch">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="md">Чек № 58</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuItem>
            <Printer aria-hidden />
            Печать повторно
          </DropdownMenuItem>
          <DropdownMenuItem>
            <MessageSquare aria-hidden />
            Отправить SMS
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="danger">Аннулировать</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};
