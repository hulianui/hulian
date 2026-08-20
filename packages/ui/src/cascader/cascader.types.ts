import type { ComponentPropsWithoutRef } from "react";
import type { TreeNode } from "../tree/tree-core";

/**
 * 未列出的原生属性（`aria-*` / `data-*` / `id` / `title` / `onBlur` …）落到**触发器按钮**上，
 * 而不是外层容器 —— 读屏念的、能聚焦的都是它（#293）。`Field required` 注进来的
 * `aria-required` 也走这条路，此前被封闭 props 静默吃掉。
 */
export interface CascaderProps
  extends Omit<
    ComponentPropsWithoutRef<"button">,
    "value" | "defaultValue" | "onChange" | "disabled" | "className" | "children" | "role"
  > {
  nodes: TreeNode[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (path: string[], nodes: TreeNode[]) => void;
  expandTrigger?: "click" | "hover";
  changeOnSelect?: boolean;
  /** 浮层顶部出搜索框：输入时把树扁平成叶子路径模糊匹配，命中以扁平行展示，选中即提交全路径。 */
  showSearch?: boolean;
  searchPlaceholder?: string;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}
