export interface ColorPickerProps {
  /** hex 受控值，如 "#3b82f6"。传入即进入受控模式。 */
  value?: string;
  /** 非受控初始值，默认 "#3b82f6"。 */
  defaultValue?: string;
  /** 颜色变更回调，参数为 hex 字符串。 */
  onValueChange?: (hex: string) => void;
  /** 禁用：罩层 + 屏蔽交互。 */
  disabled?: boolean;
  /** 是否显示十六进制文本输入（默认 true）。 */
  showInput?: boolean;
  className?: string;
}
