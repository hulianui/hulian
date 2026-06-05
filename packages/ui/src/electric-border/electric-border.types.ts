import type { CSSProperties, ReactNode } from "react";

export interface ElectricBorderProps {
  /**
   * 电流描边颜色。默认取瑚琏主色 token `var(--color-primary)`（自动吃明暗主题）。
   * 可传任意 CSS 颜色字符串（hex / oklch / `var(--color-…)` 均可）。
   * 注意 Tailwind v4 下喂给 SVG stroke 的变量必须带 `--color-` 前缀才能解析。
   */
  color?: string;
  /**
   * 电流抖动速度倍率，默认 1。越大电流跳动越快，越小越平缓。
   * 内部换算为 SVG `<animate>` 关键帧时长（speed=1 ≈ 2s 一轮）。
   */
  speed?: number;
  /**
   * 紊乱程度（湍流位移强度），默认 1。越大描边被撕扯得越剧烈（更像放电），
   * 越小越接近平滑边框。内部映射到 `feDisplacementMap` 的 scale。
   */
  chaos?: number;
  /**
   * 边框光晕的厚度（px），默认 2。控制外发光柔边的粗细。
   */
  thickness?: number;
  /**
   * 圆角半径（px），默认 16。同时应用到容器与电流描边。
   */
  borderRadius?: number;
  /**
   * 透传到根容器的额外 className。
   */
  className?: string;
  /**
   * 被电流边框包裹的内容。
   */
  children?: ReactNode;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
}
