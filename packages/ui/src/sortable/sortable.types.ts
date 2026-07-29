import type { ReactNode } from "react";
import type { UniqueIdentifier } from "@dnd-kit/core";

/** 传给 renderItem 的每项状态。 */
export interface SortableItemState {
  /** 该项是否正被拖拽（可据此加高亮/降透明度）。 */
  dragging: boolean;
  /**
   * 该项在当前 items 中的下标（0 起）。用于展示序号（`第 {index + 1} 题`），
   * 以及给行内控件拼唯一 aria-label——多行同名（如「分值」）读屏无法区分。
   * 组件 map 时本就有这个值，无需消费方再 `items.findIndex` 兜回来（O(n²)）。
   */
  index: number;
}

export interface SortableProps<T> {
  /** 受控数据数组；拖拽后通过 onChange 回吐新顺序（由你写回 state）。 */
  items: T[];
  /** 取每项稳定 id，默认读 `item.id`。id 必须在列表内唯一且稳定。 */
  getId?: (item: T) => UniqueIdentifier;
  /** 顺序变化回调（拖拽或键盘移动均触发），参数是 arrayMove 后的新数组。 */
  onChange: (items: T[]) => void;
  /** 渲染单项内容；state 给出该项的拖拽态与下标（见 SortableItemState）。 */
  renderItem: (item: T, state: SortableItemState) => ReactNode;
  /** 排列方向，默认 vertical。 */
  orientation?: "vertical" | "horizontal";
  /**
   * true=仅左侧手柄可拖；false=整项可拖。默认 false。
   * 注意：行内交互元素（input/button/select/contenteditable 等）已由组件内部守卫放行，
   * 默认值下也不会被拖拽劫持——handle 现在是「触屏体验/明确抓手」的取向选择，
   * 不再是「避免劫持子元素」的必需补丁。
   */
  handle?: boolean;
  className?: string;
}
