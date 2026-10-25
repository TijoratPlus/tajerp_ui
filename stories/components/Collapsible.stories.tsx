import type { Meta, StoryObj } from "@storybook/react";
import { ChevronDown } from "lucide-react";
import * as React from "react";
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Input,
  Label,
} from "../../src";

const meta: Meta<typeof Collapsible> = {
  title: "Components/Layout/Collapsible",
  component: Collapsible,
  parameters: {
    docs: {
      description: {
        component:
          "Show or hide one region — advanced filters, receipt line details, optional fields. For several sections with headings use Accordion. The trigger is unstyled; wrap a Button with `asChild`. Height animates with the Accordion keyframes and is instant under reduced motion. Built on Radix Collapsible.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Collapsible>;

export const AdvancedFilters: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <Collapsible open={open} onOpenChange={setOpen} className="flex max-w-sm flex-col gap-2">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="self-start"
            iconRight={
              <ChevronDown
                aria-hidden
                className={`size-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              />
            }
          >
            Дополнительные фильтры
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col gap-3 !rounded-lg border border-hairline p-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="f-supplier">Поставщик</Label>
              <Input id="f-supplier" placeholder="ООО «Душанбе Агро»" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="f-warehouse">Склад</Label>
              <Input id="f-warehouse" placeholder="Основной склад" />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  },
};

export const Tajik: Story = {
  name: "Tajik (Тоҷикӣ)",
  render: () => (
    <Collapsible defaultOpen className="flex max-w-sm flex-col gap-2">
      <CollapsibleTrigger asChild>
        <Button variant="subtle" className="self-start">
          Тафсилоти чек
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="flex flex-col gap-1 text-ui-body text-ink-2">
          <li>Нон — 2 × 4,00 с</li>
          <li>Шир — 1 × 9,50 с</li>
          <li>Ҳамагӣ: 17,50 с</li>
        </ul>
      </CollapsibleContent>
    </Collapsible>
  ),
};
