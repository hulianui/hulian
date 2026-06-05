import type { CSSProperties, ReactNode } from "react";

/** feDisplacementMap 的通道选择器（取位移图哪个颜色通道做 X/Y 偏移）。 */
export type GlassChannel = "R" | "G" | "B" | "A";

export interface GlassSurfaceProps {
  /** 玻璃面内容（居中渲染于折射层之上）。 */
  children?: ReactNode;
  /**
   * 宽度。number 视作 px，string 原样透传（如 "100%"）。
   * @default 200
   */
  width?: number | string;
  /**
   * 高度。number 视作 px，string 原样透传。
   * @default 80
   */
  height?: number | string;
  /**
   * 圆角半径（px）。同时作用于容器与位移图内部矩形。
   * @default 20
   */
  borderRadius?: number;
  /**
   * 玻璃边缘高光带宽度系数（0~1，相对短边）。越大边缘折射越宽。
   * @default 0.07
   */
  borderWidth?: number;
  /**
   * 位移图内部矩形亮度（HSL 的 L，0~100）。控制玻璃"厚度"质感。
   * @default 50
   */
  brightness?: number;
  /**
   * 位移图内部矩形不透明度（0~1）。
   * @default 0.93
   */
  opacity?: number;
  /**
   * 位移图内部矩形的高斯模糊半径（px），柔化折射边界。
   * @default 11
   */
  blur?: number;
  /**
   * 折射结果的二次高斯模糊（feGaussianBlur stdDeviation），消除像素锯齿。
   * @default 0
   */
  displace?: number;
  /**
   * 玻璃磨砂底色不透明度（驱动 --hulian-glass-frost）。0 = 全透明。
   * @default 0
   */
  backgroundOpacity?: number;
  /**
   * backdrop-filter 的 saturate 饱和度倍率。
   * @default 1
   */
  saturation?: number;
  /**
   * 位移强度。负值产生内凹折射，正值外凸。三通道会各自叠加偏移制造色散。
   * @default -180
   */
  distortionScale?: number;
  /**
   * 红通道相对 distortionScale 的额外位移（色差）。
   * @default 0
   */
  redOffset?: number;
  /**
   * 绿通道相对 distortionScale 的额外位移（色差）。
   * @default 10
   */
  greenOffset?: number;
  /**
   * 蓝通道相对 distortionScale 的额外位移（色差）。
   * @default 20
   */
  blueOffset?: number;
  /**
   * 位移图用于 X 方向偏移的通道。
   * @default "R"
   */
  xChannel?: GlassChannel;
  /**
   * 位移图用于 Y 方向偏移的通道。
   * @default "G"
   */
  yChannel?: GlassChannel;
  /**
   * 位移图内红/蓝渐变叠加的混合模式（决定折射纹理形态）。
   * @default "difference"
   */
  mixBlendMode?: CSSProperties["mixBlendMode"];
  /** 透传到根容器的 className（cn 合并）。 */
  className?: string;
  /** 透传到根容器的内联样式。 */
  style?: CSSProperties;
}
