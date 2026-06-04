import type { FlowPoint, FlowSize, FlowViewport } from "./flow.types";

// Flow 画布几何 —— 纯函数（无 DOM/React），便于单测。坐标约定见 FlowViewport：
//   屏幕点 = 世界点 * zoom + (vp.x, vp.y)（相对画布容器左上角）。

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function clampZoom(zoom: number, min: number, max: number): number {
  return clamp(zoom, min, max);
}

/** 保留 2 位小数，压平 path 串长度（避免亚像素抖动写满 d 属性）。 */
function r(n: number): number {
  return Math.round(n * 100) / 100;
}

/** 屏幕坐标（相对容器左上角）→ 世界坐标。 */
export function screenToCanvas(
  screenX: number,
  screenY: number,
  vp: FlowViewport,
): FlowPoint {
  return {
    x: (screenX - vp.x) / vp.zoom,
    y: (screenY - vp.y) / vp.zoom,
  };
}

/** 桩在节点某侧的纵向比例：count 个桩在 (0,1) 区间均分，第 index 个落在 (index+1)/(count+1)。 */
export function handleOffsetRatio(index: number, count: number): number {
  if (count <= 0) return 0.5;
  return (index + 1) / (count + 1);
}

/** 桩在「已连接集合」里的唯一键（节点 id + 桩 id），用 NUL 分隔避免 id 含分隔符撞键。 */
export function handleKey(nodeId: string, handleId: string): string {
  return `${nodeId}\u0000${handleId}`;
}

/**
 * 桩的世界坐标。side=left → 节点左边缘（target 入桩）；right → 右边缘（source 出桩）。
 * 纵向按同侧桩的 index/count 均分。与 flow-node 里桩 DOM 的 top 百分比同一公式 → 连线端点对齐桩中心。
 */
export function handlePoint(
  position: FlowPoint,
  size: FlowSize,
  side: "left" | "right",
  index: number,
  count: number,
): FlowPoint {
  return {
    x: side === "left" ? position.x : position.x + size.width,
    y: position.y + size.height * handleOffsetRatio(index, count),
  };
}

/** 两点间的水平向三次贝塞尔 path（控制点沿 x 轴外推，形成柔顺的 S 形连线）。 */
export function bezierPath(from: FlowPoint, to: FlowPoint): string {
  const dx = Math.max(Math.abs(to.x - from.x) * 0.5, 36);
  return `M ${r(from.x)},${r(from.y)} C ${r(from.x + dx)},${r(from.y)} ${r(to.x - dx)},${r(to.y)} ${r(to.x)},${r(to.y)}`;
}

/** 缩放并保持锚点（屏幕坐标，相对容器）下的世界点不动 —— 滚轮缩放对准光标。 */
export function zoomAtPoint(
  vp: FlowViewport,
  factor: number,
  anchorX: number,
  anchorY: number,
  minZoom: number,
  maxZoom: number,
): FlowViewport {
  const zoom = clampZoom(vp.zoom * factor, minZoom, maxZoom);
  // 锚点对应的世界点在缩放前后须落在同一屏幕位置
  const world = screenToCanvas(anchorX, anchorY, vp);
  return {
    zoom,
    x: anchorX - world.x * zoom,
    y: anchorY - world.y * zoom,
  };
}

export interface FlowBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** 所有节点的世界包围盒（含各自尺寸）。无节点返回 null。 */
export function nodesBounds(
  nodes: { id: string; position: FlowPoint; width?: number }[],
  sizes: Record<string, FlowSize>,
  defaultWidth: number,
  defaultHeight = 120,
): FlowBounds | null {
  if (nodes.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const n of nodes) {
    const w = sizes[n.id]?.width ?? n.width ?? defaultWidth;
    const h = sizes[n.id]?.height ?? defaultHeight;
    minX = Math.min(minX, n.position.x);
    minY = Math.min(minY, n.position.y);
    maxX = Math.max(maxX, n.position.x + w);
    maxY = Math.max(maxY, n.position.y + h);
  }
  return { minX, minY, maxX, maxY };
}

export interface LayeredLayoutOptions {
  /** 层间水平间距（px）。默认 80。 */
  columnGap?: number;
  /** 同层节点垂直间距（px）。默认 32。 */
  rowGap?: number;
  /** 缺测量时的兜底宽/高。 */
  defaultWidth?: number;
  defaultHeight?: number;
}

