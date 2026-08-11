import type { HTMLAttributes, ReactNode } from "react";

/**
 * 继承根节点原生属性（`id` / `data-*` / `aria-*` / `onFocus` / `onBlur` …）。
 * 实现早就在往下展开 rest，此前只是类型把口封死了（#157）。
 */
export interface RadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  /** 仅控布局，默认 vertical。 */
  orientation?: "vertical" | "horizontal";
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
}

export interface RadioProps extends HTMLAttributes<HTMLElement> {
  /** 必填，标识该选项。 */
  value: string;
  disabled?: boolean;
  /** 可选 inline label（点右，<label> 原生关联）。 */
  label?: ReactNode;
  /**
   * 与 `label` 等价的写法：`<Radio value="1">审核通过</Radio>`。
   * 两者同时给时 `label` 优先。
   */
  children?: ReactNode;
  id?: string;
  /** 落在点 Radio.Root。 */
  className?: string;
  /**
   * 无障碍名。**不给 label、或 label 是图标/纯视觉内容时必须给** ——
   * 否则读屏用户听到的只是「单选按钮」，拿不到这是哪个选项。
   */
  "aria-label"?: string;
  /** 用页面上已有元素充当名字（填其 id）。与 aria-label 二选一。 */
  "aria-labelledby"?: string;
  /** 补充描述（填元素 id），如该选项的说明文字。 */
  "aria-describedby"?: string;
}
