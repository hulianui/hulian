import { describe, expect, it } from "vitest";
import { normalize, linePath, areaPath, barRects } from "./sparkline-geometry";

describe("normalize", () => {
  it("把数据映射到 [0,h]，最大值在顶（y 小）", () => {
    const pts = normalize([0, 5, 10], { w: 100, h: 20 });
    expect(pts[0].y).toBeCloseTo(20); // 最小 → 底
    expect(pts[2].y).toBeCloseTo(0); // 最大 → 顶
    expect(pts[2].x).toBeCloseTo(100);
  });
  it("常量数据居中不除零", () => {
    const pts = normalize([3, 3, 3], { w: 100, h: 20 });
    expect(pts.every((p) => Number.isFinite(p.y))).toBe(true);
  });
});
describe("paths", () => {
  it("linePath 以 M 开头", () => {
    expect(linePath([1, 2, 3], { w: 60, h: 20 })).toMatch(/^M/);
  });
  it("areaPath 闭合（含 Z）", () => {
    expect(areaPath([1, 2, 3], { w: 60, h: 20 })).toMatch(/Z$/);
  });
  it("barRects 数量等于数据点", () => {
    expect(barRects([1, 2, 3, 4], { w: 60, h: 20 }).length).toBe(4);
  });
  it("空数据返回空 path/空数组", () => {
    expect(linePath([], { w: 60, h: 20 })).toBe("");
    expect(barRects([], { w: 60, h: 20 })).toEqual([]);
  });
});
