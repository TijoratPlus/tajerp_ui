import type { Meta, StoryObj } from "@storybook/react";
import { Link } from "../../src";

const meta: Meta<typeof Link> = {
  title: "Components/Actions/Link",
  component: Link,
  parameters: {
    docs: {
      description: {
        component:
          "Styled anchor with brand variants and an optional external-link affordance (opens a new tab and appends an arrow icon).",
      },
    },
  },
  args: { children: "Открыть документацию", href: "#" },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "subtle", "muted"],
      description: "Text colour emphasis.",
      table: { defaultValue: { summary: "default" } },
    },
    underline: {
      control: "select",
      options: ["hover", "always", "none"],
      table: { defaultValue: { summary: "hover" } },
    },
    external: {
      control: "boolean",
      description: "Open in a new tab and show the external-link icon.",
    },
  },
};
export default meta;

type Story = StoryObj<typeof Link>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Link href="#" variant="default">
        Default link
      </Link>
      <Link href="#" variant="subtle">
        Subtle link
      </Link>
      <Link href="#" variant="muted">
        Muted link
      </Link>
      <Link href="#" underline="always">
        Always underlined
      </Link>
    </div>
  ),
};

export const External: Story = {
  args: {
    external: true,
    children: "tijorat.plus",
    href: "https://www.tijorat.plus",
  },
};
