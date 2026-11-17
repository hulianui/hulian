import type { HTMLAttributes, ReactNode } from "react";

export interface FadeMaskProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 往哪边淡出：`top` / `bottom` / `left` / `right` 从反方向的实色渐隐到这一边；
   * `radial` 从 `at` 处向四周渐隐（纹理背景的「中心亮、四周退」）。
   * @default "bottom"
   */
  direction?: "top" | "bottom" | "left" | "right" | "radial";
  /** 线性：从哪里开始淡出（之前全实色）。径向：实色核心占渐变半径的比例。@default "60%"（径向为 "0%"） */
  start?: string;
  /** 径向：渐隐中心。@default "50% 50%" */
  at?: string;
  /** 径向：渐隐范围（宽 高）。@default "50% 50%" */
  size?: string;
  children?: ReactNode;
}
