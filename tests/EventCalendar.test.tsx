import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import {
  EventCalendar,
  type CalendarEvent,
  type CalendarView,
} from "../src/components/EventCalendar";
import { expectNoA11yViolations, renderWithUI } from "./utils";

const NOW = new Date(2026, 9, 21, 10, 15); // Wednesday
const EVENTS: CalendarEvent[] = [
  {
    id: "call",
    title: "Звонок клиенту",
    start: new Date(2026, 9, 21, 10, 0),
    end: new Date(2026, 9, 21, 11, 0),
  },
  {
    id: "expo",
    title: "Выставка",
    start: new Date(2026, 9, 22),
    end: new Date(2026, 9, 24),
    allDay: true,
  },
];

/** jsdom has no layout: give the time grid a 7 × 100px, 48px-per-hour box. */
function stubGrid(el: Element, width = 700, height = 24 * 48) {
  el.getBoundingClientRect = () =>
    ({ left: 0, top: 0, right: width, bottom: height, width, height, x: 0, y: 0 }) as DOMRect;
}

const timeGrid = () =>
  document.querySelector('[data-slot="event-calendar-column"]')!.parentElement!;

describe("EventCalendar", () => {
  it("renders the week with events and navigates", async () => {
    renderWithUI(<EventCalendar events={EVENTS} now={NOW} />);
    expect(screen.getByRole("heading", { name: "19–25 октября 2026 г." })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Звонок клиенту, 10:00–11:00" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Выставка, Весь день" })).toBeInTheDocument();
    expect(document.querySelector('[data-slot="event-calendar-now"]')).toBeInTheDocument();
    await expectNoA11yViolations();

    await userEvent.click(screen.getByRole("button", { name: "Вперёд" }));
    expect(screen.getByRole("heading", { name: "26 октября – 1 ноября 2026 г." })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Звонок клиенту/ })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Сегодня" }));
    expect(screen.getByRole("heading", { name: "19–25 октября 2026 г." })).toBeInTheDocument();
  });

  it("switches views, controlled", async () => {
    const onViewChange = vi.fn();
    function Harness() {
      const [view, setView] = React.useState<CalendarView>("week");
      return (
        <EventCalendar
          events={EVENTS}
          now={NOW}
          view={view}
          onViewChange={(v) => {
            onViewChange(v);
            setView(v);
          }}
        />
      );
    }
    renderWithUI(<Harness />);
    await userEvent.click(screen.getByRole("radio", { name: "Месяц" }));
    expect(onViewChange).toHaveBeenLastCalledWith("month");
    expect(screen.getByRole("heading", { name: "Октябрь 2026" })).toBeInTheDocument();
    // The all-day event shows on each of its days in the month grid.
    expect(screen.getAllByRole("button", { name: "Выставка, Весь день" })).toHaveLength(2);
    await expectNoA11yViolations();

    await userEvent.click(screen.getByRole("button", { name: /Открыть день: среда, 21 октября/ }));
    expect(onViewChange).toHaveBeenLastCalledWith("day");
    expect(screen.getByRole("heading", { name: "21 октября 2026 г." })).toBeInTheDocument();
  });

  it("clicks events and moves them with Alt+arrows", async () => {
    const onEventClick = vi.fn();
    const onEventChange = vi.fn();
    renderWithUI(
      <EventCalendar
        events={EVENTS}
        now={NOW}
        onEventClick={onEventClick}
        onEventChange={onEventChange}
      />,
    );
    const call = screen.getByRole("button", { name: /Звонок клиенту/ });
    await userEvent.click(call);
    expect(onEventClick).toHaveBeenCalledWith(EVENTS[0]);

    call.focus();
    await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}");
    expect(onEventChange).toHaveBeenLastCalledWith(EVENTS[0], {
      start: new Date(2026, 9, 21, 10, 30),
      end: new Date(2026, 9, 21, 11, 30),
      allDay: false,
    });
    await userEvent.keyboard("{Alt>}{Shift>}{ArrowDown}{/Shift}{/Alt}");
    expect(onEventChange).toHaveBeenLastCalledWith(EVENTS[0], {
      start: new Date(2026, 9, 21, 10, 0),
      end: new Date(2026, 9, 21, 11, 30),
      allDay: false,
    });
    await userEvent.keyboard("{Alt>}{ArrowRight}{/Alt}");
    expect(onEventChange).toHaveBeenLastCalledWith(EVENTS[0], {
      start: new Date(2026, 9, 22, 10, 0),
      end: new Date(2026, 9, 22, 11, 0),
      allDay: false,
    });
  });

  it("drag-creates a range on empty time and drags an event to another day", () => {
    const onCreate = vi.fn();
    const onEventChange = vi.fn();
    const onEventClick = vi.fn();
    renderWithUI(
      <EventCalendar
        events={EVENTS}
        now={NOW}
        onCreate={onCreate}
        onEventChange={onEventChange}
        onEventClick={onEventClick}
      />,
    );
    const grid = timeGrid();
    stubGrid(grid);
    const wednesday = grid.querySelectorAll('[data-slot="event-calendar-column"]')[2];

    fireEvent.pointerDown(wednesday, { button: 0, clientX: 250, clientY: 14 * 48 });
    fireEvent.pointerMove(window, { clientX: 250, clientY: 15.6 * 48 });
    expect(document.querySelector('[data-slot="event-calendar-selection"]')).toBeInTheDocument();
    fireEvent.pointerUp(window, { clientX: 250, clientY: 15.6 * 48 });
    expect(onCreate).toHaveBeenCalledWith({
      start: new Date(2026, 9, 21, 14, 0),
      end: new Date(2026, 9, 21, 16, 0),
      allDay: false,
    });

    const call = screen.getByRole("button", { name: /Звонок клиенту/ });
    fireEvent.pointerDown(call, { button: 0, clientX: 250, clientY: 10 * 48 + 5 });
    fireEvent.pointerMove(window, { clientX: 350, clientY: 11 * 48 + 5 });
    fireEvent.pointerUp(window, { clientX: 350, clientY: 11 * 48 + 5 });
    expect(onEventChange).toHaveBeenCalledWith(EVENTS[0], {
      start: new Date(2026, 9, 22, 11, 0),
      end: new Date(2026, 9, 22, 12, 0),
      allDay: false,
    });
    // Dragging does not also open the event.
    fireEvent.click(call);
    expect(onEventClick).not.toHaveBeenCalled();
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it("resizes an event from its bottom edge", () => {
    const onEventChange = vi.fn();
    renderWithUI(<EventCalendar events={EVENTS} now={NOW} onEventChange={onEventChange} />);
    const grid = timeGrid();
    stubGrid(grid);
    const handle = document.querySelector('[data-slot="event-calendar-resize"]')!;
    fireEvent.pointerDown(handle, { button: 0, clientX: 250, clientY: 11 * 48 });
    fireEvent.pointerMove(window, { clientX: 250, clientY: 12.5 * 48 });
    fireEvent.pointerUp(window, { clientX: 250, clientY: 12.5 * 48 });
    expect(onEventChange).toHaveBeenCalledWith(EVENTS[0], {
      start: new Date(2026, 9, 21, 10, 0),
      end: new Date(2026, 9, 21, 12, 30),
      allDay: false,
    });
  });

  it("uses Tajik strings and Sunday-first weeks", () => {
    renderWithUI(<EventCalendar events={[]} now={NOW} weekStartsOn={0} />, {
      provider: { locale: "tg" },
    });
    expect(screen.getByRole("heading", { name: "18–24 октябри 2026" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Имрӯз" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Ҳафта" })).toHaveAttribute("aria-checked", "true");
  });
});
