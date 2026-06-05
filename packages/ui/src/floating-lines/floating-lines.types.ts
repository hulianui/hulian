import type { ReactNode } from "react";

export interface FloatingLinesProps {
  /**
   * 线条渐变色带（沿线序从首到尾插值），默认取瑚琏 chart token，自动吃明暗主题。
   * 可传任意 CSS 颜色字符串（hex / oklch / rgb / var(--…) 计算后值均可，
   * 浏览器离屏 canvas 负责解析）。最多取前 5 段。
   * 默认：["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-4)"]
   */
  colors?: string[];
  /**
   * 三组波（顶 / 中 / 底）各自的线条数量。
   * 越多越密集，性能开销越大。建议 3–12。默认 6。
   */
  lineCount?: number;
  /**
   * 相邻线条的横向相位间距（影响线束的疏密层叠感）。默认 5。
   */
  lineDistance?: number;
  /**
   * 动画速度倍率，默认 1。0 为静止；越大流动越快。
   */
  animationSpeed?: number;
  /**
   * 是否启用指针交互（鼠标靠近时线条产生径向弯曲牵引），默认 true。
   * 在 reduced-motion / 无 WebGL 时自动失效（降级为静态兜底）。
   */
  interactive?: boolean;
  /**
   * 指针弯曲的影响半径系数（值越大影响范围越小、越聚焦），默认 5。
   */
  bendRadius?: number;
  /**
   * 指针弯曲强度（带符号，负值向反方向牵引），默认 -0.5。
   */
  bendStrength?: number;
  /**
   * 透传到根容器的额外 className（根自带 absolute inset-0 z-0）。
   */
  className?: string;
  /**
   * reduced-motion / 无 WebGL 静态兜底层内渲染的内容（如水印文案）。
   */
  fallback?: ReactNode;
}
