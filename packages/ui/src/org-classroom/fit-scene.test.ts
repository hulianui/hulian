import { describe, expect, it } from "vitest";
import { fitScene, separateLabels } from "./fit-scene";

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
