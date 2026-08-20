import type { ComponentPropsWithoutRef } from "react";

/**
 * 未列出的原生属性（`aria-*` / `data-*` / `id` / `title` / `onBlur` …）落到**触发器按钮**上 ——
 * 读屏念的、能聚焦的都是它。`Field required` 注进来的 `aria-required` 也走这条路（#293）。
 */
export interface DateTimePickerProps
  extends Omit<
    ComponentPropsWithoutRef<"button">,
    "value" | "defaultValue" | "onChange" | "disabled" | "className" | "children" | "role"
  > {
  /**
   * 受控值，`"YYYY-MM-DD HH:mm"`（`withSeconds` 时为 `"YYYY-MM-DD HH:mm:ss"`）。
   * 定宽文本 → 字典序即时间序，范围比较可直接比字符串，避开时区/UTC 日界坑。
   */
  value?: string | null;
  /** 非受控初始值，形状同 `value`。 */
  defaultValue?: string | null;
  /** 选中/清空回调；清空回传 `null`。 */
  onValueChange?: (value: string | null) => void;
  /** 显示秒列，值形状随之带秒。@default false */
  withSeconds?: boolean;
  /** 触发器尺寸档，刻度与 `Input` 一致（32 / 40 / 48px）。@default "md" */
  size?: "sm" | "md" | "lg";
  /** 分钟列步进（如 5 / 15 / 30）。@default 1 */
  minuteStep?: number;
  /** 秒列步进。@default 1 */
  secondStep?: number;
  /** 最早可选时刻（含），形状同 `value`。日期部分限制日历，时间部分只在边界那天生效。 */
  minDateTime?: string;
  /** 最晚可选时刻（含），形状同 `value`。 */
  maxDateTime?: string;
  /**
   * 逐日禁用判定，入参恒为 `"YYYY-MM-DD"`（只筛日期，不筛时刻）。
   * 与 `minDateTime`/`maxDateTime` 是「或」关系。
   */
  disabledDate?: (isoDate: string) => boolean;
  /** 触发器占位文本。@default "选择日期时间" */
  placeholder?: string;
  /**
   * 触发器上的显示格式（dayjs format 串）。不传时按值原样显示。
   * **只影响显示**，对外值形状不变。
   */
  displayFormat?: string;
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
