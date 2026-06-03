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
  disabled?: boolean;
  readOnly?: boolean;
  /** 输入框 label */
  label?: string;
  className?: string;
}
