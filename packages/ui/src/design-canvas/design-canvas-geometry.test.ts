import { describe, it, expect } from "vitest";
// 视口数学复用 Flow 的实现（见 design-canvas-geometry 顶部注释）。这里按 DesignCanvas 的
// 使用契约再测一遍：不是重复 flow-geometry 的单测，而是钉住「复用不许悄悄变语义」这条边界 ——
// 哪天 Flow 改了锚点或钳制口径，DesignCanvas 的测试要先红。
import { clampZoom, screenToCanvas, zoomAtPoint } from "../flow/flow-geometry";
import {
  canvasToScreen,
  itemsBounds,
  moveRect,
  normalizeRect,
  resizeRect,
  snapTo,
} from "./design-canvas-geometry";
import type { DesignCanvasRect } from "./design-canvas.types";

const rect: DesignCanvasRect = { x: 100, y: 100, width: 200, height: 100 };

describe("屏幕 ↔ 画布坐标互转", () => {
  it("canvasToScreen 正变换（世界 * zoom + pan）", () => {
    expect(canvasToScreen({ x: 10, y: 20 }, { x: 100, y: 50, zoom: 2 })).toEqual({
      x: 120,
      y: 90,
    });
  });
  it("与 screenToCanvas 互为逆运算（往返回到原点）", () => {
    const vp = { x: -37, y: 12.5, zoom: 1.75 };
    const world = { x: 42, y: -18 };
    const screen = canvasToScreen(world, vp);
    const back = screenToCanvas(screen.x, screen.y, vp);
    expect(back.x).toBeCloseTo(world.x, 10);
    expect(back.y).toBeCloseTo(world.y, 10);
  });
  it("zoom=1 且 pan=0 时两个坐标系重合", () => {
    const vp = { x: 0, y: 0, zoom: 1 };
    expect(canvasToScreen({ x: 8, y: 9 }, vp)).toEqual({ x: 8, y: 9 });
    expect(screenToCanvas(8, 9, vp)).toEqual({ x: 8, y: 9 });
  });
});

describe("缩放钳制", () => {
  it("超出上下限被夹住，区间内原样返回", () => {
    expect(clampZoom(0.02, 0.1, 4)).toBe(0.1);
    expect(clampZoom(99, 0.1, 4)).toBe(4);
    expect(clampZoom(2.5, 0.1, 4)).toBe(2.5);
  });
  it("zoomAtPoint 到顶后不再放大（视口彻底不动）", () => {
    const vp = { x: 30, y: 40, zoom: 4 };
    expect(zoomAtPoint(vp, 2, 100, 100, 0.1, 4)).toEqual(vp);
  });
});

describe("指针锚定缩放", () => {
  it("锚点下的世界点缩放前后落在同一屏幕位置", () => {
    const vp = { x: 20, y: -10, zoom: 1 };
    const anchor = { x: 250, y: 130 };
    const before = screenToCanvas(anchor.x, anchor.y, vp);
    const next = zoomAtPoint(vp, 1.6, anchor.x, anchor.y, 0.1, 4);
    const after = canvasToScreen(before, next);
    expect(after.x).toBeCloseTo(anchor.x, 10);
    expect(after.y).toBeCloseTo(anchor.y, 10);
  });
  it("缩小同样锚定（factor < 1）", () => {
    const vp = { x: 0, y: 0, zoom: 2 };
    const next = zoomAtPoint(vp, 0.5, 400, 300, 0.1, 4);
    expect(next.zoom).toBe(1);
    expect(canvasToScreen(screenToCanvas(400, 300, vp), next)).toEqual({ x: 400, y: 300 });
  });
});

describe("snapTo", () => {
  it("按步长四舍五入", () => {
    expect(snapTo(13, 8)).toBe(16);
    expect(snapTo(11, 8)).toBe(8);
    expect(snapTo(-13, 8)).toBe(-16);
  });
  it("step <= 0 / 非有限数时原样返回（调用方不必先判空）", () => {
    expect(snapTo(13.3, 0)).toBe(13.3);
    expect(snapTo(13.3, -5)).toBe(13.3);
    expect(snapTo(13.3, Number.NaN)).toBe(13.3);
  });
});

describe("normalizeRect", () => {
  it("负宽高翻正并把左上角挪到真正的左上角", () => {
    expect(normalizeRect({ x: 100, y: 100, width: -40, height: -20 })).toEqual({
      x: 60,
      y: 80,
      width: 40,
      height: 20,
    });
  });
  it("已经是正的原样返回", () => {
    expect(normalizeRect(rect)).toEqual(rect);
  });
});

