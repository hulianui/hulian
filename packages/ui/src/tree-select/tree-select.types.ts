import type { ComponentPropsWithoutRef } from "react";
import type { TreeNode } from "../tree/tree-core";

/**
 * 未列出的原生属性（`aria-*` / `data-*` / `id` / `title` / `onBlur` …）落到**触发器按钮**上 ——
 * 读屏念的、能聚焦的都是它。`Field required` 注进来的 `aria-required` 也走这条路（#293）。
 */
export interface TreeSelectProps
  extends Omit<
    ComponentPropsWithoutRef<"button">,
    "value" | "defaultValue" | "onChange" | "disabled" | "className" | "children" | "role"
  > {
  nodes: TreeNode[];
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  size?: "sm" | "md" | "lg";
  /**
   * 是否可清除（默认 `false`）。开启后有值且未禁用时，触发器右侧 hover/聚焦会浮出清除按钮，
   * 点击回到未选态：单选回传 `""`、多选回传 `[]`。
   * 用于「可留空的层级筛选维度」——留空即不限；与 Select 的 `clearable` 语义一致。
   */
  clearable?: boolean;
  searchable?: boolean;
  /**
   * 什么东西触发展开/收起，透传给内部 [Tree](../tree/tree.md)，默认 `"row"`（点整行）。
   * **单选下 `"row"` 意味着只有叶子选得中** —— 有子节点的行点了只展开，永远不回传 `onChange`。
   * 需要「选到中间层」（选到某个部门 / 某个大类 / 某一册）就传 `"icon"`：箭头管展开、
   * 行的其余部分管选中，与多选态「勾选框管选、行管展开」在心智上对称。
   */
  expandTrigger?: "row" | "icon";
  showLine?: boolean;
  className?: string;
}
