import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarFallback, Badge, HoverCard, HoverCardContent, HoverCardTrigger, Link } from "../../src";

const meta: Meta<typeof HoverCard> = {
  title: "Components/Overlays/HoverCard",
  component: HoverCard,
  parameters: {
    docs: {
      description: {
        component:
          "Preview shown on hover or keyboard focus — a customer card behind a name, product details behind an SKU. It is an enhancement: the trigger must lead to the same information (usually a link), and the card must not hold the only copy of an action. For click-to-open content use Popover. Built on Radix HoverCard.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof HoverCard>;

export const CustomerPreview: Story = {
  render: () => (
    <p className="text-ui-body text-ink-2">
      Покупатель:{" "}
      <HoverCard>
        <HoverCardTrigger asChild>
          <Link href="#customer-118">Фаррух Раҳимов</Link>
        </HoverCardTrigger>
        <HoverCardContent>
          <div className="flex gap-3">
            <Avatar>
              <AvatarFallback>ФР</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col gap-1">
              <p className="font-bold text-ink-1">Фаррух Раҳимов</p>
              <p className="text-ui-label text-ink-3">+992 93 555 12 34 · Душанбе</p>
              <div className="flex items-center gap-2 text-ui-label">
                <Badge tone="warning" size="sm">Долг</Badge>
                <span className="text-ink-2">1 234,50 с</span>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </p>
  ),
};

export const Tajik: Story = {
  name: "Tajik (Тоҷикӣ)",
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link href="#sku-1042">SKU-1042</Link>
      </HoverCardTrigger>
      <HoverCardContent>
        <p className="font-bold text-ink-1">Равғани пахта, 1 л</p>
        <p className="text-ui-label text-ink-3">Боқимонда дар анбор: 24 адад</p>
        <p className="text-ui-label text-ink-3">Нархи чакана: 28,00 с</p>
      </HoverCardContent>
    </HoverCard>
  ),
};
