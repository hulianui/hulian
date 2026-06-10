import type { CSSProperties, ReactNode } from "react";

export interface BallpitProps {
  /**
   * 小球数量上限，默认 80。
   * 实际生效数量随容器面积自适应：球总面积 ≤ 容器面积约 42%，
   * 窄小容器会先等比缩小球径、仍超则减少数量（resize 时同样重新约束），
   * 保证再窄的卡片也不会超填充抖动。碰撞为 O(n²)，建议 ≤ 200。
   */
  count?: number;
  /**
   * 小球配色，默认取瑚琏 chart token（自动吃明暗主题）。
   * 可传任意 CSS 颜色字符串（hex / oklch / rgb / var(--…) 均可），按索引循环分配到各球。
   * 默认：["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"]
   */
  colors?: string[];
  /**
   * 重力强度（px/s²），默认 900。
   * 0 = 失重漂浮（小球只受墙壁与互撞约束）；越大越快往下沉。
   */
  gravity?: number;
  /**
   * 墙壁/互撞能量保留系数（弹性），默认 0.86。
   * 范围 0–1：1 = 完全弹性永不停；越小越快沉底。
   */
  bounce?: number;
  /**
   * 小球半径范围 [最小, 最大]（px），默认 [10, 26]。
   * 每个球在该范围内随机取半径；另受容器约束 ——
   * 单球半径不超过容器短边约 22%，整体超填充时按面积占用率等比缩小。
   */
  sizeRange?: [number, number];
  /**
   * 是否跟随光标：光标在容器内时形成一个"排斥球"推开周围小球，默认 true。
   * 关闭后小球纯靠重力与互撞，光标无交互。
   */
  followCursor?: boolean;
  /**
   * reduced-motion / 无 canvas 时的静态兜底内容（可选）。
   * 不传则降级为一组静态排布的小球占位。
   */
  fallback?: ReactNode;
  /**
   * 透传到根容器 div 的额外 className。
   * 组件自带 absolute inset-0 z-0，放在 relative 容器里即可铺满。
   */
  className?: string;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
}
