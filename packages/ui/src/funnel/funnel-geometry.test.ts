import { describe, expect, it } from "vitest";
import { computeFunnel } from "./funnel-geometry";

describe("computeFunnel", () => {
  const r = computeFunnel([
    { id: "in", label: "涌入", value: 1000 },
    { id: "route", label: "路由", value: 800 },
    { id: "done", label: "完成", value: 600 },
  ]);
  it("首级宽度比为 1", () => {
    expect(r[0].widthRatio).toBe(1);
  });
  it("宽度比 = value / 最大值", () => {
    expect(r[1].widthRatio).toBeCloseTo(0.8);
    expect(r[2].widthRatio).toBeCloseTo(0.6);
  });
  it("首级转化率为 null（无上一级）", () => {
    expect(r[0].conversion).toBeNull();
  });
  it("级间转化率 = 本级/上一级", () => {
    expect(r[1].conversion).toBeCloseTo(0.8); // 800/1000
    expect(r[2].conversion).toBeCloseTo(0.75); // 600/800
  });
  it("上一级为 0 时转化率为 null 不除零", () => {
    const z = computeFunnel([
      { id: "a", label: "a", value: 0 },
      { id: "b", label: "b", value: 0 },
    ]);
    expect(z[1].conversion).toBeNull();
    expect(z.every((s) => Number.isFinite(s.widthRatio))).toBe(true);
  });
});
