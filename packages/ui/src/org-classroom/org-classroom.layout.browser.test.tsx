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
    const torso = container.querySelector("[data-seat-torso]")!.getBoundingClientRect();
    expect(torso.height).toBeGreaterThan(20);
    for (const seat of container.querySelectorAll<HTMLElement>("[data-seat-id]")) {
      const figure = seat.querySelector<HTMLElement>("[data-seat-figure]");
      const desk = seat.querySelector<HTMLElement>("[data-desk-top]");
      const lap = seat.querySelector<HTMLElement>("[data-seat-lap]");
      if (!figure || !desk || !lap) continue;
      const figureBox = figure.getBoundingClientRect();
      const deskBox = desk.getBoundingClientRect();
      expect(figureBox.bottom).toBeGreaterThan(deskBox.top + 2);
      expect(overlap(lap.getBoundingClientRect(), deskBox)).toBeGreaterThan(0);
      const scarf = seat.querySelector<HTMLElement>("[data-seat-scarf]")!;
      expect(scarf.getBoundingClientRect().height).toBeGreaterThanOrEqual(4);
      expect(scarf.getBoundingClientRect().top).toBeLessThan(deskBox.bottom);
      const label = container.querySelector<HTMLElement>(`[data-seat-label="${seat.dataset.seatId}"]`);
      if (!label) continue;
      const labelBox = label.getBoundingClientRect();
      const head = seat.querySelector<HTMLElement>("[data-seat-torso]")!.getBoundingClientRect();
      const dx = Math.abs(labelBox.left + labelBox.width / 2 - (head.left + head.width / 2));
      const dy = head.top - labelBox.bottom;
      expect(dx).toBeLessThan(180);
      expect(dy).toBeLessThanOrEqual(64);
      expect(dy).toBeGreaterThanOrEqual(-head.height - 8);
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

  it("点分区空白聚焦并再次点同一空白取消，不会改选中的座位", async () => {
    const other: Zone = {
      id: "engineering",
      name: "技术研发部",
      accent: "var(--color-info)",
      seats: [{ id: "e1", row: 1, col: 1, person: { id: "q1", name: "周宁", status: "leave" } }],
    };
    function Harness() {
      const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
      return (
        <div style={{ width: 720 }}>
          <OrgClassroom zones={[zone(), other]} selectedSeatId={selectedSeatId} onSeatSelect={setSelectedSeatId} />
        </div>
      );
    }
    const { getByRole } = render(<Harness />);
    fireEvent.click(getByRole("button", { name: "林予涵，在岗" }));
    await expect.poll(() => document.querySelector("[data-slot=org-classroom-person]")!.getAttribute("data-open")).toBe(
      "true",
    );

    const design = document.querySelector<HTMLElement>('[data-zone-id="design"]')!;
    const engineering = document.querySelector<HTMLElement>('[data-zone-id="engineering"]')!;
    const area = design.getBoundingClientRect();
    let empty: HTMLElement | null = null;
    for (let y = area.top + 4; y < area.bottom && !empty; y += 8) {
      for (let x = area.left + 4; x < area.right; x += 8) {
        const hit = document.elementFromPoint(x, y);
        if (hit?.closest("[data-zone-floor]") && !hit.closest("[data-seat-id]") && !hit.closest("[data-seat-label]")) {
          empty = hit as HTMLElement;
          break;
        }
      }
    }
    expect(empty).toBeTruthy();
    fireEvent.click(empty!);
    await expect.poll(() => design.getAttribute("data-focused")).toBe("true");
    expect(design.querySelector("[data-zone-floor]")!.getAttribute("aria-pressed")).toBe("true");
    expect(engineering.getAttribute("data-quiet")).toBe("true");
    expect(document.querySelector('[data-seat-id="s1"] button')!.getAttribute("aria-pressed")).toBe("true");
    expect(document.querySelector("[data-slot=org-classroom-person]")!.getAttribute("data-open")).toBe("true");

    fireEvent.click(empty!);
    await expect.poll(() => design.getAttribute("data-focused")).toBe("false");
    expect(design.querySelector("[data-zone-floor]")!.getAttribute("aria-pressed")).toBe("false");
    expect(engineering.getAttribute("data-quiet")).toBe("false");
    expect(document.querySelector('[data-seat-id="s1"] button')!.getAttribute("aria-pressed")).toBe("true");
    expect(document.querySelector("[data-slot=org-classroom-person]")!.getAttribute("data-open")).toBe("true");
  });
});
