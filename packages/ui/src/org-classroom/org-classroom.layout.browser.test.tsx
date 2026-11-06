import { useState } from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { OrgClassroom } from "./org-classroom";
import type { Zone } from "./org-classroom.types";
import { updateSeatStatus } from "./seat-status";

afterEach(cleanup);

function zone(): Zone {
  return {
    id: "design",
    name: "产品设计部",
    accent: "var(--color-primary)",
    seats: [
      { id: "s1", row: 1, col: 1, person: { id: "p1", name: "林予涵", status: "idle" } },
      { id: "s2", row: 1, col: 2, person: { id: "p2", name: "陈可", status: "busy" } },
      { id: "s3", row: 1, col: 3, person: { id: "p3", name: "周宁", status: "meeting" } },
      { id: "s4", row: 2, col: 1 },
      { id: "s5", row: 2, col: 2, person: { id: "p5", name: "赵启明", status: "leave" } },
      { id: "s6", row: 2, col: 3, person: { id: "p6", name: "孙晚", status: "interview" } },
    ],
  };
}

function overlap(a: DOMRect, b: DOMRect) {
  const width = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const height = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  if (width <= 0 || height <= 0) return 0;
  return width * height;
}

describe("OrgClassroom narrow scene", () => {
  it("fits a 360px frame, keeps labels readable, and does not stack them on each other", async () => {
    const { container } = render(
      <div data-testid="narrow" style={{ width: 360 }}>
        <OrgClassroom zones={[zone()]} />
      </div>,
    );
    const frame = container.querySelector<HTMLElement>("[data-testid=narrow]")!;
    const floor = container.querySelector<HTMLElement>("[data-slot=org-classroom-floor]")!;

    await expect.poll(() => floor.getAttribute("data-scene-scale")).not.toBe("1");

    expect(frame.scrollWidth).toBeLessThanOrEqual(frame.clientWidth + 1);
    expect(floor.getBoundingClientRect().width).toBeLessThanOrEqual(361);
    expect(container.querySelector("[data-desk-top]")).toBeTruthy();
    expect(container.querySelector("[data-desk-front]")).toBeTruthy();
    expect(container.querySelector("[data-chair-seat]")).toBeTruthy();
    expect(container.querySelector("[data-seat-person]")).toBeTruthy();

    const labels = [...container.querySelectorAll<HTMLElement>("[data-seat-label]")].filter(
      (label) => getComputedStyle(label).visibility !== "hidden" && label.id !== "zone",
    );
    const seatLabels = labels.filter((label) => !label.getAttribute("data-seat-label")!.startsWith("zone-"));
    expect(seatLabels.length).toBe(5);
    const rects = seatLabels.map((label) => label.getBoundingClientRect());
    for (const rect of rects) {
      expect(rect.height).toBeGreaterThanOrEqual(16);
      expect(rect.width).toBeGreaterThanOrEqual(24);
    }
    for (let i = 0; i < rects.length; i += 1) {
      for (let j = i + 1; j < rects.length; j += 1) {
        expect(overlap(rects[i]!, rects[j]!)).toBe(0);
      }
    }
    const desks = [...container.querySelectorAll<HTMLElement>("[data-desk-top]")];
    for (const label of seatLabels) {
      const labelBox = label.getBoundingClientRect();
      for (const desk of desks) {
        expect(overlap(labelBox, desk.getBoundingClientRect())).toBe(0);
      }
    }
    const figure = container.querySelector<HTMLElement>("[data-seat-figure]")!;
    expect(figure.getBoundingClientRect().height).toBeGreaterThan(24);
    for (const scarf of container.querySelectorAll<HTMLElement>("[data-seat-scarf]")) {
      const scarfBox = scarf.getBoundingClientRect();
      const desk = scarf.closest("[data-seat-id]")!.querySelector("[data-desk-body]")!;
      expect(scarfBox.height).toBeGreaterThanOrEqual(6);
      expect(scarfBox.top).toBeLessThan(desk.getBoundingClientRect().top);
    }
  });

  it("390x1026 打开人员卡后五个状态按钮不被左下角返回钮挡住，关闭后焦点回到座位", async () => {
    function Harness() {
      const [zones, setZones] = useState<Zone[]>([zone()]);
      const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
      return (
        <div data-testid="phone" style={{ position: "relative", width: 390, height: 1026 }}>
          <div data-testid="scroller" className="h-full overflow-auto px-3 pt-6 pb-32">
            <OrgClassroom
              zones={zones}
              selectedSeatId={selectedSeatId}
              onSeatSelect={setSelectedSeatId}
              onStatusChange={(seatId, status) => {
                setZones((current) => updateSeatStatus(current, seatId, status));
              }}
            />
          </div>
          <div
            data-testid="return-fab"
            style={{ position: "absolute", left: 24, bottom: 24, zIndex: 50, width: 148, height: 56 }}
          />
        </div>
      );
    }

    const { getByRole } = render(<Harness />);
    const seat = getByRole("button", { name: "林予涵，在岗" });
    fireEvent.click(seat);
    await expect.poll(() => document.querySelector("[data-status-actions]")).toBeTruthy();

    const actions = document.querySelector<HTMLElement>("[data-status-actions]")!;
    const scroller = document.querySelector<HTMLElement>("[data-testid=scroller]")!;
    const fab = document.querySelector<HTMLElement>("[data-testid=return-fab]")!;
    const fabTop = () => fab.getBoundingClientRect().top;
    const hide = actions.getBoundingClientRect().bottom - (fabTop() - 8);
    if (hide > 0) scroller.scrollTop += hide;

    const buttons = [...actions.querySelectorAll<HTMLButtonElement>("button")];
    expect(buttons.map((button) => button.textContent)).toEqual(["在岗", "忙碌", "会议中", "休假", "面试中"]);
    const visibleTop = scroller.getBoundingClientRect().top;
    for (const button of buttons) {
      const rect = button.getBoundingClientRect();
      expect(rect.width).toBeGreaterThan(0);
      expect(rect.height).toBeGreaterThan(0);
      expect(rect.top).toBeGreaterThanOrEqual(visibleTop - 1);
      expect(rect.bottom).toBeLessThanOrEqual(fabTop() - 1);
      expect(overlap(rect, fab.getBoundingClientRect())).toBe(0);
    }

    const zoneEl = document.querySelector<HTMLElement>("[data-zone-id=design]")!;
    const box = zoneEl.getBoundingClientRect();
    let emptyFloor: Element | null = null;
    for (let y = box.top + 6; y < box.bottom && !emptyFloor; y += 10) {
      for (let x = box.left + 6; x < box.right; x += 10) {
        const hit = document.elementFromPoint(x, y);
        if (hit?.closest("[data-zone-floor]") && !hit.closest("[data-seat-id]")) {
          emptyFloor = hit;
          break;
        }
      }
    }
    expect(emptyFloor).toBeTruthy();
    fireEvent.click(emptyFloor as HTMLElement);
    await expect.poll(() => zoneEl.getAttribute("data-focused")).toBe("true");
    expect(document.querySelector("[data-slot=org-classroom-person]")!.getAttribute("data-open")).toBe("true");

    fireEvent.click(getByRole("button", { name: "关闭人员卡" }));
    await expect.poll(() => document.activeElement).toBe(seat);
    expect(document.querySelector("[data-slot=org-classroom-person]")!.getAttribute("data-open")).toBe("false");

    fireEvent.click(seat);
    fireEvent.keyDown(document.querySelector("[data-slot=org-classroom]")!, { key: "Escape" });
    await expect.poll(() => document.activeElement).toBe(seat);
  });
});