/**
 * 智能排版（auto-layout）：按连线拓扑做最长路径分层，左→右铺成有向无环图的层级布局。
 * 纯函数零依赖 —— node 的层 = 所有前驱层 +1（无前驱即第 0 层）；同层按当前 y 稳定排序后垂直居中堆叠。
 * 有环时用「松弛迭代 + 步数封顶」防死循环（环不保证最优，但收敛到稳定层级）。返回 id → 新坐标。
 */
export function layeredLayout(
  nodes: { id: string; position: FlowPoint; width?: number }[],
  edges: { source: string; target: string }[],
  sizes: Record<string, FlowSize>,
  opts: LayeredLayoutOptions = {},
): Record<string, FlowPoint> {
  const columnGap = opts.columnGap ?? 80;
  const rowGap = opts.rowGap ?? 32;
  const defaultWidth = opts.defaultWidth ?? 240;
  const defaultHeight = opts.defaultHeight ?? 120;
  if (nodes.length === 0) return {};

  const ids = nodes.map((n) => n.id);
  const idSet = new Set(ids);
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const origIndex = new Map(ids.map((id, i) => [id, i]));

  const preds = new Map<string, string[]>();
  for (const id of ids) preds.set(id, []);
  for (const e of edges) {
    if (e.source === e.target || !idSet.has(e.source) || !idSet.has(e.target)) continue;
    preds.get(e.target)!.push(e.source);
  }

  // 最长路径分层：反复松弛直到稳定，步数封顶 = 节点数（防环死循环）。
  const layer = new Map<string, number>();
  for (const id of ids) layer.set(id, 0);
  for (let iter = 0; iter <= ids.length; iter++) {
    let changed = false;
    for (const id of ids) {
      let L = 0;
      for (const p of preds.get(id)!) L = Math.max(L, (layer.get(p) ?? 0) + 1);
      if (L !== layer.get(id)) {
        layer.set(id, L);
        changed = true;
      }
    }
    if (!changed) break;
  }

  const w = (id: string) => sizes[id]?.width ?? nodeById.get(id)?.width ?? defaultWidth;
  const h = (id: string) => sizes[id]?.height ?? defaultHeight;

  // 按层分组
  const byLayer = new Map<number, string[]>();
  for (const id of ids) {
    const L = layer.get(id)!;
    (byLayer.get(L) ?? byLayer.set(L, []).get(L)!).push(id);
  }
  const layerKeys = [...byLayer.keys()].sort((a, b) => a - b);

  // 每层 x = 之前各层最大宽度累加 + columnGap
  const layerX = new Map<number, number>();
  let x = 0;
  for (const L of layerKeys) {
    layerX.set(L, x);
    x += Math.max(...byLayer.get(L)!.map(w)) + columnGap;
  }

  // 每层垂直居中堆叠（围绕 y=0），同层按当前 y、再按原序稳定排
  const pos: Record<string, FlowPoint> = {};
  for (const L of layerKeys) {
    const col = byLayer.get(L)!.slice().sort((a, b) => {
      const dy = nodeById.get(a)!.position.y - nodeById.get(b)!.position.y;
      return dy !== 0 ? dy : origIndex.get(a)! - origIndex.get(b)!;
    });
    const totalH = col.reduce((s, id) => s + h(id), 0) + rowGap * Math.max(col.length - 1, 0);
    let y = -totalH / 2;
    for (const id of col) {
      pos[id] = { x: layerX.get(L)!, y };
      y += h(id) + rowGap;
    }
  }
  return pos;
}

/** 计算让包围盒在容器内居中铺满（留 padding）的视口。 */
export function fitViewport(
  bounds: FlowBounds,
  container: FlowSize,
  padding: number,
  minZoom: number,
  maxZoom: number,
): FlowViewport {
  const bw = Math.max(bounds.maxX - bounds.minX, 1);
  const bh = Math.max(bounds.maxY - bounds.minY, 1);
  const availW = Math.max(container.width - padding * 2, 1);
  const availH = Math.max(container.height - padding * 2, 1);
  const zoom = clampZoom(Math.min(availW / bw, availH / bh), minZoom, maxZoom);
  // 居中：包围盒中心对齐容器中心
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  return {
    zoom,
    x: container.width / 2 - cx * zoom,
    y: container.height / 2 - cy * zoom,
  };
}
