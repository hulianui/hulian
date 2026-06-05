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
  /** 描边/填充色，默认 var(--color-primary)；传任意 CSS 颜色或变量 */
  tone?: string;
  /** 在末点画强调圆点，默认 false */
  highlightLast?: boolean;
  /** 归一化下界，不传从数据推 */
  min?: number;
  /** 归一化上界，不传从数据推 */
  max?: number;
  /**
   * 逐点原生 tooltip：返回字符串渲染为 SVG <title>（零 JS，RSC 安全）。
   * 入参为该点的原始数值与索引。
   */
  renderTooltip?: (value: number, index: number) => ReactNode;
  className?: string;
}
