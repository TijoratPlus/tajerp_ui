import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  CommandSeparator,
  commandFilter,
} from "../src/components/Command";
import { formatHotkey, matchesHotkey, useHotkey } from "../src/lib/useHotkey";
import { expectNoA11yViolations, renderWithUI } from "./utils";

function Palette({
  onSelect = () => {},
  ...props
}: { onSelect?: (v: string) => void } & React.ComponentProps<typeof Command>) {
  return (
    <Command {...props}>
      <CommandInput />
      <CommandList>
        <CommandEmpty />
        <CommandGroup heading="Действия">
          <CommandItem onSelect={onSelect} shortcut="mod+n">
            Новая продажа
          </CommandItem>
          <CommandItem onSelect={onSelect} keywords={["закупка"]}>
            Приход товара
          </CommandItem>
          <CommandItem onSelect={onSelect} disabled>
            Новый клиент
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Перейти">
          <CommandItem onSelect={onSelect}>Касса</CommandItem>
          <CommandItem onSelect={onSelect}>Склад</CommandItem>
          <CommandItem onSelect={onSelect} value="Ёлочные игрушки">
            Ёлочные игрушки
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

const optionNames = () => screen.queryAllByRole("option").map((o) => o.textContent?.replace(/Ctrl\+N$/, ""));

describe("commandFilter", () => {
  it("matches substrings, word prefixes, keywords and ignores ё/е", () => {
    expect(commandFilter("Новая продажа", "прод")).toBe(true);
    expect(commandFilter("Новая продажа", "нов прод")).toBe(true);
    expect(commandFilter("Новая продажа", "склад")).toBe(false);
    expect(commandFilter("Приход товара", "закуп", ["закупка"])).toBe(true);
    expect(commandFilter("Ёлка", "елка")).toBe(true);
    expect(commandFilter("Отчётҳо", "отчетхо")).toBe(true);
  });
});

describe("Command", () => {
  it("filters items, hides empty groups and is accessible", async () => {
    renderWithUI(<Palette />);
    const input = screen.getByRole("combobox", { name: "Поиск команд" });
    expect(input).toHaveAttribute("placeholder", "Введите команду или найдите…");
    expect(screen.getAllByRole("option")).toHaveLength(6);

    await userEvent.type(input, "склад");
    expect(optionNames()).toEqual(["Склад"]);
    expect(screen.queryByRole("group", { name: "Действия" })).toBeNull();
    expect(screen.getByRole("group", { name: "Перейти" })).toBeVisible();

    await userEvent.clear(input);
    await userEvent.type(input, "елочн");
    expect(optionNames()).toEqual(["Ёлочные игрушки"]);
    await expectNoA11yViolations();
  });

  it("navigates with arrows (wrapping, skipping disabled), Home/End and selects with Enter", async () => {
    const onSelect = vi.fn();
    renderWithUI(<Palette onSelect={onSelect} />);
    const input = screen.getByRole("combobox");
    input.focus();

    const active = () =>
      document.getElementById(input.getAttribute("aria-activedescendant") ?? "")?.textContent;
    expect(active()).toMatch(/^Новая продажа/);

    await userEvent.keyboard("{ArrowDown}");
    expect(active()).toBe("Приход товара");
    await userEvent.keyboard("{ArrowDown}");
    expect(active()).toBe("Касса"); // skipped disabled "Новый клиент"
    await userEvent.keyboard("{End}");
    expect(active()).toBe("Ёлочные игрушки");
    await userEvent.keyboard("{ArrowDown}");
    expect(active()).toMatch(/^Новая продажа/); // wrapped
    await userEvent.keyboard("{ArrowUp}");
    expect(active()).toBe("Ёлочные игрушки");
    await userEvent.keyboard("{Home}{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalledWith("Приход товара");

    // Typing resets the highlight to the first match.
    await userEvent.type(input, "кас");
    expect(active()).toBe("Касса");
    await userEvent.keyboard("{Enter}");
    expect(onSelect).toHaveBeenLastCalledWith("Касса");
  });

  it("selects on click but not when disabled", async () => {
    const onSelect = vi.fn();
    renderWithUI(<Palette onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("option", { name: "Новый клиент" }));
    expect(onSelect).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("option", { name: "Склад" }));
    expect(onSelect).toHaveBeenCalledWith("Склад");
  });

  it("shows the empty state with the common noResults text", async () => {
    renderWithUI(<Palette />);
    await userEvent.type(screen.getByRole("combobox"), "зарплата");
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText("Ничего не найдено")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).not.toHaveAttribute("aria-activedescendant");
    await expectNoA11yViolations();
  });

  it("supports a custom filter, shouldFilter=false and loading", async () => {
    const { rerender } = renderWithUI(
      <Command shouldFilter={false} search="xyz">
        <CommandInput />
        <CommandList>
          <CommandLoading />
          <CommandEmpty />
          <CommandItem>Касса</CommandItem>
        </CommandList>
      </Command>,
    );
    expect(screen.getByRole("option", { name: "Касса" })).toBeInTheDocument();
    expect(screen.getByRole("listbox")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Загрузка…")).toBeInTheDocument();

    rerender(
      <Command search="к" filter={(value) => value.endsWith("д")}>
        <CommandInput />
        <CommandList>
          <CommandItem>Касса</CommandItem>
          <CommandItem>Склад</CommandItem>
        </CommandList>
      </Command>,
    );
    expect(optionNames()).toEqual(["Склад"]);
  });

  it("localises strings in Tajik", () => {
    renderWithUI(<Palette />, { provider: { locale: "tg" } });
    expect(screen.getByRole("combobox", { name: "Ҷустуҷӯи фармонҳо" })).toBeInTheDocument();
  });
});

describe("useHotkey + CommandDialog", () => {
  it("parses and formats combos", () => {
    expect(formatHotkey("mod+k", true)).toBe("⌘K");
    expect(formatHotkey("mod+shift+k", false)).toBe("Ctrl+Shift+K");
    const e = new KeyboardEvent("keydown", { key: "л", code: "KeyK", ctrlKey: true });
    expect(matchesHotkey(e, "mod+k", false)).toBe(true); // Russian layout
    expect(matchesHotkey(e, "mod+k", true)).toBe(false);
  });

  it("opens the dialog with mod+k and closes it with Escape", async () => {
    function App() {
      const [open, setOpen] = React.useState(false);
      useHotkey("mod+k", () => setOpen((o) => !o));
      return (
        <>
          <input aria-label="Штрихкод" />
          <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput />
            <CommandList>
              <CommandEmpty />
              <CommandItem onSelect={() => setOpen(false)}>Касса</CommandItem>
            </CommandList>
          </CommandDialog>
        </>
      );
    }
    renderWithUI(<App />);
    expect(screen.queryByRole("dialog")).toBeNull();

    // Ignored while typing in a field.
    const field = screen.getByRole("textbox", { name: "Штрихкод" });
    fireEvent.keyDown(field, { key: "k", code: "KeyK", ctrlKey: true });
    expect(screen.queryByRole("dialog")).toBeNull();

    act(() => {
      fireEvent.keyDown(document.body, { key: "k", code: "KeyK", ctrlKey: true });
    });
    const dialog = await screen.findByRole("dialog", { name: "Командная панель" });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveFocus();
    await expectNoA11yViolations();

    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("toggles an uncontrolled dialog via the hotkey prop, even from inside its input", async () => {
    renderWithUI(
      <CommandDialog hotkey="mod+k">
        <CommandInput />
        <CommandList>
          <CommandItem>Склад</CommandItem>
        </CommandList>
      </CommandDialog>,
    );
    fireEvent.keyDown(window, { key: "k", code: "KeyK", ctrlKey: true });
    await screen.findByRole("dialog");
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "k", code: "KeyK", ctrlKey: true });
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
