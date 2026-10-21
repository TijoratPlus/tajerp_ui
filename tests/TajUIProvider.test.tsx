import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  TajUIProvider,
  useFormat,
} from "../src";

function Price({ value }: { value: number }) {
  const { money } = useFormat();
  return <span>{money(value).replace(/[\u00a0\u202f]/g, " ")}</span>;
}

describe("TajUIProvider", () => {
  it("defaults to Russian strings without a provider", () => {
    render(
      <Dialog open>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Чек</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByRole("button", { name: "Закрыть" })).toBeInTheDocument();
  });

  it("switches component strings by locale and accepts overrides", () => {
    render(
      <TajUIProvider locale="tg" messages={{ common: { close: "Баста" } }}>
        <Dialog open>
          <DialogContent aria-describedby={undefined}>
            <DialogTitle>Чек</DialogTitle>
          </DialogContent>
        </Dialog>
      </TajUIProvider>,
    );
    expect(screen.getByRole("button", { name: "Баста" })).toBeInTheDocument();
  });

  it("formats money in the provider locale", () => {
    render(
      <TajUIProvider locale="en">
        <Price value={18} />
      </TajUIProvider>,
    );
    expect(screen.getByText("18.00 TJS")).toBeInTheDocument();
  });

  it("portals into a scoped .tj-react-root host", async () => {
    render(
      <TajUIProvider scopedPortal>
        <Dialog open>
          <DialogContent aria-describedby={undefined}>
            <DialogTitle>Склад</DialogTitle>
          </DialogContent>
        </Dialog>
      </TajUIProvider>,
    );
    const title = await screen.findByText("Склад");
    expect(title.closest(".tj-react-root")).not.toBeNull();
  });
});
