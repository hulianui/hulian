import type { ReactNode } from "react";

export interface VirtualListProps<T> {
  items: T[];
  /** 行高 px（定高），或 (index)=>px（变高估算，将按实测校正）。 */
  itemHeight: number | ((index: number) => number);
  renderItem: (item: T, index: number) => ReactNode;
  /** 视口高度，px 或 CSS 长度。默认 360。 */
  height?: number | string;
  /** 预渲染屏外条数，默认 5。 */
  overscan?: number;
  /** 行 key 提取，缺省用下标。 */
  getKey?: (item: T, index: number) => string | number;
  /** 末行进入视口时回调（配合无限加载）。 */
  onReachEnd?: () => void;
  className?: string;
}
