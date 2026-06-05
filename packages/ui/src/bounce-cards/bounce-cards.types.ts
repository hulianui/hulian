import type { CSSProperties, ReactNode } from "react";

export interface BounceCardsProps {
  /**
   * 卡片图片地址数组（按顺序对应 transformStyles）。
   * 也可不传 images 而用 children 自定义卡片内容（两者互斥，优先 children）。
   */
  images?: string[];
  /**
   * 自定义卡片内容数组，每项渲染进一张卡片（覆盖 images 的 <img> 渲染）。
   * 数量决定卡片张数；与 transformStyles 按下标对齐。
   */
  children?: ReactNode[];
  /** 容器宽度（px），默认 400。 */
  containerWidth?: number;
  /** 容器高度（px），默认 400。 */
  containerHeight?: number;
  /**
   * 入场动画起始延迟（秒），默认 0.5。
   * 卡片从 scale 0 弹入前的整体等待。
   */
  animationDelay?: number;
  /**
   * 入场逐张错峰间隔（秒），默认 0.06。
   * 越大每张卡片弹入的时间差越明显。
   */
  animationStagger?: number;
  /**
   * 每张卡片的扇形铺开 transform（按下标对齐 images/children）。
   * 默认五张牌的旋转 + 横移；卡片张数超过数组长度的部分回退到无变换。
   * 例：'rotate(10deg) translate(-170px)'
   */
  transformStyles?: string[];
  /**
   * 是否开启 hover 推挤交互（悬停某张时它回正、两侧卡片向外让位），默认 true。
   */
  enableHover?: boolean;
  /**
   * hover 时两侧卡片向外让位的横向位移（px），默认 160。
   */
  pushDistance?: number;
  /** 透传到根容器的额外 className。 */
  className?: string;
  /** 透传到根容器的内联样式。 */
  style?: CSSProperties;
}
