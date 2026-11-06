import { useState } from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { page } from "@vitest/browser/context";
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
    const zoneLabels = labels.filter((label) => label.getAttribute("data-seat-label")!.startsWith("zone-"));
    for (const seatLabel of seatLabels) {
      for (const zoneLabel of zoneLabels) {
        expect(overlap(seatLabel.getBoundingClientRect(), zoneLabel.getBoundingClientRect())).toBe(0);
      }
    }
    const torso = container.querySelector("[data-seat-torso]")!.getBoundingClientRect();
    expect(torso.height).toBeGreaterThan(32);
    for (const seat of container.querySelectorAll<HTMLElement>("[data-seat-id]")) {
      const figure = seat.querySelector<HTMLElement>("[data-seat-figure]");
      const desk = seat.querySelector<HTMLElement>("[data-desk-top]");
      const lap = seat.querySelector<HTMLElement>("[data-seat-lap]");
      if (!figure || !desk || !lap) continue;
      const figureBox = figure.getBoundingClientRect();
      const deskBox = desk.getBoundingClientRect();
      expect(figureBox.bottom).toBeGreaterThan(deskBox.top + 2);
      expect(seat.querySelector("[data-desk-top-rear]")).toBeNull();
      expect(overlap(lap.getBoundingClientRect(), deskBox)).toBeGreaterThan(0);
      expect(lap.offsetTop).toBeLessThan(desk.offsetTop - 8);
      expect(lap.offsetTop + lap.offsetHeight).toBeGreaterThan(desk.offsetTop + 4);
      expect(lap.offsetTop + lap.offsetHeight).toBeLessThanOrEqual(desk.offsetTop + desk.offsetHeight - 6);
      const lapZ = Number(getComputedStyle(lap).zIndex);
      const deskZ = Number(getComputedStyle(desk).zIndex);
      expect(lapZ).toBeLessThan(deskZ);
      expect(lap.style.transform).toContain("translateZ(9px)");
      const pelvis = seat.querySelector<HTMLElement>("[data-seat-pelvis]")!;
      expect(pelvis.offsetHeight).toBeGreaterThanOrEqual(12);
      const thighs = [...seat.querySelectorAll<HTMLElement>("[data-seat-thigh]")];
      expect(thighs).toHaveLength(2);
      const lapBox = lap.getBoundingClientRect();
      let exposed = 0;
      for (let x = lapBox.left + 1; x < lapBox.right; x += 2) {
        for (let y = lapBox.top + 1; y < lapBox.bottom; y += 2) {
          const hit = document.elementFromPoint(x, y);
          const body = hit?.closest("[data-seat-thigh], [data-seat-pelvis]");
          if (body && !hit?.closest("[data-desk-top]")) exposed += 1;
        }
      }
      expect(exposed).toBeGreaterThan(4);
      const thighCenters: number[] = [];
      for (const thigh of thighs) {
        expect(thigh.offsetHeight).toBeGreaterThan(thigh.offsetWidth);
        const thighBox = thigh.getBoundingClientRect();
        expect(overlap(thighBox, deskBox)).toBeGreaterThan(0);
        expect(thighBox.bottom).toBeLessThanOrEqual(deskBox.bottom + 1);
        for (let x = thighBox.left; x < thighBox.right; x += 3) {
          for (let y = deskBox.bottom + 1; y < thighBox.bottom + 4; y += 2) {
            const hit = document.elementFromPoint(x, y);
            expect(hit?.closest("[data-seat-thigh], [data-seat-pelvis], [data-seat-lap]")).toBeNull();
          }
        }
        const center = thighBox.left + thighBox.width / 2;
        expect(center).toBeGreaterThan(deskBox.left);
        expect(center).toBeLessThan(deskBox.right);
        thighCenters.push(center);
      }
      expect(Math.abs(thighCenters[0]! - thighCenters[1]!)).toBeGreaterThan(4);
      const scarf = seat.querySelector<HTMLElement>("[data-seat-scarf]")!;
      const scarfBox = scarf.getBoundingClientRect();
      expect(scarfBox.height).toBeGreaterThanOrEqual(8);
      expect(scarfBox.width).toBeGreaterThanOrEqual(14);
      expect(scarfBox.top).toBeLessThan(deskBox.top + 8);
      const headMark = seat.querySelector<HTMLElement>("[data-seat-head]")!.getBoundingClientRect();
      expect(headMark.height).toBeGreaterThanOrEqual(16);
      const label = container.querySelector<HTMLElement>(`[data-seat-label="${seat.dataset.seatId}"]`);
      if (!label) continue;
      const labelBox = label.getBoundingClientRect();
      const head = seat.querySelector<HTMLElement>("[data-seat-torso]")!.getBoundingClientRect();
      const dx = Math.abs(labelBox.left + labelBox.width / 2 - (head.left + head.width / 2));
      const dy = head.top - labelBox.bottom;
      expect(dx).toBeLessThanOrEqual(28);
      expect(dy).toBeLessThanOrEqual(16);
      expect(dy).toBeGreaterThanOrEqual(-8);
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

  it("点头或围巾打开该座位的人员卡，不聚焦分区", async () => {
    render(<OrgClassroom zones={[zone()]} />);
    await expect.poll(() => document.querySelector("[data-seat-scarf]")).toBeTruthy();
    const scarf = document.querySelector("[data-seat-scarf]")!;
    const box = scarf.getBoundingClientRect();
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    const seatId = hit?.closest("[data-seat-id]")?.getAttribute("data-seat-id");
    expect(seatId).toBeTruthy();
    expect(hit?.closest("[data-zone-floor]")).toBeNull();
    fireEvent.click(hit as HTMLElement);
    await expect.poll(() => document.querySelector("[data-slot=org-classroom-person]")!.getAttribute("data-open")).toBe(
      "true",
    );
    expect(document.querySelector("[data-slot=org-classroom-person]")!.textContent).toContain(
      seatId === "s1" ? "林予涵" : "",
    );
    expect(document.querySelector('[data-zone-id="design"]')!.getAttribute("data-focused")).toBe("false");
    expect(document.querySelector(`[data-seat-id="${seatId}"] [data-desk-hit]`)!.getAttribute("aria-pressed")).toBe(
      "true",
    );
  });

  it("点林予涵的桌面不会选中孙晚", async () => {
    const seats: Zone = {
      ...zone(),
      seats: [
        { id: "s1", row: 1, col: 1, person: { id: "p1", name: "林予涵", status: "idle" } },
        { id: "s5", row: 2, col: 2, person: { id: "p5", name: "孙晚", status: "interview" } },
      ],
    };
    render(<OrgClassroom zones={[seats]} />);
    await expect.poll(() => document.querySelector('[data-seat-id="s1"] [data-desk-top]')).toBeTruthy();
    const desk = document.querySelector('[data-seat-id="s1"] [data-desk-top]')!;
    const box = desk.getBoundingClientRect();
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    expect(hit?.closest("[data-seat-id]")?.getAttribute("data-seat-id")).toBe("s1");
    fireEvent.click(hit as HTMLElement);
    await expect.poll(() => document.querySelector("[data-slot=org-classroom-person]")!.textContent).toContain("林予涵");
    expect(document.querySelector('[data-seat-id="s1"] [data-desk-hit]')!.getAttribute("aria-pressed")).toBe("true");
    expect(document.querySelector('[data-seat-id="s5"] [data-desk-hit]')!.getAttribute("aria-pressed")).toBe("false");
    expect(document.querySelector('[data-zone-id="design"]')!.getAttribute("data-focused")).toBe("false");
  });

  it("五个状态同时写回气泡和人员卡", async () => {
    function Harness() {
      const [zones, setZones] = useState<Zone[]>([zone()]);
      const [selectedSeatId, setSelectedSeatId] = useState<string | null>("s1");
      return (
        <OrgClassroom
          zones={zones}
          selectedSeatId={selectedSeatId}
          onSeatSelect={setSelectedSeatId}
          onStatusChange={(seatId, status) => setZones((current) => updateSeatStatus(current, seatId, status))}
        />
      );
    }
    render(<Harness />);
    const cases = [
      ["idle", "在岗"],
      ["busy", "忙碌"],
      ["meeting", "会议中"],
      ["leave", "休假"],
      ["interview", "面试中"],
    ] as const;
    for (const [status, label] of cases) {
      fireEvent.click(document.querySelector(`[data-status-option="${status}"]`)!);
      await expect.poll(() => document.querySelector("[data-field=status]")!.textContent).toBe(label);
      expect(document.querySelector('[data-seat-label="s1"] [data-visible="true"]')!.textContent).toBe(label);
    }
  });

  it("390 宽打开人员卡时不横向溢出，标签在视口内，地板不盖住卡片", async () => {
    await page.viewport(390, 1026);
    try {
      const packed: Zone = {
        id: "design",
        name: "产品设计部",
        accent: "var(--color-primary)",
        seats: [
          { id: "s1", row: 1, col: 1, person: { id: "p1", name: "林予涵", status: "idle" } },
          { id: "s2", row: 1, col: 2, person: { id: "p2", name: "陈可", status: "busy" } },
          { id: "s3", row: 1, col: 3, person: { id: "p3", name: "周宁", status: "meeting" } },
          { id: "s4", row: 2, col: 1, person: { id: "p4", name: "赵启明", status: "leave" } },
          { id: "s5", row: 2, col: 2, person: { id: "p5", name: "孙晚", status: "interview" } },
          { id: "s6", row: 2, col: 3, person: { id: "p6", name: "何安", status: "meeting" } },
          { id: "s8", row: 3, col: 2, person: { id: "p8", name: "郑澄", status: "busy" } },
          { id: "s10", row: 4, col: 1, person: { id: "p10", name: "许知夏", status: "leave" } },
          { id: "s12", row: 4, col: 3, person: { id: "p12", name: "沈酌", status: "interview" } },
        ],
      };
      const engineering: Zone = {
        id: "engineering",
        name: "技术研发部",
        accent: "var(--color-info)",
        seats: [
          { id: "e1", row: 1, col: 1, person: { id: "q1", name: "周宁", status: "leave" } },
          { id: "e2", row: 1, col: 2, person: { id: "q2", name: "吴桐", status: "busy" } },
        ],
      };
      function Harness() {
        const [selectedSeatId, setSelectedSeatId] = useState<string | null>("s1");
        return (
          <OrgClassroom
            zones={[packed, engineering]}
            selectedSeatId={selectedSeatId}
            onSeatSelect={setSelectedSeatId}
          />
        );
      }
      const { container } = render(<Harness />);
      await expect.poll(() => container.querySelector("[data-scene-scale]")).toBeTruthy();
      const root = container.querySelector<HTMLElement>("[data-slot=org-classroom]")!;
      expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth + 1);
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth + 1);
      const card = container.querySelector<HTMLElement>("[data-slot=org-classroom-person]")!;
      const plane = container.querySelector<HTMLElement>("[data-slot=org-classroom-plane]")!;
      expect(getComputedStyle(card).zIndex).toBe("20");
      expect(getComputedStyle(container.querySelector("[data-slot=org-classroom-floor]")!).zIndex).toBe("0");
      expect(plane.getBoundingClientRect().top).toBeGreaterThanOrEqual(card.getBoundingClientRect().bottom - 2);
      const view = root.getBoundingClientRect();
      const labels = [...container.querySelectorAll<HTMLElement>("[data-seat-label]")].filter(
        (label) => getComputedStyle(label).visibility !== "hidden",
      );
      const rects = labels.map((label) => label.getBoundingClientRect());
      for (const rect of rects) {
        expect(rect.left).toBeGreaterThanOrEqual(view.left - 1);
        expect(rect.right).toBeLessThanOrEqual(view.right + 1);
        expect(rect.bottom).toBeLessThanOrEqual(view.bottom + 1);
      }
      for (const label of labels) {
        const id = label.dataset.seatLabel ?? "";
        if (id.startsWith("zone-")) continue;
        const head = container.querySelector<HTMLElement>(`[data-seat-id="${id}"] [data-seat-torso]`);
        expect(head, id).toBeTruthy();
        const headBox = head!.getBoundingClientRect();
        const labelBox = label.getBoundingClientRect();
        const dx = Math.abs(labelBox.left + labelBox.width / 2 - (headBox.left + headBox.width / 2));
        const dy = headBox.top - labelBox.bottom;
        expect(dx, id).toBeLessThanOrEqual(28);
        expect(dy, id).toBeLessThanOrEqual(16);
        expect(dy, id).toBeGreaterThanOrEqual(-24);
      }
      const zoneChips = labels.filter((label) => (label.dataset.seatLabel ?? "").startsWith("zone-"));
      const nameChips = labels.filter((label) => !(label.dataset.seatLabel ?? "").startsWith("zone-"));
      for (const name of nameChips) {
        for (const zoneChip of zoneChips) {
          expect(
            overlap(name.getBoundingClientRect(), zoneChip.getBoundingClientRect()),
            `${name.dataset.seatLabel} x ${zoneChip.dataset.seatLabel}`,
          ).toBe(0);
        }
      }
    } finally {
      await page.viewport(1280, 800);
    }
  });

  it("悬停桌面不会挪开点击位置，第一下就打开人员卡", async () => {
    render(<OrgClassroom zones={[zone()]} />);
    await expect.poll(() => document.querySelector("[data-scene-scale]")?.getAttribute("data-scene-scale")).toBeTruthy();
    const desk = document.querySelector<HTMLElement>('[data-seat-id="s1"] [data-desk-top]')!;
    const before = desk.getBoundingClientRect();
    const button = page.getByRole("button", { name: "林予涵，在岗" });
    await button.hover();
    const after = desk.getBoundingClientRect();
    expect(Math.abs(after.top - before.top)).toBeLessThan(4);
    expect(Math.abs(after.left - before.left)).toBeLessThan(4);
    expect(Math.abs(after.width - before.width)).toBeLessThan(4);
    await button.click();
    await expect.poll(() => document.querySelector("[data-slot=org-classroom-person]")!.textContent).toContain("林予涵");
    expect(document.querySelector('[data-zone-id="design"]')!.getAttribute("data-focused")).toBe("false");
  });

  it("点大腿打开该座位的人员卡", async () => {
    render(<OrgClassroom zones={[zone()]} />);
    await expect.poll(() => document.querySelector("[data-seat-thigh]")).toBeTruthy();
    const lap = document.querySelector<HTMLElement>("[data-seat-lap]")!;
    const box = lap.getBoundingClientRect();
    let hit: Element | null = null;
    for (let y = box.top + 2; y < box.bottom && !hit; y += 3) {
      for (let x = box.left + 2; x < box.right; x += 3) {
        const candidate = document.elementFromPoint(x, y);
        if (candidate?.closest("[data-seat-lap]")) {
          hit = candidate;
          break;
        }
      }
    }
    const seatId = hit?.closest("[data-seat-id]")?.getAttribute("data-seat-id");
    expect(seatId).toBeTruthy();
    expect(hit?.closest("[data-seat-lap]")).toBeTruthy();
    fireEvent.click(hit as HTMLElement);
    await expect.poll(() => document.querySelector("[data-slot=org-classroom-person]")!.getAttribute("data-open")).toBe(
      "true",
    );
    expect(document.querySelector('[data-zone-id="design"]')!.getAttribute("data-focused")).toBe("false");
  });
});
