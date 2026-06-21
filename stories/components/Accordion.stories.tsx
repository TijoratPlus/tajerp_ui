import type { Meta, StoryObj } from "@storybook/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../src";

const meta: Meta<typeof Accordion> = {
  title: "Components/Data Display/Accordion",
  component: Accordion,
  parameters: {
    docs: {
      description: {
        component:
          "Expandable sections for FAQs and settings groups. Supports `type=\"single\"` or `\"multiple\"`. Built on Radix Accordion.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Accordion>;

export const Playground: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>Что входит в тариф?</AccordionTrigger>
          <AccordionContent>
            Безлимитные смены, склад, аналитика и поддержка 24/7.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Можно ли отменить подписку?</AccordionTrigger>
          <AccordionContent>
            Да, в любой момент из настроек — без скрытых комиссий.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

export const Multiple: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <Accordion type="multiple" defaultValue={["a", "b"]}>
        <AccordionItem value="a">
          <AccordionTrigger>Раздел A</AccordionTrigger>
          <AccordionContent>Содержимое раздела A.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger>Раздел B</AccordionTrigger>
          <AccordionContent>Содержимое раздела B.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};
