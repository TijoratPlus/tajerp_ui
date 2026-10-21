import type { Meta, StoryObj } from "@storybook/react";
import { Kbd, KbdGroup } from "../../src";

const meta: Meta<typeof Kbd> = {
  title: "Components/Data Display/Kbd",
  component: Kbd,
  parameters: {
    docs: {
      description: {
        component:
          'Keyboard key for shortcut hints in menus, tooltips and the POS help sheet. Wrap a combination in `KbdGroup` (optionally with `separator="+"`).',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Kbd>;

export const Playground: Story = {
  args: { children: "F2" },
};

export const PosShortcuts: Story = {
  render: () => (
    <table className="text-ui-body text-ink-2">
      <tbody>
        {[
          ["Оплата", <Kbd key="f2">F2</Kbd>],
          [
            "Поиск товара",
            <KbdGroup key="k" separator="+">
              <Kbd>Ctrl</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>,
          ],
          [
            "Отложить чек",
            <KbdGroup key="h" separator="+">
              <Kbd>Shift</Kbd>
              <Kbd>F4</Kbd>
            </KbdGroup>,
          ],
          ["Количество", <Kbd key="m">*</Kbd>],
          ["Закрыть окно", <Kbd key="esc">Esc</Kbd>],
        ].map(([label, keys], i) => (
          <tr key={i}>
            <td className="py-1 pr-6">{label}</td>
            <td className="py-1">{keys}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

export const Tajik: Story = {
  render: () => (
    <p className="text-ui-body text-ink-2">
      Барои ҷустуҷӯи мол{" "}
      <KbdGroup separator="+">
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>{" "}
      -ро пахш кунед, барои пардохт — <Kbd>F2</Kbd>.
    </p>
  ),
};
