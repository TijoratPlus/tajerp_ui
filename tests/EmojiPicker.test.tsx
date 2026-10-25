import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { EmojiPicker, EmojiPickerPanel, IconPicker, searchEmoji } from "../src";
import { expectNoA11yViolations, renderWithUI } from "./utils";

describe("searchEmoji", () => {
  it("matches names, tags and descriptions", () => {
    expect(searchEmoji("thumbs up").map((g) => g.emoji)).toContain("👍");
    expect(searchEmoji("tada")[0]?.emoji).toBe("🎉");
    expect(searchEmoji("")).toEqual([]);
  });
});

describe("EmojiPicker", () => {
  it("opens from the default trigger, switches category and picks", async () => {
    const onSelect = vi.fn();
    renderWithUI(<EmojiPicker onSelect={onSelect} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Вставить эмодзи" }));
    const dialog = await screen.findByRole("dialog", { name: "Выбор эмодзи" });
    expect(within(dialog).getByRole("searchbox", { name: "Поиск эмодзи" })).toHaveFocus();

    const food = within(dialog).getByRole("button", { name: "Еда и напитки" });
    await user.click(food);
    expect(food).toHaveAttribute("aria-pressed", "true");
    expect(within(dialog).getByRole("group", { name: "Еда и напитки" })).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "red apple" }));
    expect(onSelect).toHaveBeenCalledWith("🍎");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("searches and moves through the grid with arrow keys", async () => {
    const onSelect = vi.fn();
    renderWithUI(<EmojiPickerPanel onSelect={onSelect} />);
    const user = userEvent.setup();
    await user.type(screen.getByRole("searchbox"), "heart");
    expect(screen.getByRole("group", { name: "Результаты поиска" })).toBeInTheDocument();
    await user.keyboard("{ArrowDown}");
    const cells = screen.getAllByRole("button").filter((b) => b.dataset.slot === "emoji-picker-item");
    expect(cells[0]).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(cells[1]).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith(cells[1]!.textContent);
    await expectNoA11yViolations();
  });

  it("shows an empty result", async () => {
    renderWithUI(<EmojiPickerPanel onSelect={() => {}} />);
    await userEvent.type(screen.getByRole("searchbox"), "zzzzqqq");
    expect(screen.getByText("Ничего не найдено")).toBeInTheDocument();
  });

  it("uses a custom trigger and Tajik labels", async () => {
    renderWithUI(<EmojiPicker onSelect={() => {}} trigger={<button type="button">😊</button>} />, {
      provider: { locale: "tg" },
    });
    await userEvent.click(screen.getByRole("button", { name: "😊" }));
    expect(await screen.findByRole("dialog", { name: "Интихоби эмодзи" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Хӯрок ва нӯшокӣ" })).toBeInTheDocument();
  });
});

describe("IconPicker", () => {
  it("shows the value, picks (controlled) and clears", async () => {
    const onValueChange = vi.fn();
    function Harness() {
      const [v, setV] = React.useState("🚀");
      return (
        <IconPicker
          value={v}
          onValueChange={(next) => {
            setV(next);
            onValueChange(next);
          }}
        />
      );
    }
    renderWithUI(<Harness />);
    const user = userEvent.setup();
    const trigger = screen.getByRole("button", { name: "Значок: 🚀" });
    await user.click(trigger);
    await user.type(await screen.findByRole("searchbox"), "fire");
    await user.click(screen.getByRole("button", { name: "fire" }));
    expect(onValueChange).toHaveBeenLastCalledWith("🔥");
    expect(screen.getByRole("button", { name: "Значок: 🔥" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Значок: 🔥" }));
    await user.click(await screen.findByRole("button", { name: "Убрать значок" }));
    expect(onValueChange).toHaveBeenLastCalledWith("");
    expect(screen.getByRole("button", { name: "Выбрать значок" })).toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("works uncontrolled", async () => {
    renderWithUI(<IconPicker defaultValue="📞" />);
    expect(screen.getByRole("button", { name: "Значок: 📞" })).toBeInTheDocument();
  });
});
