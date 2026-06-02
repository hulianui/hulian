import type { CSSProperties } from "react";

const CHART_TOKENS = ["--color-chart-1", "--color-chart-2", "--color-chart-3", "--color-chart-4"];

/** 序列 index → var(--color-chart-N) CSS 变量；越界回绕 */
export function chartColor(i: number): string {
  const n = CHART_TOKENS.length;
  return `var(${CHART_TOKENS[((i % n) + n) % n]})`;
}

// recharts 子件的瑚琏 token 化样式（坐标轴/网格/tooltip），只走 CSS 变量 → 明暗自适应
export const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fill: "var(--color-muted)", fontSize: 12 },
};

export const gridProps = {
  strokeDasharray: "3 3",
  stroke: "var(--color-border)",
  vertical: false,
};

export const tooltipContentStyle: CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius)",
  color: "var(--color-foreground)",
  fontSize: 12,
};

export const tooltipLabelStyle: CSSProperties = { color: "var(--color-muted)" };
