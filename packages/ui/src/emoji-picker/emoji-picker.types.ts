import type { HTMLAttributes } from "react";

/**
 * 继承根节点原生属性（`id` / `data-*` / `aria-*` / `onFocus` / `onBlur` …）。
 * 表单受控件必须能接 react-hook-form 的 `Controller` —— 尤其 `field.onBlur` 传不进去时
 * `touchedFields` 永不更新、`mode: "onBlur"` 的表单静默失效（#157）。
 */
export interface EmojiPickerProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** 选中某个 emoji 的回调。 */
  onSelect?: (emoji: string) => void;
  /** 网格列数。@default 8 */
  columns?: number;
  /** 是否显示搜索框。@default true */
  searchable?: boolean;
  /** 初始分类 key（省略为第一个分类）。 */
  defaultCategory?: string;
  /** 受控「最近使用」列表；省略则组件内部维护。 */
  recent?: string[];
  /** 搜索框 placeholder。 */
  searchPlaceholder?: string;
  className?: string;
}
