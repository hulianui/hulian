/** 面板视图层级，透传 MUI X 的 `views`。 */
export type DatePickerView = "year" | "month" | "day";

export interface DatePickerProps {
  /** ISO 字符串；受控值 */
  value?: string | null;
  /** ISO 字符串；非受控默认值 */
  defaultValue?: string;
  /** 瑚琏命名受控回调（替代 MUI onChange(value)）；回传 ISO 或 null */
  onValueChange?: (iso: string | null) => void;
  /** 可选最早日期（ISO） */
  minDate?: string;
  /** 可选最晚日期（ISO） */
  maxDate?: string;
  /**
   * 逐日禁用判定，入参是 `"YYYY-MM-DD"`。与 `minDate`/`maxDate` 是「或」关系。
   * 此前只有 `DateRangePicker` 有这条口子，单日期版反而没有。
   */
  disabledDate?: (isoDate: string) => boolean;
  /**
   * 面板视图层级，默认 `["year", "day"]`（MUI 默认）。
   * 只选年份传 `["year"]`、只选年月传 `["year", "month"]` —— 后者对上 el-date-picker 的
   * `type="month"` / `type="year"`，此前完全没法表达。
   */
  views?: DatePickerView[];
  /** 打开时停在哪一层视图（须是 `views` 的成员）。 */
  openTo?: DatePickerView;
  /**
   * 输入框显示格式（dayjs format 串），如 `"YYYY 年 M 月 D 日"`。
   * **只影响显示**，`onValueChange` 回传的仍是完整 ISO 时间戳。
   */
  format?: string;
  disabled?: boolean;
  readOnly?: boolean;
  /** 输入框 label */
  label?: string;
  className?: string;
}
