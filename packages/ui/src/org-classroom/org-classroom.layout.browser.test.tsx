import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { OrgClassroom } from "./org-classroom";
import type { Zone } from "./org-classroom.types";

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
  });
});
