import { describe, expect, it } from "vitest";
import { anchorLabelsNearHeads, containScale, figureScaleFor, fitScene, labelScaleFor, liftLabels, liftZoneLabels, parkLabels, separateLabels } from "./fit-scene";

describe("fitScene", () => {
  it("leaves a scene that already fits at scale 1", () => {
    expect(fitScene(320, 180, 400)).toEqual({ scale: 1, height: 180 });
  });

  it("scales a transformed scene down to the available width and shrinks the layout height with it", () => {
    expect(fitScene(640, 280, 320)).toEqual({ scale: 0.5, height: 140 });
  });

  it("does not invent a fit before layout exists", () => {
    expect(fitScene(0, 200, 320)).toBeNull();
    expect(fitScene(200, 0, 320)).toBeNull();
    expect(fitScene(200, 100, 0)).toBeNull();
  });
});

describe("containScale", () => {
  it("leaves a scene that already fits", () => {
    expect(containScale(300, 360, 0.8)).toBe(0.8);
  });

  it("shrinks when labels stick out past the viewport", () => {
    expect(containScale(480, 360, 1)).toBeCloseTo(0.75);
  });
});

describe("labelScaleFor", () => {
  it("leaves chips alone when each head has room", () => {
    expect(
      labelScaleFor(
        [{ id: "s1", x: 0, y: 0, w: 40, h: 18 }],
        [{ id: "s1", x: 10, y: 24, w: 20, h: 20 }],
      ),
    ).toBe(1);
  });

  it("shrinks chips when heads sit closer than a name is wide", () => {
    const scale = labelScaleFor(
      [
        { id: "s1", x: 0, y: 0, w: 100, h: 22 },
        { id: "s2", x: 10, y: 0, w: 100, h: 22 },
      ],
      [
        { id: "s1", x: 40, y: 30, w: 24, h: 24 },
        { id: "s2", x: 70, y: 36, w: 24, h: 24 },
      ],
    );
    expect(scale).toBeGreaterThanOrEqual(0.78);
    expect(scale).toBeLessThan(1);
  });
});

describe("figureScaleFor", () => {
  it("keeps a seated figure from collapsing when the floor shrinks", () => {
    expect(figureScaleFor(1)).toBeGreaterThanOrEqual(0.86);
    expect(figureScaleFor(1)).toBeLessThan(1);
    expect(figureScaleFor(0.5)).toBeGreaterThan(1);
    expect(figureScaleFor(0.5)).toBeLessThanOrEqual(1.15);
  });
});

describe("parkLabels", () => {
  it("clears only that seat's desk and will not float the chip away from its anchor", () => {
    const chip = { id: "s1", x: 10, y: 80, w: 48, h: 18 };
    const ownDesk = { id: "s1", x: 0, y: 70, w: 70, h: 36 };
    const otherDesk = { id: "s2", x: 0, y: 10, w: 70, h: 36 };
    const [parked] = parkLabels([chip], [ownDesk, otherDesk], 4, 16);
    expect(parked!.y).toBeGreaterThanOrEqual(80 - 16);
    expect(parked!.y).toBeLessThan(80);
    expect(parked!.y).toBeGreaterThan(otherDesk.y + otherDesk.h);
  });
});

describe("anchorLabelsNearHeads", () => {
  it("keeps every chip within a short walk of its own head on a narrow frame", () => {
    const labels = [
      { id: "s1", x: 8, y: 30, w: 88, h: 22 },
      { id: "s2", x: 20, y: 36, w: 88, h: 22 },
      { id: "s3", x: 36, y: 150, w: 88, h: 22 },
    ];
    const heads = [
      { id: "s1", x: 24, y: 56, w: 28, h: 28 },
      { id: "s2", x: 40, y: 62, w: 28, h: 28 },
      { id: "s3", x: 48, y: 176, w: 28, h: 28 },
    ];
    const placed = anchorLabelsNearHeads(labels, heads, 120, 4, 32);
    for (const label of placed) {
      const home = labels.find((item) => item.id === label.id)!;
      expect(Math.abs(label.x - home.x)).toBeLessThanOrEqual(32);
      expect(Math.abs(label.y - home.y)).toBeLessThanOrEqual(32);
    }
    const s3 = placed.find((item) => item.id === "s3")!;
    expect(s3.y).toBeGreaterThan(110);
  });

  it("does not float a chip above the head it started on", () => {
    const labels = [
      { id: "s1", x: 0, y: 40, w: 70, h: 20 },
      { id: "s2", x: 20, y: 44, w: 70, h: 20 },
    ];
    const [first] = anchorLabelsNearHeads(labels, [], 200, 4, 16);
    expect(first!.y).toBeGreaterThanOrEqual(40 - 6);
  });
});

describe("liftZoneLabels", () => {
  it("moves a department chip off a name without moving the name", () => {
    const name = { id: "s3", x: 40, y: 20, w: 80, h: 22 };
    const zone = { id: "zone-engineering", x: 30, y: 16, w: 72, h: 20 };
    const [placedName, placedZone] = liftZoneLabels([name, zone], 6);
    expect(placedName).toEqual(name);
    expect(placedZone!.y + placedZone!.h).toBeLessThanOrEqual(name.y - 6);
  });
});

describe("liftLabels", () => {
  it("moves a name plate up until it clears the desk", () => {
    const desk = { id: "desk", x: 0, y: 40, w: 80, h: 28 };
    const [label] = liftLabels([{ id: "a", x: 12, y: 36, w: 48, h: 18 }], [desk], 4);
    expect(label!.y + label!.h).toBeLessThanOrEqual(desk.y - 4);
  });
});

describe("separateLabels", () => {
  it("pushes overlapping name plates apart", () => {
    const [a, b] = separateLabels([
      { id: "a", x: 0, y: 0, w: 40, h: 20 },
      { id: "b", x: 30, y: 4, w: 40, h: 20 },
    ]);
    const overlapX = Math.min(a!.x + a!.w, b!.x + b!.w) - Math.max(a!.x, b!.x);
    const overlapY = Math.min(a!.y + a!.h, b!.y + b!.h) - Math.max(a!.y, b!.y);
    expect(overlapX <= 0 || overlapY <= 0).toBe(true);
  });
});
