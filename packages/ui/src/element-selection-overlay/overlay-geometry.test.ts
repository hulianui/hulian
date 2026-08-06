import { describe, it, expect } from "vitest";
import { computeLabelPosition, isRectVisible, toHostRect } from "./overlay-geometry";

const VP = { width: 1000, height: 800 };

describe("toHostRect", () => {
  it("同文档（无偏移）原样返回，且是新对象", () => {
    const rect = { top: 10, left: 20, width: 30, height: 40 };
    const out = toHostRect(rect, null);
    expect(out).toEqual(rect);
    expect(out).not.toBe(rect);
  });

  it("iframe 内坐标叠加框架偏移，尺寸不变", () => {
    const out = toHostRect({ top: 10, left: 20, width: 30, height: 40 }, { left: 100, top: 200 });
    expect(out).toEqual({ top: 210, left: 120, width: 30, height: 40 });
  });

  it("目标在 iframe 内向上滚（负 top）时仍正确叠加", () => {
    const out = toHostRect({ top: -50, left: 0, width: 10, height: 10 }, { left: 8, top: 64 });
    expect(out).toMatchObject({ top: 14, left: 8 });
  });
});

describe("isRectVisible", () => {
  it("视口内 → 可见", () => {
    expect(isRectVisible({ top: 10, left: 10, width: 100, height: 50 }, VP)).toBe(true);
  });
  it("部分露出（跨视口边界）也算可见", () => {
    expect(isRectVisible({ top: -20, left: -20, width: 100, height: 50 }, VP)).toBe(true);
    expect(isRectVisible({ top: 790, left: 990, width: 100, height: 50 }, VP)).toBe(true);
  });
  it("完全在视口外 → 不可见", () => {
    expect(isRectVisible({ top: 900, left: 10, width: 100, height: 50 }, VP)).toBe(false);
    expect(isRectVisible({ top: 10, left: -200, width: 100, height: 50 }, VP)).toBe(false);
  });
  it("零面积 → 不可见（jsdom 下所有 rect 都是 0，正是这条兜住）", () => {
    expect(isRectVisible({ top: 0, left: 0, width: 0, height: 0 }, VP)).toBe(false);
    expect(isRectVisible({ top: 10, left: 10, width: 100, height: 0 }, VP)).toBe(false);
  });
});

describe("computeLabelPosition", () => {
  const label = { width: 80, height: 20 };

  it("上方有空间 → 贴框外上沿，左对齐", () => {
    const pos = computeLabelPosition({ top: 200, left: 300, width: 100, height: 50 }, label, VP);
    expect(pos).toEqual({ placement: "above", top: 176, left: 300 });
  });

  it("贴视口顶 → 翻到框内上沿", () => {
    const pos = computeLabelPosition({ top: 4, left: 300, width: 100, height: 50 }, label, VP);
    expect(pos.placement).toBe("inside");
    expect(pos.top).toBe(8);
  });

  it("元素已滚出视口上方 → 标签夹在视口顶，不出界", () => {
    const pos = computeLabelPosition({ top: -300, left: 300, width: 100, height: 500 }, label, VP);
    expect(pos.placement).toBe("inside");
    expect(pos.top).toBe(0);
  });

  it("右侧溢出 → 夹回视口内", () => {
    const pos = computeLabelPosition({ top: 200, left: 980, width: 100, height: 50 }, label, VP);
    expect(pos.left).toBe(920);
  });

  it("左侧溢出 → 夹到 0", () => {
    const pos = computeLabelPosition({ top: 200, left: -40, width: 100, height: 50 }, label, VP);
    expect(pos.left).toBe(0);
  });

  it("自定义间距", () => {
    const pos = computeLabelPosition({ top: 200, left: 0, width: 10, height: 10 }, label, VP, 12);
    expect(pos.top).toBe(168);
  });
});
