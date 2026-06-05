import type { CSSProperties, ReactNode } from "react";

export interface FluidGlassProps {
  /**
   * 玻璃透镜半径，按容器短边的比例（0–1）。默认 0.26。
   * 越大透镜越大、折射区域越广；建议 0.15–0.4。
   */
  size?: number;
  /**
   * 折射强度（IOR 折射率的瑚琏化映射），默认 0.5。
   * 越大透镜中心放大/扭曲越强；0 表示几乎透明无折射。建议 0–1。
   */
  refraction?: number;
  /**
   * 色散（chromatic aberration）强度，默认 0.3。
   * 模拟玻璃边缘的 RGB 分光彩边；0 关闭分光。建议 0–1。
   */
  dispersion?: number;
  /**
   * 背景流动速度倍率，默认 1。0 时背景静止（但透镜仍跟随指针）。
   */
  speed?: number;
  /**
   * 背景渐变色组，默认取瑚琏 chart token（自动明暗适配）。
   * 可传任意 CSS 颜色字符串（hex / oklch / var(--color-…) 均可），取前 3 个。
   * 默认：["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-4)"]
   */
  colors?: string[];
  /**
   * 透镜是否跟随指针移动，默认 true。
   * 关闭时透镜停在容器中心做缓慢漂移。
   */
  followPointer?: boolean;
  /**
   * 透传到根容器的额外 className。组件根为 `relative overflow-hidden`，
   * canvas 自带 `absolute inset-0`。
   */
  className?: string;
  /**
   * 覆盖在玻璃背景上方的内容，通过 relative z-10 层叠在画布之上。
   */
  children?: ReactNode;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
}
