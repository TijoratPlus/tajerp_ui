import type { Meta, StoryObj } from "@storybook/react";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DescriptionDetails,
  DescriptionItem,
  DescriptionList,
  DescriptionTerm,
  TajUIProvider,
} from "../../src";

const meta: Meta<typeof DescriptionList> = {
  title: "Components/Data Display/DescriptionList",
  component: DescriptionList,
  parameters: {
    docs: {
      description: {
        component:
          'Key/value pairs for document, customer and supplier cards. Pass `items` or compose `DescriptionItem` / `DescriptionTerm` / `DescriptionDetails`. `inline` puts term and value side by side (stacks on phones), `stacked` puts the term above, `grid` lays stacked items in 1–3 columns. `copyable` adds a copy button with a localized "Скопировано" status.',
      },
    },
  },
  args: { layout: "inline", dense: false, columns: 2 },
  argTypes: {
    layout: { control: "inline-radio", options: ["inline", "stacked", "grid"] },
    columns: { control: "inline-radio", options: [1, 2, 3] },
  },
};
export default meta;

type Story = StoryObj<typeof DescriptionList>;

const customer = [
  { term: "Клиент", description: "ООО «Сомон Савдо»" },
  { term: "ИНН", description: "020 123 456", copyable: "020123456" },
  {
    term: "Телефон",
    description: "+992 93 123 45 67",
    copyable: true,
    hint: "WhatsApp, после 10:00",
  },
  { term: "Адрес", description: "г. Душанбе, ул. Рудаки, 45" },
  { term: "Условия оплаты", description: "Отсрочка 14 дней" },
  { term: "Долг", description: "18 450,00 с" },
];

export const Playground: Story = {
  render: (args) => (
    <div style={{ maxWidth: 640 }}>
      <DescriptionList {...args} items={customer} />
    </div>
  ),
};

export const InvoiceCard: Story = {
  render: () => (
    <Card style={{ maxWidth: 480 }}>
      <CardHeader>
        <CardTitle>Счёт СФ-2041</CardTitle>
      </CardHeader>
      <CardContent>
        <DescriptionList dense>
          <DescriptionItem>
            <DescriptionTerm>Статус</DescriptionTerm>
            <DescriptionDetails>
              <Badge tone="warning" size="sm">
                Ожидает оплаты
              </Badge>
            </DescriptionDetails>
          </DescriptionItem>
          <DescriptionItem>
            <DescriptionTerm>Дата</DescriptionTerm>
            <DescriptionDetails>21.10.2026</DescriptionDetails>
          </DescriptionItem>
          <DescriptionItem>
            <DescriptionTerm>Сумма</DescriptionTerm>
            <DescriptionDetails hint="в т.ч. НДС 14 % — 1 015,79 с">
              8 271,50 с
            </DescriptionDetails>
          </DescriptionItem>
          <DescriptionItem>
            <DescriptionTerm>Счёт получателя</DescriptionTerm>
            <DescriptionDetails copyable>
              TJ12 3456 7890 1234 5678
            </DescriptionDetails>
          </DescriptionItem>
        </DescriptionList>
      </CardContent>
    </Card>
  ),
};

export const Grid: Story = {
  render: () => (
    <div style={{ maxWidth: 820 }}>
      <DescriptionList layout="grid" columns={3} items={customer} />
    </div>
  ),
};

export const Tajik: Story = {
  render: () => (
    <TajUIProvider locale="tg">
      <div style={{ maxWidth: 560 }}>
        <DescriptionList
          layout="stacked"
          items={[
            { term: "Мизоҷ", description: "ҶДММ «Ҳисор Савдо»" },
            { term: "РМА", description: "030 456 789", copyable: true },
            { term: "Суроға", description: "ш. Хуҷанд, кӯчаи Ленин, 12" },
            {
              term: "Қарз",
              description: "4 200,00 с",
              hint: "Мӯҳлати пардохт — 30 октябр",
            },
          ]}
        />
      </div>
    </TajUIProvider>
  ),
};
