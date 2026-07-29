import type { HTMLAttributes, ReactNode } from "react";

export interface StatProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: ReactNode;
  /** 环比百分比，>=0 升(text-primary) / <0 降(text-danger)；不传则不渲染趋势 */
  delta?: number;
  /** 趋势旁的说明文案（如「较上月」）。**依附于 delta**：不传 delta 时整块趋势不渲染，它也不会出现——要与趋势无关的注脚请用 `hint` */
  deltaLabel?: ReactNode;
  /**
   * 与趋势无关的一行注脚（如「上限 200 题」「2 人未交卷」），独立于 `delta` 渲染，
   * 位于趋势行下方、样式为更小一档的 muted 文字。默认不传则不渲染。
   * 适用于「数值 + 一句补充口径」而标签不该被撑长的 KPI 卡。
   */
  hint?: ReactNode;
  icon?: ReactNode;
  /** 可选图表插槽（如 KPI 趋势 sparkline），渲染在数值行下方、delta 上方。 */
  chart?: ReactNode;
}
