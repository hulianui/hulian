import type { ReactNode } from "react";

/** 等离子流动方向。forward=正向上涌；reverse=反向下沉；pingpong=正反平滑往复。 */
export type PlasmaDirection = "forward" | "reverse" | "pingpong";

export interface PlasmaProps {
  /**
   * 等离子主色，CSS 颜色字符串（hex / oklch / rgb / var(--…) 均可）。
   * 默认从 CSS 变量 `--color-chart-1` 取主题色，实现明暗自适应；
   * 传 `null`（或不传且 token 解析失败）时退回 shader 原生彩色（不染色）。
   */
  color?: string;

  /**
   * 流动速度因子，越大越快，默认 1。
   * 内部按原版乘以 0.4 喂给 shader（uSpeed），保持节奏与 react-bits 一致。
   */
  speed?: number;

  /**
   * 流动方向，默认 "forward"。
   * - forward：等离子向上涌动
   * - reverse：反向（向下）
   * - pingpong：正反平滑往复（smoothstep 缓动，无突变）
   */
  direction?: PlasmaDirection;

  /**
   * 视场缩放，默认 1。值越大画面越「拉近」、纹理越大；越小越「拉远」、纹理越密。
   */
  scale?: number;

  /**
   * 整体不透明度（叠加在 shader alpha 上），范围 0–1，默认 1。
   * 用于让等离子作为柔和背景时压暗。
   */
  opacity?: number;

  /**
   * 是否启用鼠标交互（指针位置轻微扭曲等离子流场），默认 true。
   * 关闭后纯自动流动，且不挂 mousemove 监听。
   */
  mouseInteractive?: boolean;

  /**
   * 额外 className，透传到 root（canvas 容器或 fallback div）。
   */
  className?: string;

  /**
   * reduced-motion / 无 WebGL 时渲染的静态替代内容。
   * 默认：吃 chart token 的径向渐变装饰 div（保留「等离子」的中心发光观感）。
   */
  fallback?: ReactNode;
}
