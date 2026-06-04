import { describe, it, expect } from "vitest";
import {
  bezierPath,
  clampZoom,
  fitViewport,
  handleOffsetRatio,
  handlePoint,
  layeredLayout,
  nodesBounds,
  screenToCanvas,
  zoomAtPoint,
} from "./flow-geometry";

describe("clampZoom", () => {
  it("夹在上下限内", () => {
    expect(clampZoom(0.1, 0.35, 2)).toBe(0.35);
    expect(clampZoom(5, 0.35, 2)).toBe(2);
    expect(clampZoom(1, 0.35, 2)).toBe(1);
  });
});

describe("screenToCanvas", () => {
  it("逆变换 viewport（平移+缩放）", () => {
    const vp = { x: 100, y: 50, zoom: 2 };
    // 世界点 (10,20) → 屏幕 10*2+100=120, 20*2+50=90；逆变换应还原
    expect(screenToCanvas(120, 90, vp)).toEqual({ x: 10, y: 20 });
  });
});

describe("handleOffsetRatio / handlePoint", () => {
  it("均分纵向比例", () => {
    expect(handleOffsetRatio(0, 1)).toBeCloseTo(0.5);
    expect(handleOffsetRatio(0, 3)).toBeCloseTo(0.25);
    expect(handleOffsetRatio(2, 3)).toBeCloseTo(0.75);
  });
  it("左桩在左边缘、右桩在右边缘，y 按比例", () => {
    const pos = { x: 0, y: 0 };
    const size = { width: 200, height: 100 };
    expect(handlePoint(pos, size, "left", 0, 1)).toEqual({ x: 0, y: 50 });
    expect(handlePoint(pos, size, "right", 0, 1)).toEqual({ x: 200, y: 50 });
    expect(handlePoint(pos, size, "right", 1, 3)).toEqual({ x: 200, y: 50 });
  });
});

describe("bezierPath", () => {
  it("以 M 起、含 C 三次曲线，端点为传入两点", () => {
    const d = bezierPath({ x: 0, y: 0 }, { x: 100, y: 40 });
    expect(d.startsWith("M 0,0 C")).toBe(true);
    expect(d.endsWith("100,40")).toBe(true);
  });
  it("两点极近时控制点外推有最小量（不退化成直线突变）", () => {
    const d = bezierPath({ x: 10, y: 10 }, { x: 12, y: 10 });
    // dx 最小 36 → 第一个控制点 x = 10+36 = 46
    expect(d).toContain("C 46,10");
  });
});

describe("zoomAtPoint", () => {
  it("锚点下的世界点缩放后不动", () => {
    const vp = { x: 0, y: 0, zoom: 1 };
    const anchor = { x: 300, y: 200 };
    const worldBefore = screenToCanvas(anchor.x, anchor.y, vp);
    const next = zoomAtPoint(vp, 1.5, anchor.x, anchor.y, 0.35, 2);
    const screenAfter = {
      x: worldBefore.x * next.zoom + next.x,
      y: worldBefore.y * next.zoom + next.y,
    };
    expect(screenAfter.x).toBeCloseTo(anchor.x);
    expect(screenAfter.y).toBeCloseTo(anchor.y);
    expect(next.zoom).toBeCloseTo(1.5);
  });
  it("缩放被上限夹住", () => {
    const next = zoomAtPoint({ x: 0, y: 0, zoom: 1.8 }, 2, 0, 0, 0.35, 2);
    expect(next.zoom).toBe(2);
  });
});

describe("nodesBounds / fitViewport", () => {
  const nodes = [
    { id: "a", position: { x: 0, y: 0 } },
    { id: "b", position: { x: 300, y: 200 } },
  ];
  const sizes = {
    a: { width: 200, height: 100 },
    b: { width: 200, height: 100 },
  };

  it("包围盒覆盖所有节点尺寸", () => {
    const b = nodesBounds(nodes, sizes, 240);
    expect(b).toEqual({ minX: 0, minY: 0, maxX: 500, maxY: 300 });
  });

  it("无节点返回 null", () => {
    expect(nodesBounds([], {}, 240)).toBeNull();
  });

  it("fitView 让包围盒中心对齐容器中心", () => {
    const b = nodesBounds(nodes, sizes, 240)!;
    const vp = fitViewport(b, { width: 1000, height: 600 }, 40, 0.35, 2);
    const cx = (b.minX + b.maxX) / 2; // 250
    const cy = (b.minY + b.maxY) / 2; // 150
    expect(cx * vp.zoom + vp.x).toBeCloseTo(500); // 容器中心 x
    expect(cy * vp.zoom + vp.y).toBeCloseTo(300); // 容器中心 y
  });
});

describe("layeredLayout（智能排版）", () => {
  const sizes = {
    a: { width: 200, height: 100 },
    b: { width: 200, height: 100 },
    c: { width: 200, height: 100 },
  };

  it("链式 a→b→c 分到 0/1/2 层，x 严格递增", () => {
    const nodes = [
      { id: "a", position: { x: 0, y: 0 } },
      { id: "b", position: { x: 0, y: 0 } },
      { id: "c", position: { x: 0, y: 0 } },
    ];
    const edges = [
      { source: "a", target: "b" },
      { source: "b", target: "c" },
    ];
    const pos = layeredLayout(nodes, edges, sizes, { columnGap: 80, defaultWidth: 240 });
    expect(pos.a.x).toBe(0);
    expect(pos.b.x).toBe(280); // 200 + 80
    expect(pos.c.x).toBe(560);
  });

  it("同层节点垂直围绕 0 居中堆叠", () => {
    const nodes = [
      { id: "a", position: { x: 0, y: 0 } },
      { id: "b", position: { x: 0, y: 10 } },
    ];
    const pos = layeredLayout(nodes, [], sizes, { rowGap: 32 });
    // 两个 100 高 + 32 间距 = 232，居中 → -116 起
    expect(pos.a.y).toBeCloseTo(-116);
    expect(pos.b.y).toBeCloseTo(16);
  });

  it("最长路径：菱形 a→b,a→c,b→d,c→d 中 d 落在第 2 层", () => {
    const nodes = ["a", "b", "c", "d"].map((id) => ({ id, position: { x: 0, y: 0 } }));
    const edges = [
      { source: "a", target: "b" },
      { source: "a", target: "c" },
      { source: "b", target: "d" },
      { source: "c", target: "d" },
    ];
    const pos = layeredLayout(nodes, edges, {}, { columnGap: 40, defaultWidth: 100 });
    expect(pos.a.x).toBe(0);
    expect(pos.b.x).toBe(140);
    expect(pos.c.x).toBe(140);
    expect(pos.d.x).toBe(280); // 第 2 层，非第 1 层
  });

  it("有环不死循环，返回稳定结果", () => {
    const nodes = ["a", "b"].map((id) => ({ id, position: { x: 0, y: 0 } }));
    const edges = [
      { source: "a", target: "b" },
      { source: "b", target: "a" },
    ];
    const pos = layeredLayout(nodes, edges, {});
    expect(Object.keys(pos).sort()).toEqual(["a", "b"]);
  });

  it("空节点返回空对象", () => {
    expect(layeredLayout([], [], {})).toEqual({});
  });
});
