import type { HTMLAttributes } from "react";

/**
 * 继承根节点原生属性（`id` / `data-*` / `aria-*` / `onFocus` / `onBlur` …）。
 * 表单受控件必须能接 react-hook-form 的 `Controller` —— 尤其 `field.onBlur` 传不进去时
 * `touchedFields` 永不更新、`mode: "onBlur"` 的表单静默失效（#157）。
 */
export interface TimeFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /**
   * 受控值，`"HH:mm"` 或 `"HH:mm:ss"`（随 `withSeconds`）。24 小时制、定宽补零。
   * 定宽 → 字典序即时间序，`minTime`/`maxTime` 的比较可以直接比字符串。
   */
  value?: string | null;
  /** 非受控初始值，形状同 `value`。 */
  defaultValue?: string | null;
  /**
   * 值变化回调。**只有整段输完才触发**：输了小时还没输分钟时不会回调，
   * 清空则回传 `null`。
   */
  onValueChange?: (value: string | null) => void;
  /** 显示秒段，值形状随之变成 `"HH:mm:ss"`。@default false */
  withSeconds?: boolean;
  /** 输入框尺寸档，刻度与 `Input` 一致（32 / 40 / 48px）。@default "md" */
  size?: "sm" | "md" | "lg";
  /** 最早可选时刻（含），形状同 `value`。整段输完后钳制，不做段级限制。 */
  minTime?: string;
  /** 最晚可选时刻（含），形状同 `value`。 */
  maxTime?: string;
  /** 显示清除按钮（有值且非 disabled/readOnly 时才出现）。@default true */
  clearable?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  /** 整个输入框的无障碍名（各段自带「小时/分钟/秒」标签）。 */
  "aria-label"?: string;
  className?: string;
}
