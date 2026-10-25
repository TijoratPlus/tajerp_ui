import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { BranchSwitcher, type Branch } from "../src/components/BranchSwitcher";
import { expectNoA11yViolations, renderWithUI } from "./utils";

const branches: Branch[] = [
  {
    id: "dsh",
    name: "Душанбе, Рудакӣ",
    address: "пр. Рудаки 12",
    kind: "store",
  },
  { id: "khj", name: "Худжанд", address: "ул. Ленина 5", kind: "store" },
  { id: "wh", name: "Центральный склад", kind: "warehouse" },
];

const many: Branch[] = [
  ...branches,
  { id: "blk", name: "Бохтар" },
  { id: "klb", name: "Кулоб" },
  { id: "isf", name: "Истаравшан" },
  { id: "pnj", name: "Панджакент" },
];

describe("BranchSwitcher", () => {
  it("shows the selection and picks a branch with the mouse", async () => {
    const onValueChange = vi.fn();
    renderWithUI(
      <BranchSwitcher
        branches={branches}
        defaultValue="dsh"
        onValueChange={onValueChange}
      />,
    );
    const trigger = screen.getByRole("button", { name: /Душанбе, Рудакӣ/ });
    await userEvent.click(trigger);
    const list = await screen.findByRole("listbox", { name: "Филиалы" });
    expect(screen.getByRole("option", { name: /Душанбе/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expectNoA11yViolations();
    await userEvent.click(screen.getByRole("option", { name: /Худжанд/ }));
    expect(onValueChange).toHaveBeenCalledWith("khj");
    await waitFor(() => expect(list).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: /Худжанд/ })).toBeInTheDocument();
  });

  it("supports arrows, Enter, Escape and typeahead", async () => {
    const onValueChange = vi.fn();
    renderWithUI(
      <BranchSwitcher
        branches={branches}
        allowAll
        value="all"
        onValueChange={onValueChange}
      />,
    );
    const trigger = screen.getByRole("button", { name: /Все филиалы/ });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const list = await screen.findByRole("listbox");
    await waitFor(() => expect(list).toHaveFocus());
    const activeName = () =>
      document.getElementById(list.getAttribute("aria-activedescendant")!)!
        .textContent;
    expect(activeName()).toContain("Все филиалы");
    await userEvent.keyboard("{ArrowDown}");
    expect(activeName()).toContain("Душанбе");
    await userEvent.keyboard("{End}");
    expect(activeName()).toContain("Центральный склад");
    await userEvent.keyboard("х");
    expect(activeName()).toContain("Худжанд");
    await userEvent.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("khj");

    await userEvent.click(trigger);
    await screen.findByRole("listbox");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    expect(trigger).toHaveFocus();
  });

  it("filters with a search field when there are more than 6 branches", async () => {
    const onValueChange = vi.fn();
    renderWithUI(
      <BranchSwitcher branches={many} onValueChange={onValueChange} />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: /Выберите филиал/ }),
    );
    const input = await screen.findByRole("combobox", {
      name: "Найти филиал…",
    });
    await waitFor(() => expect(input).toHaveFocus());
    await userEvent.type(input, "кул");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    await userEvent.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("klb");
  });

  it("shows an empty state when nothing matches", async () => {
    renderWithUI(<BranchSwitcher branches={many} defaultOpen />);
    const input = await screen.findByRole("combobox");
    await userEvent.type(input, "zzz");
    expect(screen.getByText("Филиал не найден")).toBeInTheDocument();
  });

  it("is controlled", async () => {
    function Controlled() {
      const [v, setV] = React.useState("dsh");
      return (
        <>
          <BranchSwitcher
            branches={branches}
            value={v}
            onValueChange={setV}
            variant="compact"
          />
          <output>{v}</output>
        </>
      );
    }
    renderWithUI(<Controlled />);
    await userEvent.click(
      screen.getByRole("button", { name: /Филиал:\s*Душанбе/ }),
    );
    await userEvent.click(
      await screen.findByRole("option", { name: /Центральный склад/ }),
    );
    expect(screen.getByRole("status")).toHaveTextContent("wh");
    await expectNoA11yViolations();
  });

  it("localizes to Tajik", async () => {
    renderWithUI(<BranchSwitcher branches={branches} allowAll defaultOpen />, {
      provider: { locale: "tg" },
    });
    expect(
      await screen.findByRole("option", { name: /Ҳамаи филиалҳо/ }),
    ).toBeInTheDocument();
  });
});
