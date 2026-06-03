import type { ReactNode } from "react";
import type { UniqueIdentifier } from "@dnd-kit/core";

export interface SortableProps<T> {
  /** 受控数据数组；拖拽后通过 onChange 回吐新顺序（由你写回 state）。 */
  items: T[];
  /** 取每项稳定 id，默认读 `item.id`。id 必须在列表内唯一且稳定。 */
  getId?: (item: T) => UniqueIdentifier;
  /** 顺序变化回调（拖拽或键盘移动均触发），参数是 arrayMove 后的新数组。 */
  onChange: (items: T[]) => void;
  /** 渲染单项内容；state.dragging 表示该项正被拖拽。 */
  renderItem: (item: T, state: { dragging: boolean }) => ReactNode;
  /** 排列方向，默认 vertical。 */
  orientation?: "vertical" | "horizontal";
  /** true=仅左侧手柄可拖（触屏/含交互元素的行推荐）；false=整项可拖。默认 false。 */
  handle?: boolean;
  className?: string;
}
