import type { ReactNode } from "react";

/** 雪花形状变体：方块像素 / 圆点 / 六臂雪花。 */
export type PixelSnowVariant = "square" | "round" | "snowflake";

export interface PixelSnowProps {
  /**
   * 雪花主色，CSS 颜色字符串（hex / oklch / rgb / var(--…) 均可）。
   * 默认按画布身后实际底色亮度自适应取色：优先 `--color-foreground` token；
   * 若前景与底色撞色（如亮色主题下放进深色容器，前景近黑画在深底上不可见）
   * 则自动取反改用 `--color-background` token 或纯白/纯黑兜底，
   * 保证深底亮雪、浅底暗雪，任意主题组合下都清晰可见。
   */
  color?: string;

  /**
   * 雪花基准尺寸（屏幕空间近似比例），默认 0.01。
   * 越大雪花越粗，越小越细腻。直接映射 GLSL uniform uFlakeSize。
   */
  flakeSize?: number;

  /**
   * 远处雪花的最小投影尺寸（防止远雪花消失到亚像素），默认 1.25。
   * 映射 uniform uMinFlakeSize。
   */
  minFlakeSize?: number;

  /**
   * 像素化分辨率：横向被切成多少个"大像素"，默认 200。
   * 越小马赛克块越大（更复古），越大越接近原生分辨率。
   */
  pixelResolution?: number;

  /**
   * 飘落速度因子，默认 1.25。越大雪花穿越视野越快。
   */
  speed?: number;

  /**
   * 景深淡出强度，默认 8。越大远处雪花衰减越快（更强的纵深感）。
   */
  depthFade?: number;

  /**
   * 光线步进的最远裁剪距离，默认 20。越大可见层数越多（性能成本越高）。
   */
  farPlane?: number;

  /**
   * 整体亮度倍率，默认 1。
   */
  brightness?: number;

  /**
   * 伽马校正指数，默认 0.4545（≈1/2.2，标准 sRGB 近似）。
   */
  gamma?: number;

  /**
   * 雪花密度（每个网格单元出现雪花的概率阈值），默认 0.3。
   * 越大雪越密。建议 0.05–0.6。
   */
  density?: number;

  /**
   * 雪花形状变体：`square`（方块像素，默认）/ `round`（圆点）/ `snowflake`（六臂雪花）。
   */
  variant?: PixelSnowVariant;

  /**
   * 风向角度（度），默认 125。决定雪花横向漂移方向。
   */
  direction?: number;

  /**
   * 额外 className，透传到根容器（或 reduced-motion fallback div）。
   */
  className?: string;

  /**
   * reduced-motion / 无 WebGL 时渲染的静态替代内容。
   * 默认：白点 + difference 混合的静态点阵雪花装饰（对任意底色自动取反）。
   */
  fallback?: ReactNode;
}
