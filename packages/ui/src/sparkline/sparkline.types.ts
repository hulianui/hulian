import type { ReactNode, SVGProps } from "react";
import type { SparkDatum } from "./sparkline-geometry";

export type SparklineVariant = "line" | "area" | "bar";

export interface SparklineProps
  extends Omit<SVGProps<SVGSVGElement>, "data"> {
  /** 数据：纯数字序列或 {x,y} 点（取 y） */
  data: SparkDatum[];
  /** 渲染形态：折线 / 面积 / 柱。默认 line */
  variant?: SparklineVariant;
  /** 视口宽，默认 80 */
  width?: number;
  /** 视口高，默认 24 */
  height?: number;
  /**
   * 描边/填充色，默认 var(--color-primary)。可传语义色名（"primary"/"success"/"danger"/"chart-2"
   * 等，经 resolveTone 解析为 var(--color-*)）、任意 CSS 颜色或变量。
   */
  tone?: string;
  /** 在末点画强调圆点，默认 false */
  highlightLast?: boolean;
  /** 归一化下界，不传从数据推 */
  min?: number;
  /** 归一化上界，不传从数据推 */
  max?: number;
  /**
   * 基准线：在该数值处画一条横向虚线，让序列有个「对比的参照」而不只是形状。
   * 典型用法是上期均值 / 目标值 / 及格线 —— 此前 Sparkline 只能表达序列本身，
   * 「当前 vs 参照」只能在旁边另拼两个数字。
   *
   * 不传 `min`/`max` 时会把基准值一并纳入归一化域，保证它落在视口内而不是被裁到外面。
   */
  baseline?: number;
  /**
   * 基准线颜色，默认 `var(--color-muted-foreground)`。取值同 `tone`（语义色名 / 任意 CSS 颜色 / 变量）。
   */
  baselineTone?: string;
  /** 基准线的原生 tooltip 文案（渲染为 SVG `<title>`）。 */
  baselineLabel?: string;
  /**
   * 逐点原生 tooltip：返回字符串渲染为 SVG <title>（零 JS，RSC 安全）。
   * 入参为该点的原始数值与索引。
   */
  renderTooltip?: (value: number, index: number) => ReactNode;
  className?: string;
}
