// Sparkline 几何纯函数：把数据映射到 [0,w]×[0,h] 视口坐标，再产出
// SVG path / 柱矩形。SVG 的 y 轴向下，故最大值映射到 y=0（顶），最小值映射到 y=h（底）。
// 零依赖，可在 RSC 中安全调用。

export type SparkDatum = number | { x: number; y: number };

export interface SparkPoint {
  x: number;
  y: number;
}

export interface SparkScale {
  /** 视口宽 */
  w: number;
  /** 视口高 */
  h: number;
  /** 归一化下界（不传从数据 y 推） */
  min?: number;
  /** 归一化上界（不传从数据 y 推） */
  max?: number;
}

/** 把混合输入归一为 y 数组（{x,y} 取 y，number 直接用） */
function toYValues(data: SparkDatum[]): number[] {
  return data.map((d) => (typeof d === "number" ? d : d.y));
}

/**
 * 把数据点映射到视口坐标。
 * - x 沿宽度均匀分布（单点时取 0）。
 * - y 按 [min,max] 线性归一，最大值在顶（y 小）、最小值在底（y 大）。
 * - 常量数据（range=0）整体居中 h/2，避免除零。
 */
export function normalize(data: SparkDatum[], scale: SparkScale): SparkPoint[] {
  const { w, h } = scale;
  const ys = toYValues(data);
  if (ys.length === 0) return [];

  const lo = scale.min ?? Math.min(...ys);
  const hi = scale.max ?? Math.max(...ys);
  const range = hi - lo;
  const n = ys.length;

  return ys.map((y, i) => {
    const x = n === 1 ? 0 : (i / (n - 1)) * w;
    const py = range === 0 ? h / 2 : h - ((y - lo) / range) * h;
    return { x, y: py };
  });
}

/** 折线 path：以 M 起笔，后续 L 连接。空数据返回 ""。 */
export function linePath(data: SparkDatum[], scale: SparkScale): string {
  const pts = normalize(data, scale);
  if (pts.length === 0) return "";
  return pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${round(p.x)},${round(p.y)}`)
    .join(" ");
}

/** 面积 path：折线 + 沿底边闭合（含末尾 Z）。空数据返回 ""。 */
export function areaPath(data: SparkDatum[], scale: SparkScale): string {
  const pts = normalize(data, scale);
  if (pts.length === 0) return "";
  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${round(p.x)},${round(p.y)}`)
    .join(" ");
  const last = pts[pts.length - 1];
  const first = pts[0];
  return `${line} L${round(last.x)},${round(scale.h)} L${round(first.x)},${round(scale.h)} Z`;
}

export interface SparkRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 等宽柱矩形数组：每个数据点一根柱，柱顶对齐归一化 y，柱底到 h。
 * 柱宽按点数均分并留细缝。空数据返回 []。
 */
export function barRects(
  data: SparkDatum[],
  scale: SparkScale,
  gapRatio = 0.25,
): SparkRect[] {
  const ys = toYValues(data);
  if (ys.length === 0) return [];

  const { w, h } = scale;
  const lo = scale.min ?? Math.min(...ys);
  const hi = scale.max ?? Math.max(...ys);
  const range = hi - lo;
  const n = ys.length;

  const slot = w / n;
  const barW = slot * (1 - gapRatio);
  const offset = (slot - barW) / 2;

  return ys.map((y, i) => {
    const top = range === 0 ? h / 2 : h - ((y - lo) / range) * h;
    return {
      x: round(i * slot + offset),
      y: round(top),
      width: round(barW),
      height: round(h - top),
    };
  });
}

/** 控制 path 字符串体积，保留两位小数。 */
function round(n: number): number {
  return Math.round(n * 100) / 100;
}
