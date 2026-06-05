import type { CSSProperties, ReactNode } from "react";

export interface TiltedCardProps {
  /** 卡面图片地址。传了即渲染一张铺满的 `<img>`；也可只用 `children` 自定义卡面而不传图。 */
  imageSrc?: string;
  /** 图片 alt 文案（无障碍）。 */
  altText?: string;
  /** 跟随指针的浮动提示文案；为空则不渲染提示气泡。 */
  captionText?: ReactNode;
  /** 外层透视容器高度。默认 `"300px"`。 */
  containerHeight?: CSSProperties["height"];
  /** 外层透视容器宽度。默认 `"100%"`。 */
  containerWidth?: CSSProperties["width"];
  /** 倾斜卡面高度。默认 `"300px"`。 */
  cardHeight?: CSSProperties["height"];
  /** 倾斜卡面宽度。默认 `"300px"`。 */
  cardWidth?: CSSProperties["width"];
  /** 悬停时整体放大倍数。默认 `1.1`。 */
  scaleOnHover?: number;
  /** 倾斜最大角度（度）。越大越「立体」。默认 `14`。 */
  rotateAmplitude?: number;
  /** 是否渲染跟随指针的浮动提示气泡。默认 `true`。 */
  showTooltip?: boolean;
  /** 浮于卡面之上、随倾斜一同 3D 抬升的叠加内容（如标题/角标）。 */
  overlayContent?: ReactNode;
  /** 是否显示 `overlayContent`。默认 `false`。 */
  displayOverlayContent?: boolean;
  /** 卡面内容（与 `imageSrc` 二选一或叠加，置于图片之上、overlay 之下）。 */
  children?: ReactNode;
  /** 合并到外层 `<figure>` 的额外类名。 */
  className?: string;
  /** 额外内联样式（合并到外层透视容器）。 */
  style?: CSSProperties;
}
