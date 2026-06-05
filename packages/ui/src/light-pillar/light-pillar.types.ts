import type { ReactNode } from "react";

export interface LightPillarProps {
  /**
   * 光柱顶部颜色，CSS 颜色字符串（hex / oklch / rgb / var(--…) 均可）。
   * 默认从 CSS 变量 `--color-chart-2` 取主题色，实现明暗自适应。
   */
  topColor?: string;

  /**
   * 光柱底部颜色，CSS 颜色字符串（hex / oklch / rgb / var(--…) 均可）。
   * 默认从 CSS 变量 `--color-chart-1` 取主题色，实现明暗自适应。
   * 顶/底色沿 y 轴渐变混合，构成光柱的色彩纵深。
   */
  bottomColor?: string;

  /**
   * 整体亮度系数，默认 1。
   * 直接乘到最终颜色上，越大越亮、越小越暗。
   */
  intensity?: number;

  /**
   * 光柱自转速度因子，默认 0.3。
   * 同时驱动时间推进——越大旋转与波动越快，0 = 几乎静止（仍有极缓内部流动）。
   */
  rotationSpeed?: number;

  /**
   * 辉光强度，默认 0.005。
   * 控制 raymarch 累积能量经 tanh 压缩前的增益，越大光柱越实越亮。
   * 建议范围 0.001–0.02。
   */
  glowAmount?: number;

  /**
   * 光柱粗细（世界半径），默认 3。
   * 越大光柱越粗、占屏越满；越小越细如激光。
   */
  pillarWidth?: number;

  /**
   * 光柱高度系数，默认 0.4。
   * 影响纵向纹理拉伸节奏，越大纵向条纹越密。
   */
  pillarHeight?: number;

  /**
   * 颗粒噪声强度，默认 0.5。
   * 叠加屏幕空间噪点打散色带，0 = 纯净光柱、无颗粒。
   */
  noiseIntensity?: number;

  /**
   * 光柱整体倾斜角度（度），默认 0。
   * 例：30 = 光柱向一侧斜射；在采样前对 uv 做平面旋转。
   */
  pillarRotation?: number;

  /**
   * 额外 className，透传到 canvas 容器（或 fallback div）。
   */
  className?: string;

  /**
   * reduced-motion / 无 WebGL 时渲染的静态替代内容。
   * 默认：吃 chart token 的 radial/linear 渐变光柱装饰 div。
   */
  fallback?: ReactNode;
}
