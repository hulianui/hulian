import type { HTMLAttributes, ReactNode } from "react";

/**
 * 继承根节点原生属性（`id` / `data-*` / `aria-*` / `onFocus` / `onBlur` …）。
 * 实现早就在往下展开 rest，此前只是类型把口封死了（#157）。
 */
export interface CheckboxProps extends HTMLAttributes<HTMLElement> {
  checked?: boolean;
  defaultChecked?: boolean;
  /** 第三态：半选（Base UI 原生 indeterminate）。 */
  indeterminate?: boolean;
  /** 瑚琏收敛签名（丢 Base UI 的 eventDetails，同 Switch 风格）。 */
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  id?: string;
  /** 可选 inline label（盒右，<label> 原生关联）。 */
  label?: ReactNode;
  /**
   * 与 `label` 等价的写法：`<Checkbox checked={v}>同意条款</Checkbox>`。
   * 两者同时给时 `label` 优先。
   */
  children?: ReactNode;
  /**
   * 尺寸档，方盒与内置勾号一起缩放（#199）。勾号此前是独立写死的 14px，才是方盒压不下去的原因：
   * 盒子改小勾号会顶满溢出。@default "md"（方盒 20px / 勾号 14px / label text-sm）
   * `"sm"` 是 16px / 12px / text-xs，对齐 Input、SelectTrigger 的 size="sm"。
   */
  size?: "sm" | "md";
  /** 落在盒子 Checkbox.Root。 */
  className?: string;
  /**
   * 落在文字 `<span>`，用来改字号 / 颜色（`className` 够不到它——那个落在方盒上）。
   * 密集界面里的说明性文案常是 `text-xs text-muted-foreground`，`size` 收不住的再用它收尾。
   */
  labelClassName?: string;
  /** 透传到 Checkbox.Root（树等场景置 -1 退出 Tab 序，焦点由容器 roving 接管）。 */
  tabIndex?: number;
  "aria-label"?: string;
}
