import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "../src/components/Button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../src/components/DropdownMenu";
import { expectNoA11yViolations, renderWithUI } from "./utils";

function InvoiceMenu({ onSelect }: { onSelect?: (v: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="subtle">Действия</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Счёт № 1042</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => onSelect?.("open")}>Открыть</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelect?.("print")}>
          Печать чека
          <DropdownMenuShortcut>Ctrl+P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>Отправить SMS</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="danger" onSelect={() => onSelect?.("delete")}>
          Удалить
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe("DropdownMenu", () => {
  it("opens from the keyboard, moves with arrows and selects with Enter", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithUI(<InvoiceMenu onSelect={onSelect} />);

    const trigger = screen.getByRole("button", { name: "Действия" });
    trigger.focus();
    await user.keyboard("{Enter}");

    const menu = await screen.findByRole("menu");
    expect(menu).toHaveAttribute("data-slot", "dropdown-menu-content");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await waitFor(() =>
      expect(screen.getByRole("menuitem", { name: "Открыть" })).toHaveFocus(),
    );

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: /Печать чека/ })).toHaveFocus();
    // Disabled items are skipped.
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Удалить" })).toHaveFocus();
    expect(screen.getByRole("menuitem", { name: "Удалить" })).toHaveAttribute(
      "data-variant",
      "danger",
    );

    await expectNoA11yViolations();

    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith("delete");
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    renderWithUI(<InvoiceMenu />);
    const trigger = screen.getByRole("button", { name: "Действия" });
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    await screen.findByRole("menu");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("supports controlled open state and checkbox/radio items", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const onValueChange = vi.fn();
    const onOpenChange = vi.fn();
    renderWithUI(
      <DropdownMenu open onOpenChange={onOpenChange}>
        <DropdownMenuTrigger>Вид</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked onCheckedChange={onCheckedChange}>
            Показать архив
          </DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="80" onValueChange={onValueChange}>
            <DropdownMenuRadioItem value="58">58 мм</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="80">80 мм</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const checkbox = screen.getByRole("menuitemcheckbox", { name: "Показать архив" });
    expect(checkbox).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("menuitemradio", { name: "80 мм" })).toHaveAttribute(
      "aria-checked",
      "true",
    );

    checkbox.focus();
    await user.keyboard("{Enter}");
    expect(onCheckedChange).toHaveBeenCalledWith(false);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    // Controlled: stays open until the parent changes `open`.
    expect(screen.getByRole("menu")).toBeInTheDocument();

    screen.getByRole("menuitemradio", { name: "58 мм" }).focus();
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("58");
  });
});
