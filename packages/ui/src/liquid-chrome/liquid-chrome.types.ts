import type { ReactNode } from "react";

export interface LiquidChromeProps {
  /**
   * 液态铬基础色。
   *
   * 支持两种格式：
   * - `[r, g, b]`：0..1 范围的浮点数组（与 react-bits 原版兼容）
   * - CSS 颜色字符串（如 `"#3b82f6"`, `"oklch(0.7 0.2 240)"`, `"var(--color-chart-2)"`）
   *
   * 默认：从 `--color-chart-2` 读取，自动跟随瑚琏明暗主题。
   */
  baseColor?: [number, number, number] | string;

  /**
   * 液态流动速度乘子，值越大流动越快。
   * @default 0.2
   */
  speed?: number;

  /**
   * 波形振幅，控制液面扭曲幅度（0 = 平静，1 = 强烈）。
   * @default 0.6
   */
  amplitude?: number;

  /**
   * X 方向空间频率。
   * @default 2.5
   */
  frequencyX?: number;

  /**
   * Y 方向空间频率。
   * @default 1.5
   */
  frequencyY?: number;

  /**
   * 是否响应鼠标 / 触摸互动（推动液面涟漪）。
   * @default true
   */
  interactive?: boolean;

  /**
   * 额外 className，透传到 canvas（正常模式）或 fallback div（降级模式）。
   */
  className?: string;

  /**
   * reduced-motion / 无 WebGL 环境下显示的静态 fallback 内容（可选）。
   * fallback 容器本身已有金属感渐变背景，此 children 会叠加在上面。
   */
  fallback?: ReactNode;
}
