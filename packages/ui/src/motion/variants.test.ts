import { describe, it, expect } from "vitest";
import { shimmer } from "./variants";

describe("shimmer 预设", () => {
  it("无限循环 + 线性", () => {
    expect(shimmer.transition.repeat).toBe(Infinity);
    expect(shimmer.transition.ease).toBe("linear");
  });
  it("backgroundPosition 来回扫动", () => {
    expect(Array.isArray(shimmer.animate.backgroundPosition)).toBe(true);
    expect(shimmer.animate.backgroundPosition.length).toBeGreaterThanOrEqual(2);
  });
});
