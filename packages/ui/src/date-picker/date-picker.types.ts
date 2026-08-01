import type { CalendarPicker } from "../calendar/calendar.types";

export interface DatePickerProps {
  /**
   * 受控值。形状随 `picker` 变化：
   * `"date"` → `"YYYY-MM-DD"`；`"month"` → `"YYYY-MM"`；`"year"` → `"YYYY"`。
   * 定宽文本 → 字典序即时间序，区间比较可直接比字符串，避开时区/UTC 日界坑。
   */
  value?: string | null;
  /** 非受控初始值，形状同 `value`。 */
  defaultValue?: string | null;
  /** 选中/清空回调；清空回传 `null`。 */
  onValueChange?: (value: string | null) => void;
  /** 选择粒度。@default "date" */
  picker?: CalendarPicker;
  /** 可选最早日期（任意可解析日期串，内部规范化）。 */
  minDate?: string;
  /** 可选最晚日期。 */
  maxDate?: string;
  /**
   * 逐日禁用判定，入参恒为 `"YYYY-MM-DD"`（`month`/`year` 粒度下传该月/该年的首日）。
   * 与 `minDate`/`maxDate` 是「或」关系：任一命中即禁用。
   */
  disabledDate?: (isoDate: string) => boolean;
  /** 触发器占位文本。@default 随 picker 变化 */
  placeholder?: string;
  /**
   * 触发器上的显示格式（dayjs format 串）。不传时随 `picker` 取
   * `"YYYY-MM-DD"` / `"YYYY-MM"` / `"YYYY"`。**只影响显示**，对外值形状不变。
   */
  displayFormat?: string;
  /** 显示清除按钮（有值且非 disabled/readOnly 时才出现）。@default true */
  clearable?: boolean;
  /** 面板底部的「今天 / 本月 / 今年」快捷按钮。@default true */
  showToday?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  /** 触发器无障碍名（无可见 label 时给）。 */
  "aria-label"?: string;
  className?: string;
}
