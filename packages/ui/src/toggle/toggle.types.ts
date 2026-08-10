import type { HTMLAttributes, ReactNode } from "react";

/**
 * 继承根节点原生属性（`id` / `data-*` / `aria-*` / `onFocus` / `onBlur` …）。
 * 实现早就在往下展开 rest，此前只是类型把口封死了（#157）。
 */
export interface ToggleProps extends HTMLAttributes<HTMLElement> {
  /** 受控按下态。 */
  pressed?: boolean;
  /** 非受控初始按下态。 */
  defaultPressed?: boolean;
  /** 瑚琏收敛签名（丢 Base UI eventDetails，同 Switch 风格）。 */
  onPressedChange?: (pressed: boolean) => void;
  disabled?: boolean;
  /** 在 ToggleGroup 内标识该项。 */
  value?: string;
  /** default=灰底软选中 / outline=主色实心 / pill=圆角描边 + soft 主色选中(AI 工具栏开关风) */
  variant?: "default" | "outline" | "pill";
  size?: "sm" | "md";
  className?: string;
  children?: ReactNode;
  "aria-label"?: string;
}

export interface ToggleGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  /** 受控：已按下项 value 数组。 */
  value?: string[];
  /** 非受控初始按下项数组。 */
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  disabled?: boolean;
  /** true=多选共存；false(默认)=单选互斥。 */
  multiple?: boolean;
  orientation?: "horizontal" | "vertical";
  className?: string;
  children?: ReactNode;
}
