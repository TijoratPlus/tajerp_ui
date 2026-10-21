import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import type { Locale } from "../src/i18n/locale";
import { LanguageSwitcher } from "../src/components/LanguageSwitcher";
import { expectNoA11yViolations, renderWithUI } from "./utils";

describe("LanguageSwitcher", () => {
  it("segmented: labelled radio group defaulting to the provider locale", async () => {
    const onValueChange = vi.fn();
    renderWithUI(<LanguageSwitcher onValueChange={onValueChange} />, {
      provider: { locale: "tg" },
    });
    const group = screen.getByRole("radiogroup", { name: "Забони интерфейс" });
    expect(group).toBeInTheDocument();
    const tj = screen.getByRole("radio", { name: /TJ\s*Тоҷикӣ/ });
    expect(tj).toHaveAttribute("aria-checked", "true");
    await expectNoA11yViolations();

    tj.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onValueChange).toHaveBeenCalledWith("en");
    expect(screen.getByRole("radio", { name: /EN/ })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await userEvent.click(screen.getByRole("radio", { name: /RU\s*Русский/ }));
    expect(onValueChange).toHaveBeenLastCalledWith("ru");
  });

  it("select: native select with full names", async () => {
    const onValueChange = vi.fn();
    renderWithUI(
      <LanguageSwitcher
        variant="select"
        defaultValue="ru"
        onValueChange={onValueChange}
      />,
    );
    const select = screen.getByRole("combobox", { name: "Язык интерфейса" });
    expect(screen.getByRole("option", { name: "Тоҷикӣ" })).toBeInTheDocument();
    await userEvent.selectOptions(select, "tg");
    expect(onValueChange).toHaveBeenCalledWith("tg");
    expect(select).toHaveValue("tg");
    await expectNoA11yViolations();
  });

  it("select with a visible label", () => {
    renderWithUI(<LanguageSwitcher variant="select" showLabel />);
    expect(screen.getByLabelText("Язык интерфейса")).toHaveValue("ru");
  });

  it("is controlled", async () => {
    function Controlled() {
      const [v, setV] = React.useState<Locale>("ru");
      return (
        <>
          <LanguageSwitcher value={v} onValueChange={setV} />
          <output>{v}</output>
        </>
      );
    }
    renderWithUI(<Controlled />);
    await userEvent.click(screen.getByRole("radio", { name: /EN/ }));
    expect(screen.getByRole("status")).toHaveTextContent("en");
  });
});
