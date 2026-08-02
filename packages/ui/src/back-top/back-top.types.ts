import type { ReactNode } from "react";

export interface BackTopProps {
  /** Accessible label for the back-to-top action. */
  "aria-label"?: string;
  /** 滚动监听 & 回顶的目标容器，默认 window。返回容器元素（或 window）。 */
  target?: () => HTMLElement | Window | null;
  /** 滚动超过该高度(px)才淡入显示，默认 400。 */
  visibilityHeight?: number;
  /** 点击回顶后的回调（在滚动触发之后）。 */
  onClick?: () => void;
  /** 自定义悬浮按钮内容，默认上箭头图标。 */
  children?: ReactNode;
  className?: string;
}
