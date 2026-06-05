import type { ReactNode } from "react";

export interface LaserFlowProps {
  /**
   * 激光主色，CSS 颜色字符串（hex / oklch / rgb / var(--…) 均可）。
   * 默认从 CSS 变量 `--color-chart-1` 取主题色，实现明暗自适应。
   * 映射到 GLSL uniform `uColor`。
   */
  color?: string;

  /**
   * 横向光束偏移（占视口宽度的比例），默认 0.0。
   * 正值向右、负值向左移动主光束。映射到 `uBeamXFrac`。
   */
  horizontalBeamOffset?: number;

  /**
   * 纵向光束偏移（占视口高度的比例），默认 0.0。
   * 映射到 `uBeamYFrac`。
   */
  verticalBeamOffset?: number;

  /**
   * 光流脉冲速度因子，越大流动越快，默认 0.35。映射到 `uFlowSpeed`。
   */
  flowSpeed?: number;

  /**
   * 纵向光束长度因子，默认 2.0。越大光束越长。映射到 `uVLenFactor`。
   */
  verticalSizing?: number;

  /**
   * 横向耀斑长度因子，默认 0.5。映射到 `uHLenFactor`。
   */
  horizontalSizing?: number;

  /**
   * 体积雾强度，默认 0.45。0 = 无雾。映射到 `uFogIntensity`。
   */
  fogIntensity?: number;

  /**
   * 雾噪声缩放，默认 0.3。越大雾团越细碎。映射到 `uFogScale`。
   */
  fogScale?: number;

  /**
   * 雾团下落速度，默认 0.6。映射到 `uFogFallSpeed`。
   */
  fogFallSpeed?: number;

  /**
   * 微流光（wisp）密度，0–2，默认 1。映射到 `uWispDensity`。
   */
  wispDensity?: number;

  /**
   * 微流光行进速度，默认 15。映射到 `uWSpeed`。
   */
  wispSpeed?: number;

  /**
   * 微流光亮度强度，默认 5。映射到 `uWIntensity`。
   */
  wispIntensity?: number;

  /**
   * 光流明暗脉冲强度，0–1，默认 0.25。映射到 `uFlowStrength`。
   */
  flowStrength?: number;

  /**
   * 光束衰减相位宽度，默认 1.1。映射到 `uDecay`。
   */
  decay?: number;

  /**
   * 光束发光起始衰减，默认 1.2。映射到 `uFalloffStart`。
   */
  falloffStart?: number;

  /**
   * 鼠标牵引雾团倾斜的强度，默认 0.01。映射到 `uTiltScale`。
   * 设 0 即关闭鼠标交互（雾团不再随指针倾斜）。
   */
  mouseTiltStrength?: number;

  /**
   * 额外 className，透传到根容器（或 reduced-motion fallback div）。
   */
  className?: string;

  /**
   * reduced-motion / 无 WebGL 时渲染的静态替代内容。
   * 默认：吃 chart token 的纵向 linear-gradient 光束装饰 div。
   */
  fallback?: ReactNode;
}
