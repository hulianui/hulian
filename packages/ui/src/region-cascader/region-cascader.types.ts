import type { ComponentPropsWithoutRef } from "react";

/**
 * 未列出的原生属性（`aria-*` / `data-*` / `id` / `title` / `onBlur` …）落到**触发器按钮**上 ——
 * 读屏念的、能聚焦的都是它。`Field required` 注进来的 `aria-required` 也走这条路（#293）。
 */
export interface RegionCascaderProps
  extends Omit<
    ComponentPropsWithoutRef<"button">,
    "value" | "defaultValue" | "onChange" | "disabled" | "className" | "children" | "role"
  > {
  /** 受控值：行政区划 code 路径，如 ["11","1101","110101"]。 */
  value?: string[];
  defaultValue?: string[];
  /** 变更回调：同时给 code 路径与名称路径（表单常存名称）。 */
  onChange?: (codes: string[], names: string[]) => void;
  /** 联动层级：3=省/市/区县（默认）；2=省/市。 */
  level?: 2 | 3;
  /** 浮层内搜索框（默认开）：输"浦东"直达。 */
  showSearch?: boolean;
  /** 允许选到中间级即提交（不必到末级）。 */
  changeOnSelect?: boolean;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
}
