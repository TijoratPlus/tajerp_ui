import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { Autocomplete, Label } from "../src";
import { expectNoA11yViolations, renderWithUI } from "./utils";

const OPTIONS = [
  { value: "dushanbe", label: "Душанбе" },
  { value: "khujand", label: "Худжанд", disabled: true },
  { value: "istaravshan", label: "Истаравшан" },
];

describe("Autocomplete", () => {
  it("passes id to the input so a Label targets it", async () => {
    renderWithUI(
      <>
        <Label htmlFor="city">Город</Label>
        <Autocomplete id="city" name="city" options={OPTIONS} />
      </>,
    );
    expect(screen.getByLabelText("Город")).toHaveAttribute("name", "city");
    await expectNoA11yViolations();
  });

  it("skips disabled options with the keyboard and commits on Enter", async () => {
    const onValueChange = vi.fn();
    renderWithUI(
      <Autocomplete aria-label="Город" options={OPTIONS} onValueChange={onValueChange} />,
    );
    const input = screen.getByRole("combobox");
    await userEvent.click(input);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("istaravshan");
    expect(input).toHaveValue("Истаравшан");
  });

  it("re-syncs the text when the controlled value changes", () => {
    function Harness() {
      const [v, setV] = React.useState("dushanbe");
      return (
        <>
          <Autocomplete aria-label="Город" options={OPTIONS} value={v} onValueChange={setV} />
          <button type="button" onClick={() => setV("istaravshan")}>
            set
          </button>
        </>
      );
    }
    renderWithUI(<Harness />);
    expect(screen.getByRole("combobox")).toHaveValue("Душанбе");
    screen.getByText("set").click();
    return vi.waitFor(() =>
      expect(screen.getByRole("combobox")).toHaveValue("Истаравшан"),
    );
  });

  it("reverts uncommitted text on blur and shows a localized empty message", async () => {
    renderWithUI(<Autocomplete aria-label="Город" options={OPTIONS} defaultValue="dushanbe" />);
    const input = screen.getByRole("combobox");
    await userEvent.clear(input);
    await userEvent.type(input, "zzz");
    expect(await screen.findByText("Ничего не найдено")).toBeInTheDocument();
    await userEvent.tab();
    expect(input).toHaveValue("Душанбе");
  });
});