describe("moveRect", () => {
  it("平移不改尺寸", () => {
    expect(moveRect(rect, 15, -25)).toEqual({ x: 115, y: 75, width: 200, height: 100 });
  });
  it("snap 只吸附左上角，宽高纹丝不动", () => {
    const moved = moveRect({ x: 3, y: 3, width: 37, height: 41 }, 4, 4, 10);
    expect(moved).toEqual({ x: 10, y: 10, width: 37, height: 41 });
  });
});

describe("resizeRect 八向", () => {
  it("e / s / w / n 各只动一条边，对边锚死", () => {
    expect(resizeRect(rect, "e", 50, 999)).toEqual({ x: 100, y: 100, width: 250, height: 100 });
    expect(resizeRect(rect, "s", 999, 30)).toEqual({ x: 100, y: 100, width: 200, height: 130 });
    expect(resizeRect(rect, "w", -20, 999)).toEqual({ x: 80, y: 100, width: 220, height: 100 });
    expect(resizeRect(rect, "n", 999, -10)).toEqual({ x: 100, y: 90, width: 200, height: 110 });
  });
  it("角向同时动两条边", () => {
    expect(resizeRect(rect, "se", 10, 20)).toEqual({ x: 100, y: 100, width: 210, height: 120 });
    expect(resizeRect(rect, "nw", 10, 20)).toEqual({ x: 110, y: 120, width: 190, height: 80 });
  });
  it("拖过锚定边会翻转，而不是卡死在最小尺寸", () => {
    // 右边缘向左拖 260（原宽 200）→ 翻到左侧，宽 60
    expect(resizeRect(rect, "e", -260, 0)).toEqual({ x: 40, y: 100, width: 60, height: 100 });
    // 上边缘向下拖 160（原高 100）→ 翻到下侧，高 60
    expect(resizeRect(rect, "n", 0, 160)).toEqual({ x: 100, y: 200, width: 200, height: 60 });
  });
  it("翻转过程中最小尺寸按翻转后的方向施加（不粘回锚定边）", () => {
    // 右边缘越过左边缘 5 → 已翻转但不足最小宽 12 → 继续朝翻转方向补足，锚定边（左 100）不动
    expect(resizeRect(rect, "e", -205, 0, { minWidth: 12 })).toEqual({
      x: 88,
      y: 100,
      width: 12,
      height: 100,
    });
  });
  it("正好压到零宽时不翻转，朝原方向补足最小宽", () => {
    // 零宽没有方向可言，此时按未翻转处理，避免矩形在锚定边上左右横跳
    expect(resizeRect(rect, "e", -200, 0, { minWidth: 12 })).toEqual({
      x: 100,
      y: 100,
      width: 12,
      height: 100,
    });
  });
  it("最小宽高在未翻转时把被拖的边推开，锚定边不动", () => {
    const r = resizeRect(rect, "w", 195, 0, { minWidth: 20 });
    expect(r.x + r.width).toBe(300); // 右边缘（锚点）保持
    expect(r.width).toBe(20);
  });
  it("snap 只吸附被拖的边，锚定边保持原值", () => {
    const r = resizeRect({ x: 3, y: 3, width: 34, height: 34 }, "se", 5, 5, { snap: 10 });
    expect(r.x).toBe(3);
    expect(r.y).toBe(3);
    expect(r.x + r.width).toBe(40);
    expect(r.y + r.height).toBe(40);
  });
  it("单轴方向不碰另一轴的最小尺寸逻辑（高度 0 的扁矩形横向 resize 不被撑高）", () => {
    const flat: DesignCanvasRect = { x: 0, y: 0, width: 50, height: 0 };
    expect(resizeRect(flat, "e", 10, 0, { minHeight: 8 })).toEqual({
      x: 0,
      y: 0,
      width: 60,
      height: 0,
    });
  });
});

describe("itemsBounds 多元素包围盒", () => {
  it("空数组返回 null", () => {
    expect(itemsBounds([])).toBeNull();
  });
  it("包住所有矩形的四至", () => {
    expect(
      itemsBounds([
        { x: 10, y: 20, width: 30, height: 40 },
        { x: -5, y: 100, width: 10, height: 10 },
        { x: 200, y: 0, width: 50, height: 5 },
      ]),
    ).toEqual({ minX: -5, minY: 0, maxX: 250, maxY: 110 });
  });
  it("单个矩形就是它自己的四至", () => {
    expect(itemsBounds([rect])).toEqual({ minX: 100, minY: 100, maxX: 300, maxY: 200 });
  });
  it("含负宽高的矩形先归一再计（不会算出反向的包围盒）", () => {
    expect(itemsBounds([{ x: 100, y: 100, width: -40, height: -20 }])).toEqual({
      minX: 60,
      minY: 80,
      maxX: 100,
      maxY: 100,
    });
  });
});
