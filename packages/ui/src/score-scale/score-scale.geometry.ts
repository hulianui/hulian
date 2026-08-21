import type { Grade } from "../score-ring/score-ring.grade";

// 分档尺的几何内核。抽成纯函数的理由：这件组件与 Meter 的**唯一**结构差别就在这里 ——
// 条上每一段的宽度来自 grades 的区间宽度，游标的位置来自 value，**两个互不相干的量**。
// Meter 只有后者（一条按 value 填充的指示条），所以它画不出"落在哪一档"，见 score-scale.md。
// 放在 .tsx 里就只能靠渲染快照间接验证；独立出来后，段宽推导可以被直接断言。

/** 条上的一段：由相邻两档的分界线切出来，`widthPercent` 是它在整条量程上占的百分比。 */
export interface ScaleSegment {
  /** 该段在量程上的起点（已夹进 [min, max]）。 */
  from: number;
  /** 该段在量程上的终点（已夹进 [min, max]）。 */
  to: number;
  /** 该段占整条量程的百分比，所有段相加为 100。 */
  widthPercent: number;
  label: string;
  tone?: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * 把等级带切成条上的连续色段。
 *
 * 两条刻意的约定：
 * 1. **最低档向下补到量程起点**。`grades` 只声明每档的下界，最低档的下界未必等于量程下限
 *    （常见写法 `{ min: 20, label: "差" }` + `min={0}`）。不补的话轨道左端会露出一截无主空白，
 *    读者会把它当成"另一档"。
 * 2. **整档落在量程外的直接丢掉**，不留 0 宽的空 div —— 0 宽段在 `segmentGap` 打开时会退化成
 *    一条多余的缝。
 */
export function toSegments(grades: Grade[], min: number, max: number): ScaleSegment[] {
  const span = max - min;
  if (!(span > 0) || grades.length === 0) return [];
  const sorted = [...grades].sort((a, b) => a.min - b.min);
  const segments: ScaleSegment[] = [];
  for (let i = 0; i < sorted.length; i += 1) {
    // 第一段强制从量程起点开始（约定 1）；末段强制收到量程终点，否则最高档会缺一截尾巴。
    const from = i === 0 ? min : clamp(sorted[i].min, min, max);
    const to = i === sorted.length - 1 ? max : clamp(sorted[i + 1].min, min, max);
    const widthPercent = ((to - from) / span) * 100;
    if (widthPercent <= 0) continue;
    segments.push({ from, to, widthPercent, label: sorted[i].label, tone: sorted[i].tone });
  }
  return segments;
}

/**
 * 值在量程上的位置（0–100 百分比），**越界夹到端点**。
 *
 * 夹紧而非允许溢出：游标溢出容器后要么被祖先裁掉、要么把布局撑出横向滚动，两种都是比"看不出
 * 超了多少"更糟的失败。超出这件事改由 `aria-valuetext` 念出原始值来交代（见 score-scale.tsx）。
 */
export function toPercent(value: number, min: number, max: number): number {
  if (!(max > min)) return 0;
  return clamp(((value - min) / (max - min)) * 100, 0, 100);
}
