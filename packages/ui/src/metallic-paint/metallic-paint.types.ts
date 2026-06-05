import type { ReactNode } from "react";

export interface MetallicPaintProps {
  /**
   * 高光金属色（金属流体的亮部峰值），CSS 颜色字符串（hex / oklch / rgb / var(--…) 均可）。
   * 默认从 CSS 变量 `--color-chart-1` 取主题色，实现明暗自适应。
   */
  lightColor?: string;

  /**
   * 暗部金属色（金属流体的低谷阴影），CSS 颜色字符串。
   * 默认从 CSS 变量 `--color-foreground` 取主题前景色。
   */
  darkColor?: string;

  /**
   * 金属流动速度因子，越大越快，默认 1。
   * 直接映射到 GLSL 时间步进。0 = 几乎静止（仍有极慢漂移）。
   */
  speed?: number;

  /**
   * 纹理缩放，默认 1。
   * 值越大金属纹路越密集，值越小越宽阔。
   */
  scale?: number;

  /**
   * 折射强度，默认 1。
   * 控制 RGB 三通道错位产生的色散/虹彩感，越大彩边越明显。
   */
  refraction?: number;

  /**
   * 液态扰动强度，默认 0.6。
   * 越大金属表面越像流动的水银，0 = 平整镜面。
   */
  liquid?: number;

  /**
   * 色带边缘模糊（柔化金属条纹的过渡），默认 0.6。
   * 建议范围 0.2–1.5；过小条纹生硬，过大金属感消散。
   */
  blur?: number;

  /**
   * 整体旋转角度（度），默认 -45。
   * 改变金属光线的入射方向。
   */
  angle?: number;

  /**
   * 额外 className，透传到容器（或 fallback div）。
   */
  className?: string;

  /**
   * reduced-motion / 无 WebGL 时渲染的静态替代内容。
   * 默认：吃 token 的金属质感 linear-gradient 装饰 div（不消失，仅静止）。
   */
  fallback?: ReactNode;
}
