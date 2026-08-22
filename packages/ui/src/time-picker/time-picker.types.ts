import type { ComponentPropsWithoutRef } from "react";

/**
 * 未列出的原生属性（`aria-*` / `data-*` / `id` / `title` / `onBlur` …）落到**触发器按钮**上 ——
 * 读屏念的、能聚焦的都是它。`Field required` 注进来的 `aria-required` 也走这条路（#315，
 * 与 #293 同一条链：TimePicker 当时漏在名单外）。
 */
export interface TimePickerProps
  extends Omit<
    ComponentPropsWithoutRef<"button">,
    "value" | "defaultValue" | "onChange" | "disabled" | "className" | "children" | "role"
  > {
  /**
   * 受控值，`"HH:mm"` 或 `"HH:mm:ss"`（随 `withSeconds`）。24 小时制、定宽补零。
   * 定宽 → 字典序即时间序，`minTime`/`maxTime` 的比较可以直接比字符串。
   */
  value?: string | null;
  /** 非受控初始值，形状同 `value`。 */
  defaultValue?: string | null;
  /** 选中/清空回调；清空回传 `null`。 */
  onValueChange?: (value: string | null) => void;
  /** 显示秒列，值形状随之变成 `"HH:mm:ss"`。@default false */
  withSeconds?: boolean;
  /** 触发器尺寸档，刻度与 `Input` 一致（32 / 40 / 48px）。@default "md" */
  size?: "sm" | "md" | "lg";
  /** 分钟列步进（如 5 / 15 / 30）。@default 1 */
  minuteStep?: number;
  /** 秒列步进。@default 1 */
  secondStep?: number;
  /** 最早可选时刻（含），形状同 `value`。 */
  minTime?: string;
  /** 最晚可选时刻（含），形状同 `value`。 */
  maxTime?: string;
  /** 触发器占位文本。@default "选择时间" */
  placeholder?: string;
  /** 显示清除按钮（有值且非 disabled/readOnly 时才出现）。@default true */
  clearable?: boolean;
  /** 面板底部的「此刻」快捷（会按步进向下取整对齐）。@default true */
  showNow?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  /** 触发器无障碍名（无可见 label 时给）。 */
  "aria-label"?: string;
  className?: string;
}
