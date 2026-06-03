export interface TimeFieldProps {
  /** ISO 字符串；受控值 */
  value?: string | null;
  /** ISO 字符串；非受控默认值 */
  defaultValue?: string;
  /** 瑚琏命名受控回调（替代 MUI onChange(value)）；回传 ISO 或 null */
  onValueChange?: (iso: string | null) => void;
  disabled?: boolean;
  readOnly?: boolean;
  /** 输入框 label */
  label?: string;
  className?: string;
}
