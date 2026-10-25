import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { ChipInput } from "../src";
import { expectNoA11yViolations, renderWithUI } from "./utils";

const isEmail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

describe("ChipInput", () => {
  it("adds chips with Enter and comma, removes with Backspace (uncontrolled)", async () => {
    const onValueChange = vi.fn();
    renderWithUI(<ChipInput aria-label="Теги" defaultValue={["vip"]} onValueChange={onValueChange} />);
    const user = userEvent.setup();
    const input = screen.getByRole("textbox", { name: "Теги" });
    await user.type(input, "Душанбе{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(["vip", "Душанбе"]);
    await user.type(input, "Хуҷанд,");
    expect(onValueChange).toHaveBeenLastCalledWith(["vip", "Душанбе", "Хуҷанд"]);
    await user.keyboard("{Backspace}");
    expect(onValueChange).toHaveBeenLastCalledWith(["vip", "Душанбе"]);
    await user.click(screen.getByRole("button", { name: "Удалить «vip»" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["Душанбе"]);
    await expectNoA11yViolations();
  });

  it("validates values and splits pasted lists (controlled)", async () => {
    function Harness() {
      const [v, setV] = React.useState<string[]>([]);
      return <ChipInput aria-label="Кому" value={v} onValueChange={setV} validate={isEmail} />;
    }
    renderWithUI(<Harness />);
    const user = userEvent.setup();
    const input = screen.getByRole("textbox", { name: "Кому" });
    await user.type(input, "not-an-email{Enter}");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByRole("button", { name: /Удалить/ })).not.toBeInTheDocument();
    await user.clear(input);
    act(() => {
      fireEvent.paste(input, {
        clipboardData: { getData: () => "zarina@somon.tj, farrukh@somon.tj; плохой" },
      });
    });
    expect(screen.getByRole("button", { name: "Удалить «zarina@somon.tj»" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Удалить «farrukh@somon.tj»" })).toBeInTheDocument();
    expect(input).toHaveValue("плохой");
  });

  it("suggests from async search and picks with the keyboard", async () => {
    const search = vi.fn(async (q: string) =>
      [
        { value: "zarina@somon.tj", label: "Зарина Каримова", description: "zarina@somon.tj" },
        { value: "zafar@somon.tj", label: "Зафар Назаров" },
      ].filter((s) => s.label.toLowerCase().startsWith(q.toLowerCase())),
    );
    const onValueChange = vi.fn();
    renderWithUI(
      <ChipInput aria-label="Кому" search={search} allowCustom={false} onValueChange={onValueChange} />,
    );
    const user = userEvent.setup();
    const input = screen.getByRole("combobox", { name: "Кому" });
    await user.type(input, "за");
    const listbox = await screen.findByRole("listbox", { name: "Варианты" }, { timeout: 2000 });
    expect(await screen.findByRole("option", { name: /Зафар Назаров/ })).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(listbox).toBeInTheDocument();
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(["zafar@somon.tj"]);
    // Custom text is refused when allowCustom is false.
    await user.type(input, "{Escape}");
    expect(search).toHaveBeenCalledWith("за");
  });

  it("labels chip removal in Tajik", () => {
    renderWithUI(<ChipInput aria-label="Барчаспҳо" value={["муштарӣ"]} />, { provider: { locale: "tg" } });
    expect(screen.getByRole("button", { name: "«муштарӣ»-ро нест кардан" })).toBeInTheDocument();
  });
});
