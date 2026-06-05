import type { ReactNode } from "react";

export interface MetaBallsProps {
  /**
   * 主体小球颜色（聚合时的填充色）。接受任意 CSS 颜色字符串，
   * 推荐喂瑚琏色彩 token —— **必须带 `--color-` 前缀**（如 `var(--color-chart-1)`），
   * 裸 `var(--primary)` 在本 Tailwind v4 体系下不会被 shader 解析。
   * @default "var(--color-chart-1)"
   */
  color?: string;
  /**
   * 跟随鼠标 / 自动游走的「光标球」颜色，与 {@link color} 在交界处混合。
   * 同样推荐 `--color-` 前缀的 token 值。
   * @default "var(--color-chart-4)"
   */
  cursorBallColor?: string;
  /**
   * 小球公转速度倍率。越大游走越快，越小越绵柔。
   * @default 0.3
   */
  speed?: number;
  /**
   * 是否启用鼠标交互（光标球跟随指针）。关闭后光标球自动做椭圆巡游。
   * @default true
   */
  enableMouseInteraction?: boolean;
  /**
   * 光标球向目标位置插值的平滑系数（0–1）。越小越「拖尾」、越大越跟手。
   * @default 0.05
   */
  hoverSmoothness?: number;
  /**
   * 整体观察尺度。越大视野越广、小球越小且分布越散。
   * @default 30
   */
  animationSize?: number;
  /**
   * 主体小球数量（1–50，超出夹取到 50）。
   * @default 15
   */
  ballCount?: number;
  /**
   * 聚拢因子。越大小球轨道越外扩越松散，越小越向中心抱团。
   * @default 1
   */
  clumpFactor?: number;
  /**
   * 光标球半径（着色器单位）。
   * @default 3
   */
  cursorBallSize?: number;
  /**
   * 是否透明背景（true 时画布只画发光小球、底色由容器决定；false 时填黑底）。
   * @default true
   */
  enableTransparency?: boolean;
  /**
   * 透传到 canvas（正常渲染）或 fallback 容器（reduced-motion / 无 WebGL）的 className。
   */
  className?: string;
  /**
   * reduced-motion 或无 WebGL 时的自定义静态备用内容（叠在静态渐变球团上方）。
   */
  fallback?: ReactNode;
}
