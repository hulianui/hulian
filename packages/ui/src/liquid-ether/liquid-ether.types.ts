import type { CSSProperties, ReactNode } from "react";

export interface LiquidEtherProps {
  /**
   * 液态色域调色板，至少给 1 个颜色（少于 2 个会自动复制成两端）。
   * 支持任意 CSS 颜色字符串（hex / oklch / rgb / var(--…) 均可）。
   * 默认取瑚琏 chart token：["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-4)"]，
   * 自动随明暗主题切换。
   */
  colors?: string[];

  /**
   * 流动速度因子，越大液体翻涌越快，默认 0.5。
   * 直接映射到 shader 时间步进；建议范围 0.2–1.5。
   */
  speed?: number;

  /**
   * 液态团块（metaball）的尺度，越大色团越大越宏观，默认 1。
   * 值越小越细碎、越多团；越大越融合成大块色域。建议 0.6–2。
   */
  scale?: number;

  /**
   * 指针扰动强度——光标移动时对液面的推力，默认 1。
   * 0 = 完全无视指针（纯自动漂流），越大跟手扰动越明显。建议 0–2。
   */
  mouseForce?: number;

  /**
   * 是否开启自动演示（无人交互时让一个虚拟光标自动巡游搅动液面），默认 true。
   * 关闭后静止等待真实指针交互。
   */
  autoDemo?: boolean;

  /**
   * 整体不透明度（0–1），默认 1。
   * 叠在内容背景上时常用 0.6–0.85 降低视觉重量。
   */
  opacity?: number;

  /**
   * 额外 className，透传到根容器（canvas 包裹层或 reduced fallback）。
   */
  className?: string;

  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;

  /**
   * reduced-motion / 无 WebGL 时渲染的静态替代内容。
   * 默认：吃 chart token 的多点 radial-gradient 静态液面 div（视觉延续，不消失）。
   */
  fallback?: ReactNode;
}
