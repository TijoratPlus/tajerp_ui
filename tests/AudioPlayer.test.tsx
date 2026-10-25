import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AudioPlayer, formatPlaybackTime } from "../src";
import { expectNoA11yViolations, renderWithUI } from "./utils";

describe("formatPlaybackTime", () => {
  it("formats minutes and hours", () => {
    expect(formatPlaybackTime(0)).toBe("0:00");
    expect(formatPlaybackTime(65.4)).toBe("1:05");
    expect(formatPlaybackTime(3729)).toBe("1:02:09");
    expect(formatPlaybackTime(Number.NaN)).toBe("0:00");
  });
});

describe("AudioPlayer", () => {
  afterEach(() => vi.restoreAllMocks());

  it("plays, pauses and shows the duration", async () => {
    let paused = true;
    vi.spyOn(HTMLMediaElement.prototype, "paused", "get").mockImplementation(() => paused);
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
      paused = false;
      fireEvent.play(this);
      return Promise.resolve();
    });
    const pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (this: HTMLMediaElement) {
      paused = true;
      fireEvent.pause(this);
    });
    vi.spyOn(HTMLMediaElement.prototype, "duration", "get").mockReturnValue(125);

    const { container } = renderWithUI(<AudioPlayer src="/call-2024-05-01.mp3" />);
    fireEvent.loadedMetadata(container.querySelector("audio")!);
    expect(screen.getByText("2:05")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Воспроизвести" }));
    expect(play).toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Пауза" }));
    expect(pause).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Воспроизвести" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Позиция воспроизведения" })).toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("changes the playback speed from the menu", async () => {
    const { container } = renderWithUI(<AudioPlayer src="/voice.ogg" />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Скорость 1×" }));
    await user.click(await screen.findByRole("menuitemradio", { name: "1,5×" }));
    expect(container.querySelector("audio")!.playbackRate).toBe(1.5);
    expect(screen.getByRole("button", { name: "Скорость 1,5×" })).toBeInTheDocument();
  });

  it("reports a load error in Tajik", () => {
    const { container } = renderWithUI(<AudioPlayer src="/missing.mp3" />, { provider: { locale: "tg" } });
    fireEvent.error(container.querySelector("audio")!);
    expect(screen.getByRole("alert")).toHaveTextContent("Сабтро бор кардан нашуд");
    expect(screen.getByRole("button", { name: "Пахш кардан" })).toBeDisabled();
  });
});
