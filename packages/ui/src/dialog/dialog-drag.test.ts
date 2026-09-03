import { describe, it, expect } from "vitest";
import { clamp, dragBounds } from "./dialog-drag";

describe("dragBounds", () => {
  const viewport = { width: 1000, height: 800 };

  it("popup 在视口内：区间就是到四条边的余量", () => {
    const b = dragBounds({ left: 300, top: 250, right: 700, bottom: 550 }, viewport);
    expect(b).toEqual({ minDx: -300, maxDx: 300, minDy: -250, maxDy: 250 });
  });

  it("popup 贴着左上角：只能往右下挪", () => {
    const b = dragBounds({ left: 0, top: 0, right: 400, bottom: 300 }, viewport);
    expect(b).toEqual({ minDx: -0, maxDx: 600, minDy: -0, maxDy: 500 });
  });

  it("popup 比视口还宽：区间反转时取两端之间，两条边都够得着", () => {
    const b = dragBounds({ left: -100, top: 100, right: 1100, bottom: 400 }, viewport);
    // 左边界要求 dx ≥ 100、右边界要求 dx ≤ -100 —— 不判成「不能动」
    expect(b.minDx).toBe(-100);
    expect(b.maxDx).toBe(100);
  });
});

describe("clamp", () => {
  it("夹在区间内", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });
});
