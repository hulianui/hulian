import type { CSSProperties, ReactNode } from "react";

/** 轨道形状预设。custom 时由 customPath 接管。 */
export type OrbitShape =
  | "ellipse"
  | "circle"
  | "square"
  | "rectangle"
  | "triangle"
  | "star"
  | "heart"
  | "infinity"
  | "wave"
  | "custom";

export interface OrbitImagesProps {
  /**
   * 沿轨道环绕的子项列表（任意 ReactNode：<img>、图标、头像、卡片皆可）。
   * 每一项会被等距（fill=true）或同点（fill=false）放置在路径上随轨道流转。
   */
  items: ReactNode[];
  /**
   * 轨道形状预设，默认 "ellipse"。
   * 椭圆/圆/方/矩形/三角/星形/心形/无穷符号/波浪，或 "custom" 走 customPath。
   */
  shape?: OrbitShape;
  /**
   * shape="custom" 时的自定义 SVG path d 字符串（坐标系基于 baseWidth 方形画布）。
   * 其余 shape 下忽略。
   */
  customPath?: string;
  /**
   * 设计画布边长（px·正方形 viewBox），所有半径/坐标基于它，默认 1400。
   * 容器用 CSS 缩放铺满，故此值只影响路径几何比例，不决定最终像素尺寸。
   */
  baseWidth?: number;
  /**
   * 椭圆 / 矩形 / 无穷 / 波浪 的横向半径（px·基于 baseWidth），默认 700。
   */
  radiusX?: number;
  /**
   * 椭圆 / 矩形 / 无穷 / 波浪 的纵向半径（px·基于 baseWidth），默认 170。
   */
  radiusY?: number;
  /**
   * 圆 / 方 / 三角 / 星 / 心 的半径（px·基于 baseWidth），默认 300。
   */
  radius?: number;
  /**
   * star 形状的角数，默认 5。
   */
  starPoints?: number;
  /**
   * star 形状的内外半径比（0–1），越小星芒越尖，默认 0.5。
   */
  starInnerRatio?: number;
  /**
   * 整条轨道的倾斜角（deg），默认 -8。子项会反向自转以保持正立。
   */
  rotation?: number;
  /**
   * 跑完一整圈的时长（秒），默认 40。越大越慢。
   */
  duration?: number;
  /**
   * 单个子项的边长（px·CSS 像素），默认 64。
   */
  itemSize?: number;
  /**
   * 流转方向，"normal"=正向，"reverse"=反向，默认 "normal"。
   */
  direction?: "normal" | "reverse";
  /**
   * 是否把子项等距铺满整条轨道（true），还是从同一起点鱼贯出发（false），默认 true。
   */
  fill?: boolean;
  /**
   * 是否描出轨道路径（调试/装饰用），默认 false。
   */
  showPath?: boolean;
  /**
   * 轨道描边颜色，默认 "var(--color-border)"（吃主题）。
   */
  pathColor?: string;
  /**
   * 轨道描边宽度（px·基于 baseWidth 坐标系），默认 2。
   */
  pathWidth?: number;
  /**
   * 居中内容（如 Logo / 标题），叠在轨道之上、不随轨道旋转。
   */
  centerContent?: ReactNode;
  /**
   * 透传到根容器的额外 className。
   */
  className?: string;
  /**
   * 透传到根容器的内联样式（容器默认 1:1 自适应铺满父级宽度）。
   */
  style?: CSSProperties;
}
