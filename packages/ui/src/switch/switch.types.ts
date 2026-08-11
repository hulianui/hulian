import type { HTMLAttributes, ReactNode } from "react";

/**
 * 继承根节点原生属性（`id` / `data-*` / `aria-*` / `onFocus` / `onBlur` …）。
 * 实现早就在往下展开 rest，此前只是类型把口封死了（#157）。
 */
export interface SwitchProps extends HTMLAttributes<HTMLElement> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  /**
   * 可选 inline label（轨道右侧，`<label>` 原生关联）。同 Checkbox / Radio 的口径。
   * 「开/关两态各一段文字」不是这个 prop 的语义，那种请自己在外层排版。
   */
  label?: ReactNode;
  /** 与 `label` 等价的写法：`<Switch checked={v}>启用</Switch>`。两者同时给时 `label` 优先。 */
  children?: ReactNode;
  id?: string;
  className?: string;
  "aria-label"?: string;
  /** 视觉尺寸，默认 md（轨道 40×24，与加这个 prop 之前逐像素一致）。 */
  size?: "sm" | "md" | "lg";
  /**
   * 扩出一块不可见的 ≥44px 命中区（只影响命中，不占布局、不改视觉）。
   * 移动端建议开：md 轨道只有 24px 高，低于触控目标推荐值。
   * 默认关，因为它会向上下各溢出约 10px，紧密排布的桌面表单里可能压到相邻控件。
   */
  touchTarget?: boolean;
}
