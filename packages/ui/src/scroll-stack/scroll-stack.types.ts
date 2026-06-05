import type { CSSProperties, ReactNode } from "react";

export interface ScrollStackItemProps {
  /** 卡片内容 */
  children?: ReactNode;
  /** 追加到单张卡片外层的自定义类名 */
  itemClassName?: string;
}

export interface ScrollStackProps {
  /**
   * 卡片内容。建议用 `ScrollStackItem` 包裹每张卡，组件会自动识别
   * `data-scroll-stack-card` 标记的元素并参与堆叠计算。
   */
  children?: ReactNode;
  /**
   * 相邻卡片之间的初始垂直间距（px）。值越大，未堆叠时卡片铺得越开。
   * @default 100
   */
  itemDistance?: number;
  /**
   * 每张卡片相对前一张的目标缩放增量。索引越大的卡片最终缩放越接近 1，
   * 形成"后压前、层层递进"的纵深感。
   * @default 0.03
   */
  itemScale?: number;
  /**
   * 卡片在堆叠区内被钉住时彼此错开的垂直距离（px），决定堆叠后露出的"卡边"高度。
   * @default 30
   */
  itemStackDistance?: number;
  /**
   * 触发钉住的位置，相对滚动容器高度的百分比字符串（如 "20%"）或像素值。
   * 卡片顶部滚到该位置时开始被钉住堆叠。
   * @default "20%"
   */
  stackPosition?: string;
  /**
   * 缩放动画结束的位置，百分比字符串或像素值。卡片顶部越过此处时缩放达到目标值。
   * @default "10%"
   */
  scaleEndPosition?: string;
  /**
   * 最底层（首张）卡片的基础缩放值，后续卡片在此基础上按 `itemScale` 递增。
   * @default 0.85
   */
  baseScale?: number;
  /**
   * 每层堆叠卡片之间的旋转增量（deg）。0 表示不旋转，正值产生扑克牌式扇形错位。
   * @default 0
   */
  rotationAmount?: number;
  /**
   * 被压在下方卡片的模糊增量（px）。>0 时越靠下的卡片越模糊，强化景深。
   * 注意：reduced-motion 下会自动关闭以减轻视觉负担。
   * @default 0
   */
  blurAmount?: number;
  /**
   * 堆叠完成（最后一张卡进入钉住区）时触发的回调，可用于联动后续动效。
   */
  onStackComplete?: () => void;
  /** 追加到滚动容器根节点的自定义类名 */
  className?: string;
  /** 透传到滚动容器根节点的内联样式 */
  style?: CSSProperties;
}
