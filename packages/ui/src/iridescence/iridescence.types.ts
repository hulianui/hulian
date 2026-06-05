import type { ReactNode } from "react";

export interface IridescenceProps {
  /**
   * 虹彩基础色调，接受 [r, g, b]（0..1 范围）或任意 CSS 颜色字符串（hex/oklch/hsl/var(--…)）。
   * 未传时从画布上读取 CSS 变量 --color-chart-3，自动跟随亮/暗主题切换。
   */
  color?: [number, number, number] | string;
  /**
   * 动画速度倍率，默认 1.0。越大流动越快，建议范围 0.1–5。
   */
  speed?: number;
  /**
   * 鼠标偏移幅度，控制鼠标扰动强度，默认 0.1。建议范围 0.01–0.5。
   */
  amplitude?: number;
  /**
   * 是否响应鼠标/触摸移动（mousemove 驱动 uMouse uniform），默认 true。
   * 关闭后 uMouse 固定在 (0.5, 0.5)，效果保持但不随指针变化。
   */
  mouseReact?: boolean;
  /**
   * 透传到 canvas 或 fallback 容器的额外 className。
   */
  className?: string;
  /**
   * prefers-reduced-motion / 无 WebGL 时渲染的静态降级内容（嵌套在 fallback div 内）。
   */
  fallback?: ReactNode;
}
