import { describe, expect, it } from "vitest";
import { containScale, figureScaleFor, fitScene, liftLabels, parkLabels, separateLabels } from "./fit-scene";

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

describe("figureScaleFor", () => {
  it("keeps a seated figure from collapsing when the floor shrinks", () => {
    expect(figureScaleFor(1)).toBe(1);
    expect(figureScaleFor(0.5)).toBeGreaterThan(1.5);
    expect(figureScaleFor(0.5)).toBeLessThanOrEqual(1.6);
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
