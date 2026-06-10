import type { CSSProperties, ReactNode } from "react";

/** 缓动风格：弹性回弹（elastic）或顺滑平移（smooth）。 */
export type CardSwapEasing = "elastic" | "smooth";

/**
 * 堆叠在父容器中的定位方式：
 * - "bottom-right"：React Bits 原版——右下角锚定并向外溢出 5%/18%，适合营销页贴边构图。
 * - "center"：按错位距离计算整摞包围盒并居中，堆叠完整可见，适合画廊/普通容器。
 */
export type CardSwapPlacement = "bottom-right" | "center";

export interface CardSwapProps {
  /**
   * 卡片堆叠尺寸——单张卡片的宽度（px），默认 380。
   * 所有卡片同尺寸，整体堆叠以右下角为锚点。
   */
  width?: number;
  /**
   * 单张卡片的高度（px），默认 280。
   */
  height?: number;
  /**
   * 相邻卡片在水平 + 纵深（X/Z）方向的错位距离（px），默认 56。
   * 越大堆叠越「散开」，越小越「贴合」。
   */
  cardDistance?: number;
  /**
   * 相邻卡片在垂直方向（Y）的错位距离（px），默认 64。
   * 控制堆叠向上展开的台阶高度。
   */
  verticalDistance?: number;
  /**
   * 每次自动轮换的间隔（毫秒），默认 5000。
   * 到点后最前卡片下坠、其余卡片向前递进、原前卡回到队尾。
   */
  delay?: number;
  /**
   * 鼠标悬停时是否暂停轮换，默认 false。
   * 开启后 mouseenter 停、mouseleave 续。
   */
  pauseOnHover?: boolean;
  /**
   * 卡片倾斜角（deg，skewY），默认 5，制造透视纵深感。传 0 即正视。
   */
  skewAmount?: number;
  /**
   * 缓动风格，默认 "elastic"（弹性回弹）。
   * "smooth" 为顺滑无回弹（节奏更克制，适合企业场景）。
   */
  easing?: CardSwapEasing;
  /**
   * 堆叠在父容器中的定位方式，默认 "bottom-right"（原版右下锚定外溢）。
   * 在画廊预览 / 普通卡片容器等需要完整看到整摞卡片的场景请用 "center"。
   */
  placement?: CardSwapPlacement;
  /**
   * 点击某张卡片时回调，参数为该卡片在 children 中的原始索引。
   */
  onCardClick?: (index: number) => void;
  /**
   * 堆叠的卡片内容，建议用 <CardSwap.Card> 或任意元素；至少 2 张才会轮换。
   */
  children?: ReactNode;
  /**
   * 透传到根容器的额外 className（根容器以右下角为定位锚点，透视已内置）。
   */
  className?: string;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
}
