import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { FileUpload, type FileRejection } from "../src/components/FileUpload";
import { expectNoA11yViolations, renderWithUI } from "./utils";

const nb = (s: string) => s.replace(/[\u00a0\u202f]/g, " ");

function makeFile(name: string, size: number, type: string) {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

const getInput = (container: HTMLElement) =>
  container.querySelector('input[type="file"]') as HTMLInputElement;

describe("FileUpload", () => {
  it("adds files via the input (uncontrolled) and lists name and size", async () => {
    const onValueChange = vi.fn();
    const { container } = renderWithUI(
      <FileUpload
        multiple
        accept=".xlsx,.csv"
        maxSize={5 * 1024 * 1024}
        onValueChange={onValueChange}
      />,
    );
    const user = userEvent.setup();
    const file = makeFile(
      "остатки.xlsx",
      1536,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    await user.upload(getInput(container), file);
    expect(onValueChange).toHaveBeenCalledWith([file]);
    const list = screen.getByRole("list", { name: "Выбранные файлы" });
    expect(list).toHaveTextContent("остатки.xlsx");
    expect(nb(list.textContent!)).toContain("1,5 КБ");
    expect(nb(screen.getByText(/До 5 МБ/).textContent!)).toBe("До 5 МБ");
    await expectNoA11yViolations();
  });

  it("opens the file picker from the dropzone button with the keyboard", async () => {
    const { container } = renderWithUI(<FileUpload />);
    const click = vi.spyOn(getInput(container), "click");
    await userEvent.tab();
    const dropzone = screen.getByRole("button", {
      name: /Перетащите файл сюда/,
    });
    expect(dropzone).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(click).toHaveBeenCalled();
  });

  it("rejects too large, wrong type and too many files with localized messages", async () => {
    const onReject = vi.fn();
    const { container } = renderWithUI(
      <FileUpload
        multiple
        maxFiles={2}
        accept="image/*"
        maxSize={1024}
        onReject={onReject}
      />,
    );
    const user = userEvent.setup({ applyAccept: false });
    await user.upload(getInput(container), [
      makeFile("big.png", 4096, "image/png"),
      makeFile("price.pdf", 100, "application/pdf"),
      makeFile("a.png", 100, "image/png"),
      makeFile("b.png", 100, "image/png"),
      makeFile("c.png", 100, "image/png"),
    ]);
    const rejections = onReject.mock.calls[0][0] as FileRejection[];
    expect(
      rejections.map((r) => [r.file.name, r.errors.map((e) => e.code)]),
    ).toEqual([
      ["big.png", ["file-too-large"]],
      ["price.pdf", ["file-invalid-type"]],
      ["c.png", ["too-many-files"]],
    ]);
    const alert = screen.getByRole("alert");
    expect(nb(alert.textContent!)).toContain("«big.png» больше 1 КБ");
    expect(alert).toHaveTextContent(
      "«price.pdf»: этот тип файла не поддерживается",
    );
    expect(alert).toHaveTextContent("Можно добавить не больше файлов: 2");
    expect(
      screen
        .getAllByRole("listitem")
        .filter((li) => li.dataset.slot === "file-upload-item"),
    ).toHaveLength(2);
  });

  it("is controlled, removes files and moves focus, shows progress", async () => {
    function Controlled() {
      const [files, setFiles] = React.useState<File[]>([
        makeFile("фото-1.jpg", 2 * 1024 * 1024, "image/jpeg"),
        makeFile("фото-2.jpg", 300, "image/jpeg"),
      ]);
      return (
        <FileUpload
          multiple
          value={files}
          onValueChange={setFiles}
          progress={{ "фото-1.jpg": 40 }}
        />
      );
    }
    renderWithUI(<Controlled />);
    expect(
      screen.getByRole("progressbar", { name: "Загрузка «фото-1.jpg»" }),
    ).toHaveAttribute("aria-valuenow", "40");
    await userEvent.click(
      screen.getByRole("button", { name: "Удалить файл «фото-1.jpg»" }),
    );
    const next = screen.getByRole("button", {
      name: "Удалить файл «фото-2.jpg»",
    });
    expect(next).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(screen.queryByRole("list")).toBeNull();
    expect(
      screen.getByRole("button", { name: /Перетащите файлы сюда/ }),
    ).toHaveFocus();
    await expectNoA11yViolations();
  });

  it("replaces the file in single mode, accepts drops and ignores input when disabled", async () => {
    const onValueChange = vi.fn();
    const { container, rerender } = renderWithUI(
      <FileUpload onValueChange={onValueChange} />,
    );
    const dropzone = screen.getByRole("button");
    const a = makeFile("a.csv", 10, "text/csv");
    const b = makeFile("b.csv", 10, "text/csv");
    const { fireEvent } = await import("@testing-library/react");
    fireEvent.drop(dropzone, { dataTransfer: { files: [a] } });
    expect(onValueChange).toHaveBeenLastCalledWith([a]);
    await userEvent.upload(getInput(container), b);
    expect(onValueChange).toHaveBeenLastCalledWith([b]);

    rerender(
      <FileUpload
        disabled
        onValueChange={onValueChange}
        labels={{ titleSingle: "Импорт из 1С" }}
      />,
    );
    expect(screen.getByRole("button", { name: /Импорт из 1С/ })).toBeDisabled();
    fireEvent.drop(screen.getByRole("button", { name: /Импорт из 1С/ }), {
      dataTransfer: { files: [a] },
    });
    expect(onValueChange).toHaveBeenCalledTimes(2);
    await expectNoA11yViolations();
  });

  it("formats units in Tajik", async () => {
    const { container } = renderWithUI(<FileUpload multiple />, {
      provider: { locale: "tg" },
    });
    await userEvent.upload(
      getInput(container),
      makeFile("ҳисобот.xlsx", 3 * 1024 * 1024, ""),
    );
    expect(
      nb(
        screen.getByRole("list", { name: "Файлҳои интихобшуда" }).textContent!,
      ),
    ).toContain("3 МБ");
    expect(
      screen.getByRole("button", { name: "Нест кардани файли «ҳисобот.xlsx»" }),
    ).toBeInTheDocument();
  });
});
