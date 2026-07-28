import { describe, expect, it } from "vitest";
import { normalize, linePath, areaPath, barRects, valueToY } from "./sparkline-geometry";

describe("valueToY", () => {
  const data = [0, 5, 10];
  it("与 normalize 同口径：同一个值落在同一条 y 上", () => {
    const pts = normalize(data, { w: 100, h: 20 });
    expect(valueToY(5, data, { w: 100, h: 20 })).toBeCloseTo(pts[1].y);
    expect(valueToY(10, data, { w: 100, h: 20 })).toBeCloseTo(pts[2].y);
  });
  it("域外的值夹紧到 [0,h]，不画到视口外", () => {
    expect(valueToY(999, data, { w: 100, h: 20 })).toBe(0);
    expect(valueToY(-999, data, { w: 100, h: 20 })).toBe(20);
  });
  it("常量数据（range=0）居中，避免除零", () => {
    expect(valueToY(3, [3, 3, 3], { w: 100, h: 20 })).toBe(10);
  });
  it("显式 min/max 优先于数据推导", () => {
    expect(valueToY(0, data, { w: 100, h: 20, min: 0, max: 20 })).toBe(20);
    expect(valueToY(20, data, { w: 100, h: 20, min: 0, max: 20 })).toBe(0);
  });
});

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
