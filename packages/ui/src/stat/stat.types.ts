import type { HTMLAttributes, ReactNode } from "react";

// 取值与顺序照抄 [Tag](../tag/tag.types.ts) 的 TagTone：同一套语义色在库内只该有一份命名，
// 消费方在一个页面里混用 Tag 与 Stat 时不必记两张对照表。
export type StatTone = "neutral" | "brand" | "info" | "success" | "warning" | "danger";

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
  /**
   * 语气色，**只作用于 `icon` 底座**（浅底 `bg-*-subtle` + 语义色文字），
   * 不改 `value` 与 `delta` 的颜色——KPI 卡的注意力仍该在数字上。
   * 默认 `neutral` 即中性灰底座，与 0.63.x 之前的表现完全一致。
   * 用途是让一排同构 KPI 卡能按颜色定位（在线/告警/故障各是一色），不传 `icon` 时无效。
   */
  tone?: StatTone;
  /** 可选图表插槽（如 KPI 趋势 sparkline），渲染在数值行下方、delta 上方。 */
  chart?: ReactNode;
}
