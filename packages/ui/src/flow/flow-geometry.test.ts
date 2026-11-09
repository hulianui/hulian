import { describe, it, expect } from "vitest";
import {
  FLOW_EDGE_LABEL_MAX_WIDTH,
  bezierPath,
  clampZoom,
  edgeLabelMaxWidth,
  fitViewport,
  flowPortExclusionRadius,
  handleOffsetRatio,
  handlePoint,
  layeredLayout,
  nodesBounds,
  placeEdgeLabel,
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

function curveSamples(from: { x: number; y: number }, to: { x: number; y: number }) {
  const dx = Math.max(Math.abs(to.x - from.x) * 0.5, 36);
  const p0 = from;
  const p1 = { x: from.x + dx, y: from.y };
  const p2 = { x: to.x - dx, y: to.y };
  const p3 = to;
  const points = [];
  for (let i = 0; i <= 48; i += 1) {
    const t = i / 48;
    const u = 1 - t;
    points.push({
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
    });
  }
  return points;
}

function gapToRect(
  points: { x: number; y: number }[],
  rect: { x: number; y: number; w: number; h: number },
) {
  let best = Number.POSITIVE_INFINITY;
  for (const point of points) {
    const nearestX = Math.min(Math.max(point.x, rect.x), rect.x + rect.w);
    const nearestY = Math.min(Math.max(point.y, rect.y), rect.y + rect.h);
    best = Math.min(best, Math.hypot(point.x - nearestX, point.y - nearestY));
  }
  return best;
}

function circleHitsRect(
  px: number,
  py: number,
  radius: number,
  rect: { x: number; y: number; w: number; h: number },
) {
  const nearestX = Math.min(Math.max(px, rect.x), rect.x + rect.w);
  const nearestY = Math.min(Math.max(py, rect.y), rect.y + rect.h);
  const dx = px - nearestX;
  const dy = py - nearestY;
  return dx * dx + dy * dy < radius * radius;
}

function rectsOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

describe("edge labels", () => {
  it("桩的让位半径按屏幕 12px 圆加 4px 间隙、再除以 zoom", () => {
    expect(flowPortExclusionRadius(1)).toBe(10);
    expect(flowPortExclusionRadius(0.5)).toBe(20);
    expect(flowPortExclusionRadius(0)).toBe(10);
  });

  it("换行宽度不随边长收成窄条", () => {
    expect(edgeLabelMaxWidth({ x: 0, y: 0 }, { x: 400, y: 0 }, 1)).toBe(FLOW_EDGE_LABEL_MAX_WIDTH);
    expect(edgeLabelMaxWidth({ x: 0, y: 0 }, { x: 120, y: 0 }, 1)).toBe(FLOW_EDGE_LABEL_MAX_WIDTH);
    expect(edgeLabelMaxWidth({ x: 0, y: 0 }, { x: 40, y: 0 }, 1)).toBe(FLOW_EDGE_LABEL_MAX_WIDTH);
  });

  it("水平连线的标签在路径上方，不压桩，也不压中点删除钮", () => {
    const from = { x: 100, y: 80 };
    const to = { x: 360, y: 80 };
    const size = { width: 140, height: 48 };
    const place = placeEdgeLabel(from, to, size, 1);
    const rect = { x: place.x, y: place.y, w: size.width, h: size.height };
    const port = flowPortExclusionRadius(1);
    expect(rect.y + size.height / 2).toBeLessThan(80);
    expect(rect.x + size.width / 2).toBeGreaterThan(100);
    expect(rect.x + size.width / 2).toBeLessThan(360);
    expect(circleHitsRect(from.x, from.y, port, rect)).toBe(false);
    expect(circleHitsRect(to.x, to.y, port, rect)).toBe(false);
    expect(rectsOverlap(rect, { x: 230 - 13, y: 80 - 13, w: 26, h: 26 })).toBe(false);
  });

  it("交叉的两条对角线各自连回自己的斜段，而不是停在交点空档", () => {
    const down = { from: { x: 72, y: 360 }, to: { x: 184, y: 500 } };
    const up = { from: { x: 72, y: 500 }, to: { x: 184, y: 360 } };
    const size = { width: 36, height: 22 };
    const downPlace = placeEdgeLabel(down.from, down.to, size, 1, [
      { left: 8, top: 340, width: 64, height: 40 },
      { left: 184, top: 480, width: 64, height: 40 },
    ]);
    const upPlace = placeEdgeLabel(up.from, up.to, size, 1, [
      { left: 8, top: 480, width: 64, height: 40 },
      { left: 184, top: 340, width: 64, height: 40 },
    ]);
    const downRect = { x: downPlace.x, y: downPlace.y, w: size.width, h: size.height };
    const upRect = { x: upPlace.x, y: upPlace.y, w: size.width, h: size.height };
    const downPts = curveSamples(down.from, down.to);
    const upPts = curveSamples(up.from, up.to);
    const nearest = (points: { x: number; y: number }[], x: number, y: number) =>
      Math.min(...points.map((point) => Math.hypot(point.x - x, point.y - y)));
    // 引线终点在自己的曲线上，并且离开另一条曲线。只比两个盒子谁更近不够。
    expect(nearest(downPts, downPlace.anchorX, downPlace.anchorY)).toBeLessThanOrEqual(2);
    expect(nearest(upPts, upPlace.anchorX, upPlace.anchorY)).toBeLessThanOrEqual(2);
    expect(nearest(upPts, downPlace.anchorX, downPlace.anchorY)).toBeGreaterThanOrEqual(16);
    expect(nearest(downPts, upPlace.anchorX, upPlace.anchorY)).toBeGreaterThanOrEqual(16);
    expect(gapToRect([{ x: downPlace.anchorX, y: downPlace.anchorY }], downRect)).toBeLessThanOrEqual(24);
    expect(gapToRect([{ x: upPlace.anchorX, y: upPlace.anchorY }], upRect)).toBeLessThanOrEqual(24);
    expect(gapToRect(upPts, downRect)).toBeGreaterThanOrEqual(8);
    expect(gapToRect(downPts, upRect)).toBeGreaterThanOrEqual(8);
    expect(rectsOverlap(downRect, upRect)).toBe(false);
  });

  it("比边还宽的标签会挪开两端的桩", () => {
    const from = { x: 40, y: 50 };
    const to = { x: 78, y: 50 };
    const size = { width: 160, height: 64 };
    const place = placeEdgeLabel(from, to, size, 1);
    const rect = { x: place.x, y: place.y, w: size.width, h: size.height };
    const port = flowPortExclusionRadius(1);
    expect(circleHitsRect(from.x, from.y, port, rect)).toBe(false);
    expect(circleHitsRect(to.x, to.y, port, rect)).toBe(false);
    expect(rectsOverlap(rect, { x: 59 - 13, y: 50 - 13, w: 26, h: 26 })).toBe(false);
  });

  it("比两端节点更宽的长文案让开节点和桩，不收成窄条", () => {
    const from = { x: 88, y: 80 };
    const to = { x: 168, y: 80 };
    const size = { width: 160, height: 56 };
    const nodes = [
      { left: 8, top: 52, width: 80, height: 56 },
      { left: 168, top: 52, width: 80, height: 56 },
    ];
    const place = placeEdgeLabel(from, to, size, 1, nodes);
    const rect = { x: place.x, y: place.y, w: size.width, h: size.height };
    const port = flowPortExclusionRadius(1);
    expect(place.maxWidth).toBe(FLOW_EDGE_LABEL_MAX_WIDTH);
    expect(circleHitsRect(from.x, from.y, port, rect)).toBe(false);
    expect(circleHitsRect(to.x, to.y, port, rect)).toBe(false);
    for (const node of nodes) {
      const overlaps =
        rect.x < node.left + node.width &&
        rect.x + rect.w > node.left &&
        rect.y < node.top + node.height &&
        rect.y + rect.h > node.top;
      expect(overlaps).toBe(false);
    }
  });

  it("缩小后桩在世界上变大，标签仍让开", () => {
    const from = { x: 20, y: 40 };
    const to = { x: 180, y: 90 };
    const size = { width: 180, height: 52 };
    const zoom = 0.35;
    const place = placeEdgeLabel(from, to, size, zoom);
    const rect = { x: place.x, y: place.y, w: size.width, h: size.height };
    const port = flowPortExclusionRadius(zoom);
    expect(circleHitsRect(from.x, from.y, port, rect)).toBe(false);
    expect(circleHitsRect(to.x, to.y, port, rect)).toBe(false);
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
